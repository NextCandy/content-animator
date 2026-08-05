"use client";

import { useEffect, useRef } from "react";
import { ASCII_PHRASES } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const LOOSE_CHARS = "/#*_·-+=<>[]{}01";

/**
 * Live monospace ASCII character field drawn on a canvas.
 *
 * The field is a sparse layer of readable uppercase phrases from the site's own
 * copy, plus a minority of loose single characters for texture. Roughly half of
 * the cells stay empty so the field breathes and never competes with the
 * foreground copy. A few phrases mutate per frame at ~13fps, the loop pauses
 * offscreen, and a single static frame renders under prefers-reduced-motion.
 */
export function AsciiField({
  className,
  color = "rgba(255,255,255,0.07)",
  fontSize = 13,
  density = 0.0035,
  seed = 0,
}: {
  className?: string;
  /** Glyph color. Keep the alpha low: this is texture, not content. */
  color?: string;
  /** Glyph font size in CSS pixels. */
  fontSize?: number;
  /** Phrases per cell — drives how many phrases fill the grid. */
  density?: number;
  /** Change this value to reshuffle the whole field. */
  seed?: number;
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
    let phraseCount = 0;
    let visible = true;
    let raf = 0;
    let last = 0;

    const clearRow = (row: number, from: number, len: number) => {
      for (let c = from; c < from + len && c < cols; c++) grid[row * cols + c] = " ";
    };

    /** True when the run (plus one cell of padding) is free. */
    const isFree = (row: number, start: number, len: number) => {
      for (let c = start - 1; c <= start + len; c++) {
        if (c < 0 || c >= cols) continue;
        if (grid[row * cols + c] !== " ") return false;
      }
      return true;
    };

    /** Write one random phrase horizontally into consecutive empty cells. */
    const placePhrase = () => {
      if (cols < 8 || rows < 1) return;
      for (let attempt = 0; attempt < 12; attempt++) {
        const phrase =
          ASCII_PHRASES[Math.floor(Math.random() * ASCII_PHRASES.length)]!;
        if (phrase.length + 2 > cols) continue;
        const row = Math.floor(Math.random() * rows);
        const start = Math.floor(Math.random() * (cols - phrase.length + 1));
        if (!isFree(row, start, phrase.length)) continue;
        for (let i = 0; i < phrase.length; i++) {
          grid[row * cols + start + i] = phrase[i]!;
        }
        return;
      }
    };

    /** Remove one random phrase-sized run so the field stays sparse. */
    const clearRandomRun = () => {
      if (rows < 1 || cols < 4) return;
      const row = Math.floor(Math.random() * rows);
      const len = 12 + Math.floor(Math.random() * 20);
      clearRow(row, Math.floor(Math.random() * cols), len);
    };

    const buildGrid = () => {
      grid = new Array(cols * rows).fill(" ");
      phraseCount = Math.max(3, Math.round(cols * rows * density));
      for (let i = 0; i < phraseCount; i++) placePhrase();
      // Minority of loose characters for texture (~1.5% of cells).
      const loose = Math.round(cols * rows * 0.006);
      for (let i = 0; i < loose; i++) {
        const idx = Math.floor(Math.random() * grid.length);
        if (grid[idx] === " ") {
          grid[idx] = LOOSE_CHARS[Math.floor(Math.random() * LOOSE_CHARS.length)]!;
        }
      }
    };

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
      buildGrid();
      draw();
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || now - last < 1000 / 13) return;
      last = now;
      // Mutate only a couple of phrases per frame so fragments stay readable.
      const churn = Math.max(1, Math.round(phraseCount * 0.04));
      for (let i = 0; i < churn; i++) {
        clearRandomRun();
        placePhrase();
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
  }, [color, fontSize, density, seed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none block size-full", className)}
    />
  );
}
