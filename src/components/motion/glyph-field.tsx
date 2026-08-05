"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./vortex-shared";

const FIELD_PHRASE =
  "EVERY DECISION ALREADY MADE · SCHEMA AS A SYSTEM · THE HARD FIELDS ALREADY BUILT · A LINK FIELD THAT HANDLES EVERYTHING · ONE MEDIA FIELD ONE SHAPE · A PAGE BUILDER WITH GUARDRAILS · FETCH LAYER SOLVED · CDN BYPASSED IN PRODUCTION · WEBHOOKS INVALIDATE ON PUBLISH · DRAFT MODE WIRED IN · A STUDIO EDITORS ACTUALLY USE · SEO DONE NOT DEFERRED · AGENT NATIVE NO DRIFT · WIRED UP NOT JUST CLONED · ";

const GLYPHS = " ·.ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+*#@";
const IMAGE_GLYPHS = " ·,:;irsXA253hMHGS#9B&@";
const CELL_W = 7.7;
const CELL_H = 14;
const MODEL_W = 40;
const MODEL_H = 22;

/* A compact rendering of the reference model brightness map. The bright mass
 * sits on the right, which is what makes the benefits field feel directional
 * instead of like a uniformly noisy background. */
const MODEL_MASK = [
  " .   .  .    .  . . .  .... ...   .     ",
  "                                        ",
  "          ############.                 ",
  "       ##########++######               ",
  "      ###### +##+ #########             ",
  "     #####+   ### ##.#######            ",
  "    ######+#### ## #.########           ",
  "   #####.###.## #### ########           ",
  "   ###### ##  ###.###########           ",
  "   ####.##### .+#############           ",
  "  ###########################           ",
  "  ############################          ",
  "  ###############################       ",
  "   ################################ ##  ",
  "     ###################################",
  "      #################+ .  +.##########",
  "       .################################ ",
  "            ############################",
  "                 #######################",
  "                                ########",
  "                                ########",
  "                                    ####",
].map((row) => row.padEnd(MODEL_W, " ").slice(0, MODEL_W));

type Ripple = { x: number; y: number; start: number };

type FieldState = {
  width: number;
  height: number;
  dpr: number;
  cols: number;
  rows: number;
  cells: string[];
  brightness: number[];
  mouseX: number;
  mouseY: number;
  targetX: number;
  targetY: number;
  influence: number;
  targetInfluence: number;
  ripples: Ripple[];
  visible: boolean;
};

function hash(x: number, y = 0, seed = 0) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.3) * 43758.5453;
  return value - Math.floor(value);
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0 || 1)));
  return t * t * (3 - 2 * t);
}

function modelBrightness(col: number, row: number, cols: number, rows: number, model: boolean) {
  if (!model) return 0.04;
  const x = Math.min(MODEL_W - 1, Math.floor((col / Math.max(1, cols - 1)) * MODEL_W));
  const y = Math.min(MODEL_H - 1, Math.floor((row / Math.max(1, rows - 1)) * MODEL_H));
  const marker = MODEL_MASK[y]?.[x] ?? " ";
  if (marker === "#") return 1;
  if (marker === "+") return 0.62;
  if (marker === ".") return 0.2;
  return 0.04;
}

function randomGlyph(index: number, frame: number) {
  return GLYPHS[1 + Math.floor(hash(index, frame, 12.4) * (GLYPHS.length - 1))] ?? "*";
}

function randomImageGlyph(index: number, frame: number) {
  return IMAGE_GLYPHS[1 + Math.floor(hash(index, frame, 18.7) * (IMAGE_GLYPHS.length - 1))] ?? ".";
}

export interface GlyphFieldProps {
  className?: string;
  color?: string;
  backgroundColor?: string;
  /** Use the reference right-weighted brightness model. */
  model?: boolean;
  /** Add the reference pointer hole, cursor label and click ripples. */
  interactive?: boolean;
  label?: string;
  /** Override the copy stream for decorative fields such as the footer. */
  phrase?: string;
}

