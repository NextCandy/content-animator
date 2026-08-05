"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Measured from contentarchitecture.dev                                      */
/*                                                                            */
/*  Hero panel: container "relative size-full cursor-pointer select-none       */
/*  overflow-hidden", background #232323, holding a full-bleed canvas          */
/*  (position:absolute; inset:0, dpr-scaled) plus a cursor-following label     */
/*  chip. The canvas renders concentric rings of the repeated phrase           */
/*  "THE CONTENT ARCHITECTURE"; ring radii grow geometrically and the font     */
/*  size scales with the radius, producing an infinite-zoom tunnel. Glyphs sit */
/*  on the ring tangent with no up-flip correction, so the top of each ring    */
/*  reads upside down — that is intentional.                                   */
/*                                                                            */
/*  Label state machine: "Click & hold" -> "Keep holding" on pointerdown.      */
/*  Chip styling: bg-white p-2 font-mono text-black uppercase,                 */
/*  transition-opacity duration-150.                                           */
/* -------------------------------------------------------------------------- */

const RING_PHRASE = "THE CONTENT ARCHITECTURE ";

/** Uppercase fragments of our own feature copy, used by the "field" variant. */
const FIELD_PHRASES = [
  "AGENT-NATIVE NO DRIFT",
  "SCHEMA AS A SYSTEM",
  "FETCH LAYER SOLVED",
  "ONE MEDIA FIELD ONE SHAPE",
  "A PAGE BUILDER WITH GUARDRAILS",
  "CDN BYPASSED IN PRODUCTION",
  "WEBHOOKS INVALIDATE ON PUBLISH",
  "SEO DONE NOT DEFERRED",
  "PRODUCTION-READY FROM DAY ONE",
  "THE HARD FIELDS ALREADY BUILT",
  "A STUDIO EDITORS ACTUALLY USE",
  "WIRED UP NOT JUST CLONED",
  "EVERY DECISION ALREADY MADE",
  "DRAFT MODE WIRED IN",
];

const LOOSE_GLYPHS = "/#*_-+=<>[]{}01·";

/* ---------------------------------- tuning -------------------------------- */

const RING_GROWTH = 0.42; // ln-space gap between rings; larger = sparser tunnel
const RING_FONT_RATIO = 0.14; // font size as a fraction of ring radius
const RING_MIN_FONT = 5;
const RING_MAX_FONT = 74;
const CHAR_ADVANCE = 0.62; // monospace advance / font size
const BASE_ZOOM_RATE = 0.14; // ln-units per second at rest
const HOLD_ZOOM_RATE = 1.5; // ln-units per second while held
const HOLD_RAMP_MS = 500; // ease-in time to reach HOLD_ZOOM_RATE
const HOLD_COMPLETE_MS = 2000; // sustained hold that counts as completed
const POINTER_LERP = 0.09; // vortex centre easing toward the pointer
const FIELD_FONT = 13;
const FIELD_VOID_RADIUS = 190; // px; hole punched around the cursor
const FIELD_VOID_FEATHER = 90; // px; soft falloff at the hole's edge
const TARGET_FPS = 30;

type Variant = "rings" | "field";

export interface VortexFieldProps {
  variant?: Variant;
  className?: string;
  /** Glyph colour. Defaults to a low-contrast grey so copy always wins. */
  color?: string;
  /** Multiplies the resting zoom rate. */
  speed?: number;
  /** 0-1, how full the "field" variant is. */
  density?: number;
  /** Follow the pointer. Off for purely decorative backgrounds. */
  trackPointer?: boolean;
  /** Externally driven hold state, for the interactive hero panel. */
  holding?: boolean;
  onHoldComplete?: () => void;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function VortexField({
  variant = "rings",
  className,
  color = "rgba(222, 222, 222, 0.55)",
  speed = 1,
  density = 0.45,
  trackPointer = true,
  holding = false,
  onHoldComplete,
}: VortexFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  // Mutable render state, deliberately outside React.
  const state = useRef({
    w: 0,
    h: 0,
    dpr: 1,
    zoom: 0,
    cx: 0,
    cy: 0,
    targetCx: 0,
    targetCy: 0,
    holdStart: 0,
    holding: false,
    visible: true,
    cells: [] as string[],
    cols: 0,
    rows: 0,
    lastSeed: 0,
  });

  useEffect(() => {
    state.current.holding = holding;
    if (holding) state.current.holdStart = performance.now();
    else state.current.holdStart = 0;
  }, [holding]);

  /* --------------------------- character field prep ------------------------ */

  const seedField = useCallback(() => {
    const s = state.current;
    const cw = FIELD_FONT * CHAR_ADVANCE;
    const ch = FIELD_FONT * 1.5;
    s.cols = Math.ceil(s.w / cw) + 1;
    s.rows = Math.ceil(s.h / ch) + 1;
    s.cells = new Array(s.cols * s.rows).fill("");

    const phraseCount = Math.round(s.rows * density * 0.8);
    for (let i = 0; i < phraseCount; i++) writePhrase(s);

    // A minority of loose glyphs for texture.
    const looseCount = Math.round(s.cells.length * density * 0.12);
    for (let i = 0; i < looseCount; i++) {
      const idx = (Math.random() * s.cells.length) | 0;
      if (!s.cells[idx])
        s.cells[idx] = LOOSE_GLYPHS[(Math.random() * LOOSE_GLYPHS.length) | 0]!;
    }
  }, [density]);

  /* -------------------------------- rendering ------------------------------ */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = state.current;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      s.dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = rect.width;
      s.h = rect.height;
      canvas.width = Math.round(s.w * s.dpr);
      canvas.height = Math.round(s.h * s.dpr);
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      if (!s.cx) {
        s.cx = s.targetCx = s.w / 2;
        s.cy = s.targetCy = s.h / 2;
      }
      if (variant === "field") seedField();
      draw(0);
    };

