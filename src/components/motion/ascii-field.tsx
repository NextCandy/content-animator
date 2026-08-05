"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const PHRASES = [
  "ONE MEDIA FIELD ONE SHAPE",
  "FETCH LAYER SOLVED",
  "A PAGE BUILDER WITH GUARDRAILS",
  "SCHEMA AS A SYSTEM",
  "WIRED UP NOT JUST CLONED",
  "SEO DONE NOT DEFERRED",
  "AGENT-NATIVE NO DRIFT",
  "THE HARD FIELDS ALREADY BUILT",
];
const CHARS = "/#*_·-+=<>[]{}01";

function randomCell() {
  if (Math.random() < 0.22) {
    const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)]!;
    return phrase[Math.floor(Math.random() * phrase.length)]!;
  }
  if (Math.random() < 0.55) return " ";
  return CHARS[Math.floor(Math.random() * CHARS.length)]!;
}

/**
 * Live monospace ASCII character field drawn on a canvas.
 * Shimmers a few percent of cells per frame at ~13fps, pauses offscreen,
 * and renders a single static frame under prefers-reduced-motion.
 */
export function AsciiField({
  className,
  color = "rgba(255,255,255,0.11)",
  fontSize = 13,
  density = 0.04,
}: {
  className?: string;
  /** Glyph color. */
  color?: string;
  /** Glyph font size in CSS pixels. */
  fontSize?: number;
  /** Fraction of cells replaced each frame. */
  density?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cellW = fontSize * 0.62;
    const cellH = fontSize * 1.5;

    let cols = 0;
    let rows = 0;
    let grid: string[] = [];
    let visible = true;
    let raf = 0;
    let last = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px var(--font-mono, ui-monospace), monospace`;
      ctx.textBaseline = "top";
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ch = grid[r * cols + c];
          if (!ch || ch === " ") continue;
          ctx.fillText(ch, c * cellW, r * cellH);
        }
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cellW);
      rows = Math.ceil(h / cellH);
      grid = Array.from({ length: cols * rows }, randomCell);
      draw();
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || now - last < 1000 / 13) return;
      last = now;
      const changes = Math.max(1, Math.floor(grid.length * density));
      for (let i = 0; i < changes; i++) {
        grid[Math.floor(Math.random() * grid.length)] = randomCell();
      }
      draw();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    let io: IntersectionObserver | undefined;
    if (!reduce) {
      io = new IntersectionObserver(
        ([entry]) => {
          visible = entry?.isIntersecting ?? false;
        },
        { threshold: 0 },
      );
      io.observe(parent);
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
    };
  }, [color, fontSize, density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none block size-full", className)}
    />
  );
}