export function GlyphField({
  className,
  color = "rgba(222, 222, 222, 0.9)",
  backgroundColor = "#232323",
  model = true,
  interactive = false,
  label = "Click",
  phrase = FIELD_PHRASE,
}: GlyphFieldProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [hovered, setHovered] = useState(false);
  const state = useRef<FieldState>({
    width: 0,
    height: 0,
    dpr: 1,
    cols: 0,
    rows: 0,
    cells: [],
    brightness: [],
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0,
    influence: 0,
    targetInfluence: 0,
    ripples: [],
    visible: true,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = state.current;

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      s.width = rect.width;
      s.height = rect.height;
      s.dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.cols = Math.ceil(s.width / CELL_W) + 1;
      s.rows = Math.ceil(s.height / CELL_H) + 1;
      s.cells = new Array(s.cols * s.rows);
      s.brightness = new Array(s.cols * s.rows);
      for (let row = 0; row < s.rows; row++) {
        const offset = Math.floor(hash(row + 1, 0, 9.2) * phrase.length);
        for (let col = 0; col < s.cols; col++) {
          const index = row * s.cols + col;
          s.cells[index] = phrase[(col + offset) % phrase.length] ?? " ";
          s.brightness[index] = modelBrightness(col, row, s.cols, s.rows, model);
        }
      }
      canvas.width = Math.round(s.width * s.dpr);
      canvas.height = Math.round(s.height * s.dpr);
      canvas.style.width = `${s.width}px`;
      canvas.style.height = `${s.height}px`;
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
    };

    const draw = (now: number) => {
      const frame = Math.floor(now / 480);
      ctx.clearRect(0, 0, s.width, s.height);
      ctx.fillStyle = color;
      ctx.font = `14px ${getComputedStyle(document.documentElement).getPropertyValue("--font-mono") || "ui-monospace, monospace"}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      const pointerRadius = Math.max(12, (s.width / CELL_W) * 0.175);
      const pointerX = s.mouseX / CELL_W;
      const pointerY = s.mouseY / CELL_H;
      const mouseInfluence = s.influence;

      for (let row = 0; row < s.rows; row++) {
        for (let col = 0; col < s.cols; col++) {
          const index = row * s.cols + col;
          const base = s.brightness[index] ?? 0.04;
          const distance = Math.hypot(col - pointerX, row - pointerY);
          const hoverInfluence = (1 - smoothstep(0, pointerRadius, distance)) * mouseInfluence;
          // The reference keeps the ambient field barely visible while the
          // right-hand model carries the high-contrast glyphs.
          let opacity = base <= 0.1 ? 0.035 : 0.2 + Math.pow(base, 0.55) * 0.7;
          opacity *= 1 - hoverInfluence;

          let rippleInfluence = 0;
          for (const ripple of s.ripples) {
            const elapsed = now - ripple.start;
            if (elapsed < 0 || elapsed >= 1800) continue;
            const t = elapsed / 1800;
            const waveRadius = smoothstep(0, 1, t) * Math.max(48, s.cols * 0.8);
            const dist = Math.hypot(col - ripple.x, row - ripple.y);
            const bell = 1 - smoothstep(0, Math.max(8, s.cols * 0.42), Math.abs(dist - waveRadius));
            const life = smoothstep(0, 0.22, t) * (1 - smoothstep(0.78, 1, t));
            rippleInfluence = Math.max(rippleInfluence, bell * life);
          }

          const threshold = hash(col, row, 1.7);
          if (threshold < hoverInfluence * 2.5 && hoverInfluence > 0.001) opacity = 0;
          if (threshold < rippleInfluence * 0.5 && rippleInfluence > 0.001) opacity = 0.95;
          if (opacity < 0.02) continue;

          let glyph = s.cells[index] ?? " ";
          const ambientFlip = base > 0.15 && hash(index, frame, 3.1) > 0.93;
          const rippleFlip = rippleInfluence > 0.06 && threshold < rippleInfluence * 0.5;
          if (ambientFlip || rippleFlip) glyph = randomGlyph(index, frame);
          if (glyph === " ") continue;

          ctx.globalAlpha = Math.min(1, opacity);
          ctx.fillText(glyph, col * CELL_W, row * CELL_H);
        }
      }
      ctx.globalAlpha = 1;
    };

    resize();
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!s.visible || document.visibilityState === "hidden") return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const smoothing = 1 - Math.exp(-8 * dt);
      s.mouseX += (s.targetX - s.mouseX) * smoothing;
      s.mouseY += (s.targetY - s.mouseY) * smoothing;
      s.influence += (s.targetInfluence - s.influence) * smoothing;
      s.ripples = s.ripples.filter((ripple) => now - ripple.start < 1800);
      draw(now);
    };
    const io = new IntersectionObserver(
      (entries) => {
        s.visible = entries.some((entry) => entry.isIntersecting);
      },
      { threshold: 0 },
    );
    io.observe(wrapper);
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    if (reduced) draw(performance.now());
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [color, model, phrase, reduced]);

  const updatePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    state.current.targetX = x;
    state.current.targetY = y;
    if (labelRef.current) {
      labelRef.current.style.left = `${x}px`;
      labelRef.current.style.top = `${y}px`;
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative size-full overflow-hidden",
        interactive && "cursor-pointer",
        className,
      )}
      style={{ backgroundColor }}
      onPointerMove={interactive ? updatePointer : undefined}
      onPointerEnter={
        interactive
          ? (event) => {
              updatePointer(event);
              state.current.targetInfluence = 1;
              setHovered(true);
            }
          : undefined
      }
      onPointerLeave={
        interactive
          ? () => {
              state.current.targetInfluence = 0;
              setHovered(false);
            }
          : undefined
      }
      onClick={
        interactive
          ? () => {
              state.current.ripples.push({
                x: state.current.targetX / CELL_W,
                y: state.current.targetY / CELL_H,
                start: performance.now(),
              });
            }
          : undefined
      }
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 block size-full"
      />
      {interactive && (
        <div
          ref={labelRef}
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-0 left-0 z-2 translate-x-5 translate-y-5 select-none whitespace-nowrap bg-white p-2 font-mono text-caption-10 uppercase text-black transition-opacity duration-150",
            hovered ? "opacity-100" : "opacity-0",
          )}
        >
          {label}
        </div>
      )}
    </div>
  );
}

export function AsciiImageCurtain({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let brightness: number[] = [];
    let raf = 0;
    let last = 0;
    let frame = 0;

    const draw = (now: number) => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      if (rect.width !== width || rect.height !== height || !brightness.length) {
        width = rect.width;
        height = rect.height;
        cols = Math.ceil(width / CELL_W) + 1;
        rows = Math.ceil(height / CELL_H) + 1;
        canvas.width = Math.round(width * Math.min(devicePixelRatio || 1, 2));
        canvas.height = Math.round(height * Math.min(devicePixelRatio || 1, 2));
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(
          Math.min(devicePixelRatio || 1, 2),
          0,
          0,
          Math.min(devicePixelRatio || 1, 2),
          0,
          0,
        );

        const source = document.createElement("canvas");
        source.width = cols;
        source.height = rows;
        const sourceCtx = source.getContext("2d", { willReadFrequently: true });
        if (sourceCtx && image.complete && image.naturalWidth) {
          sourceCtx.drawImage(image, 0, 0, cols, rows);
          try {
            const pixels = sourceCtx.getImageData(0, 0, cols, rows).data;
            brightness = new Array(cols * rows);
            for (let i = 0; i < cols * rows; i++) {
              const r = pixels[i * 4] ?? 0;
              const g = pixels[i * 4 + 1] ?? 0;
              const b = pixels[i * 4 + 2] ?? 0;
              brightness[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
            }
          } catch {
            brightness = [];
          }
        }
        if (!brightness.length) {
          brightness = Array.from(
            { length: cols * rows },
            (_, i) => 0.06 + hash(i, Math.floor(i / Math.max(1, cols)), 5.4) * 0.82,
          );
        }
      }

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(35, 35, 35, 0.98)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#dedede";
      ctx.font = `14px ${getComputedStyle(document.documentElement).getPropertyValue("--font-mono") || "ui-monospace, monospace"}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const animationFrame = Math.floor(now / 420);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const index = row * cols + col;
          const value = brightness[index] ?? 0;
          if (value < 0.035) continue;
          const flicker = value > 0.25 && hash(index, animationFrame, 8.4) > 0.91;
          const glyph = flicker
            ? randomImageGlyph(index, animationFrame)
            : (IMAGE_GLYPHS[
                Math.min(
                  IMAGE_GLYPHS.length - 1,
                  Math.max(0, Math.floor(value * (IMAGE_GLYPHS.length - 1))),
                )
              ] ?? ".");
          if (glyph === " ") continue;
          ctx.globalAlpha = Math.min(1, 0.08 + value * 0.92);
          ctx.fillText(glyph, col * CELL_W, row * CELL_H);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (reduced || now - last < 80) return;
      last = now;
      frame = now;
      draw(frame);
    };

    image.onload = () => {
      brightness = [];
      draw(performance.now());
    };
    image.onerror = () => draw(performance.now());
    image.src = src;
    if (reduced) draw(performance.now());
    else raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => draw(performance.now()));
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      image.onload = null;
      image.onerror = null;
    };
  }, [reduced, src]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 size-full transition-opacity duration-500 ease-out group-hover:opacity-0 group-data-[active=true]:opacity-0 motion-reduce:transition-none",
        className,
      )}
    >
      <canvas ref={canvasRef} role="img" aria-label={alt} className="block size-full" />
    </div>
  );
}