    /* ------------------------------ ring tunnel ---------------------------- */

    const drawRings = () => {
      const maxR = Math.hypot(
        Math.max(s.cx, s.w - s.cx),
        Math.max(s.cy, s.h - s.cy),
      );
      const frac = s.zoom % RING_GROWTH;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < 40; i++) {
        const r = Math.exp(RING_GROWTH * i + frac) * 1.6;
        if (r > maxR * 1.25) break;
        if (r < 3) continue;

        const font = Math.min(
          RING_MAX_FONT,
          Math.max(RING_MIN_FONT, r * RING_FONT_RATIO),
        );
        if (font < RING_MIN_FONT) continue;

        // Fade newborn rings in at the centre and old rings out at the edge.
        const inner = Math.min(1, r / 26);
        const outer = 1 - Math.min(1, Math.max(0, (r - maxR * 0.7) / (maxR * 0.55)));
        const alpha = inner * outer;
        if (alpha <= 0.02) continue;

        ctx.globalAlpha = alpha;
        ctx.font = `${font.toFixed(1)}px var(--font-mono, ui-monospace), monospace`;

        const advance = font * CHAR_ADVANCE;
        const count = Math.max(6, Math.floor((2 * Math.PI * r) / advance));
        const step = (2 * Math.PI) / count;
        // Alternate ring direction so the tunnel does not read as one rigid disc.
        const spin = (i % 2 === 0 ? 1 : -1) * s.zoom * 0.35;

        for (let j = 0; j < count; j++) {
          const ch = RING_PHRASE[j % RING_PHRASE.length]!;
          if (ch === " ") continue;
          const a = j * step + spin;
          const x = s.cx + Math.cos(a) * r;
          const y = s.cy + Math.sin(a) * r;
          if (x < -font || x > s.w + font || y < -font || y > s.h + font) continue;
          ctx.save();
          ctx.translate(x, y);
          // Tangent orientation, no up-flip correction — matches the reference.
          ctx.rotate(a + Math.PI / 2);
          ctx.fillText(ch, 0, 0);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    };

    /* ---------------------------- character field -------------------------- */

    const drawField = () => {
      const cw = FIELD_FONT * CHAR_ADVANCE;
      const chh = FIELD_FONT * 1.5;
      ctx.font = `${FIELD_FONT}px var(--font-mono, ui-monospace), monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      const voidR = trackPointer ? FIELD_VOID_RADIUS : 0;
      const feather = FIELD_VOID_FEATHER;

      for (let row = 0; row < s.rows; row++) {
        const y = row * chh;
        for (let col = 0; col < s.cols; col++) {
          const ch = s.cells[row * s.cols + col];
          if (!ch || ch === " ") continue;
          const x = col * cw;

          let alpha = 1;
          if (voidR > 0) {
            const d = Math.hypot(x - s.cx, y - s.cy);
            if (d < voidR) continue; // hole punched around the cursor
            if (d < voidR + feather) alpha = (d - voidR) / feather;
          }
          ctx.globalAlpha = alpha;
          ctx.fillText(ch, x, y);
        }
      }
      ctx.globalAlpha = 1;
    };

    /* -------------------------------- frame -------------------------------- */

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, s.w, s.h);
      ctx.fillStyle = color;

      if (trackPointer) {
        s.cx += (s.targetCx - s.cx) * POINTER_LERP;
        s.cy += (s.targetCy - s.cy) * POINTER_LERP;
      }

      if (!reduced && dt > 0) {
        let rate = BASE_ZOOM_RATE * speed;
        if (s.holding && s.holdStart) {
          const held = performance.now() - s.holdStart;
          const ramp = Math.min(1, held / HOLD_RAMP_MS);
          // ease-out on the ramp, matching the site's cubic-bezier(0,0,.2,1) feel
          const eased = 1 - Math.pow(1 - ramp, 3);
          rate += (HOLD_ZOOM_RATE - BASE_ZOOM_RATE) * eased;
          if (held >= HOLD_COMPLETE_MS) {
            s.holdStart = performance.now();
            onHoldComplete?.();
          }
        }
        s.zoom += rate * dt;
      }

      if (variant === "rings") drawRings();
      else drawField();
    };

    /* ------------------------------ frame loop ----------------------------- */

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const frameBudget = 1000 / TARGET_FPS;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const delta = now - last;
      last = now;
      if (!s.visible || document.visibilityState === "hidden") return;
      acc += delta;
      if (acc < frameBudget) return;
      const dt = acc / 1000;
      acc = 0;
      draw(dt);
      if (variant === "field" && now - s.lastSeed > 1400) {
        s.lastSeed = now;
        // Slowly mutate: retire a couple of phrases, write a couple of new ones.
        for (let i = 0; i < 2; i++) writePhrase(s);
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(
      (entries) => {
        s.visible = entries.some((e) => e.isIntersecting);
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    resize();
    if (!reduced) raf = requestAnimationFrame(loop);

    const onVis = () => {
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [color, density, onHoldComplete, reduced, seedField, speed, trackPointer, variant]);

  /* ----------------------------- pointer tracking -------------------------- */

  useEffect(() => {
    if (!trackPointer || reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const target = canvas.parentElement ?? canvas;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      state.current.targetCx = e.clientX - rect.left;
      state.current.targetCy = e.clientY - rect.top;
    };
    target.addEventListener("pointermove", onMove, { passive: true });
    return () => target.removeEventListener("pointermove", onMove);
  }, [reduced, trackPointer]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none block size-full", className)}
    />
  );
}

function writePhrase(s: { cells: string[]; cols: number; rows: number }) {
  if (!s.cols || !s.rows) return;
  const phrase = FIELD_PHRASES[(Math.random() * FIELD_PHRASES.length) | 0]!;
  const row = (Math.random() * s.rows) | 0;
  const start = (Math.random() * Math.max(1, s.cols - phrase.length)) | 0;
  // Clear the row segment first so retired phrases do not smear.
  for (let i = 0; i < phrase.length && start + i < s.cols; i++) {
    s.cells[row * s.cols + start + i] = phrase[i]!;
  }
}

/* -------------------------------------------------------------------------- */
/*  Interactive hero panel: vortex + cursor-following label state machine.     */
/* -------------------------------------------------------------------------- */

const LABEL_IDLE = "Click & hold";
const LABEL_HOLDING = "Keep holding";
const LABEL_DONE = "Nice";

export function VortexPanel({ className }: { className?: string }) {
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const reduced = usePrefersReducedMotion();

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const onComplete = useCallback(() => {
    setDone(true);
    setHolding(false);
    window.setTimeout(() => setDone(false), 900);
  }, []);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setHolding(true);
    }
  };
  const onKeyUp = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") setHolding(false);
  };

  const label = done ? LABEL_DONE : holding ? LABEL_HOLDING : LABEL_IDLE;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Interactive text vortex"
      className={cn(
        "relative size-full cursor-pointer select-none overflow-hidden",
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
        className,
      )}
      style={{ backgroundColor: "#232323" }}
      onPointerMove={onMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setHolding(false);
      }}
      onPointerDown={() => setHolding(true)}
      onPointerUp={() => setHolding(false)}
      onPointerCancel={() => setHolding(false)}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    >
      <div className="absolute inset-0">
        <VortexField
          variant="rings"
          holding={holding}
          onHoldComplete={onComplete}
        />
      </div>

      {!reduced && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-0 left-0 z-2 translate-x-5 translate-y-5",
            "select-none whitespace-nowrap bg-white p-2 font-mono text-xs uppercase",
            "text-black transition-opacity duration-150",
            hovered ? "opacity-100" : "opacity-0",
          )}
          style={{ left: pos.x, top: pos.y }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

export default VortexField;

/* -------------------------------------------------------------------------- */
/*  Back-compat shim so existing call sites keep working unchanged.            */
/* -------------------------------------------------------------------------- */

export function AsciiField({
  color = "rgba(222, 222, 222, 0.42)",
  density = 0.45,
  className,
  trackPointer = true,
}: {
  color?: string;
  /** @deprecated kept for call-site compatibility; the field font is fixed. */
  fontSize?: number;
  /** @deprecated kept for call-site compatibility. */
  seed?: number;
  density?: number;
  className?: string;
  trackPointer?: boolean;
}) {
  return (
    <VortexField
      variant="field"
      color={color}
      density={density}
      className={className}
      trackPointer={trackPointer}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Back-compat shim so existing call sites keep working unchanged.            */
/* -------------------------------------------------------------------------- */

export function AsciiField({
  color = "rgba(222, 222, 222, 0.42)",
  density = 0.45,
  className,
  trackPointer = true,
}: {
  color?: string;
  /** @deprecated kept for call-site compatibility; the field font is fixed. */
  fontSize?: number;
  /** @deprecated kept for call-site compatibility. */
  seed?: number;
  density?: number;
  className?: string;
  trackPointer?: boolean;
}) {
  return (
    <VortexField
      variant="field"
      color={color}
      density={density}
      className={className}
      trackPointer={trackPointer}
    />
  );
}
