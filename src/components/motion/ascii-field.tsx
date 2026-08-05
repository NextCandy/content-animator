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
import { RingTunnelGL, supportsWebGL2 } from "./ring-tunnel-gl";
import {
  BASE_ZOOM_RATE,
  CHAR_ADVANCE,
  HOLD_COMPLETE_MS,
  HOLD_RAMP_MS,
  HOLD_ZOOM_RATE,
  POINTER_LERP,
  RING_COLOR,
  RING_GROWTH,
  RING_PHRASE,
  RING_SPIN,
  usePrefersReducedMotion,
} from "./vortex-shared";

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
/*  The reference draws that panel on a webgl2 context, so VortexPanel does    */
/*  too (ring-tunnel-gl.tsx). The 2D ring renderer below is the fallback for   */
/*  browsers that cannot give us webgl2; both read vortex-shared.ts so the     */
/*  two paths cannot drift apart.                                              */
/*                                                                            */
/*  The tunnel runs continuously: it drifts at BASE_ZOOM_RATE at rest and      */
/*  accelerates to HOLD_ZOOM_RATE while the pointer is held. Confirmed frame   */
/*  by frame against a screen recording of the live site — idle frames show    */
/*  the full vortex behind a "CLICK & HOLD" chip, held frames show a faster,   */
/*  tighter tunnel behind "KEEP HOLDING".                                      */
/*                                                                            */
/*  Label state machine: "Click & hold" -> "Keep holding" on pointerdown.      */
/*  Chip styling: bg-white p-2 font-mono text-black uppercase,                 */
/*  transition-opacity duration-150.                                           */
/* -------------------------------------------------------------------------- */

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

/* ---------------------------------- tuning -------------------------------- */

/** Cloud mask: normalised x where the field starts, and how long it fades in. */
const CLOUD_LEFT = 0.34;
const CLOUD_FEATHER = 0.3;
/** Field churn. The reference shimmers constantly rather than sitting still. */
const FIELD_MUTATE_MS = 90;
const FIELD_MUTATE_COUNT = 5;

const RING_FONT_RATIO = 0.075; // font size as a fraction of ring radius
const RING_MIN_FONT = 5;
const RING_MAX_FONT = 74;
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
  /** 0-1, how full the "field" variant is at its core. */
  density?: number;
  /**
   * Thin the field into a cloud that hugs the right of the panel, the way the
   * reference does behind the Features copy, instead of filling it edge to edge.
   */
  cloud?: boolean;
  /** Follow the pointer. Off for purely decorative backgrounds. */
  trackPointer?: boolean;
  /** Externally driven hold state, for the interactive hero panel. */
  holding?: boolean;
  onHoldComplete?: () => void;
}

export function VortexField({
  variant = "rings",
  className,
  color = RING_COLOR,
  speed = 1,
  density = 0.45,
  cloud = false,
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
    completed: false,
    visible: true,
    cells: [] as string[],
    cols: 0,
    rows: 0,
    minCol: 0,
    cloud: false,
    density: 0.45,
    lastSeed: 0,
  });

  useEffect(() => {
    state.current.holding = holding;
    if (holding) state.current.holdStart = performance.now();
    else state.current.holdStart = 0;
    state.current.completed = false;
  }, [holding]);

  /* --------------------------- character field prep ------------------------ */

  const seedField = useCallback(() => {
    const s = state.current;
    const cw = FIELD_FONT * CHAR_ADVANCE;
    const ch = FIELD_FONT * 1.5;
    s.cols = Math.ceil(s.w / cw) + 1;
    s.rows = Math.ceil(s.h / ch) + 1;
    s.cells = new Array(s.cols * s.rows).fill("");

    // The reference lays this out as solid lines of copy and then thins them
    // into a cloud — not as single glyphs scattered over the whole panel. Fill
    // every row edge to edge first.
    for (let row = 0; row < s.rows; row++) {
      let col = -((Math.random() * 12) | 0);
      while (col < s.cols) {
        const phrase = FIELD_PHRASES[(Math.random() * FIELD_PHRASES.length) | 0]!;
        for (let i = 0; i < phrase.length; i++) {
          const c = col + i;
          if (c >= 0 && c < s.cols) s.cells[row * s.cols + c] = phrase[i]!;
        }
        col += phrase.length + 1 + ((Math.random() * 4) | 0);
      }
    }

    // Then carve it back: `density` at the core, fading out towards the top and
    // bottom edges and — when `cloud` is on — off the left, so the copy column
    // keeps a clean background.
    s.minCol = cloud ? Math.round(s.cols * CLOUD_LEFT) : 0;
    s.cloud = cloud;
    s.density = density;
    for (let row = 0; row < s.rows; row++) {
      const ny = s.rows > 1 ? (row / (s.rows - 1)) * 2 - 1 : 0;
      const vertical = cloud ? 1 - Math.abs(ny) ** 3 * 0.8 : 1;
      for (let col = 0; col < s.cols; col++) {
        const idx = row * s.cols + col;
        if (!s.cells[idx]) continue;
        const nx = s.cols > 1 ? col / (s.cols - 1) : 0;
        const horizontal = cloud
          ? Math.min(1, Math.max(0, (nx - CLOUD_LEFT) / CLOUD_FEATHER))
          : 1;
        if (Math.random() > density * vertical * horizontal) s.cells[idx] = "";
      }
    }
  }, [cloud, density]);

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
        const spin = (i % 2 === 0 ? 1 : -1) * s.zoom * RING_SPIN;

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
          if (!s.completed && held >= HOLD_COMPLETE_MS) {
            s.completed = true;
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
      if (variant === "field" && now - s.lastSeed > FIELD_MUTATE_MS) {
        s.lastSeed = now;
        for (let i = 0; i < FIELD_MUTATE_COUNT; i++) writePhrase(s);
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

function writePhrase(s: {
  cells: string[];
  cols: number;
  rows: number;
  minCol: number;
  cloud: boolean;
  density: number;
}) {
  if (!s.cols || !s.rows) return;
  const phrase = FIELD_PHRASES[(Math.random() * FIELD_PHRASES.length) | 0]!;
  const row = (Math.random() * s.rows) | 0;
  const span = Math.max(1, s.cols - phrase.length - s.minCol);
  const start = s.minCol + ((Math.random() * span) | 0);
  const ny = s.rows > 1 ? (row / (s.rows - 1)) * 2 - 1 : 0;
  const vertical = s.cloud ? 1 - Math.abs(ny) ** 3 * 0.8 : 1;

  // Re-thin as we go, otherwise the churn slowly fills the cloud's soft edges
  // back in. Writing "" also clears the old glyph, so phrases never smear.
  for (let i = 0; i < phrase.length && start + i < s.cols; i++) {
    const col = start + i;
    const nx = s.cols > 1 ? col / (s.cols - 1) : 0;
    const horizontal = s.cloud
      ? Math.min(1, Math.max(0, (nx - CLOUD_LEFT) / CLOUD_FEATHER))
      : 1;
    s.cells[row * s.cols + col] =
      Math.random() > s.density * vertical * horizontal ? "" : phrase[i]!;
  }
}

/* -------------------------------------------------------------------------- */
/*  Interactive hero panel: vortex + cursor-following label state machine.     */
/* -------------------------------------------------------------------------- */

const LABEL_IDLE = "Click & hold";
const LABEL_HOLDING = "Keep holding";
/** Read off the reference recording: the third state prompts, it doesn't cheer. */
const LABEL_DONE = "Release";

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

  // The hold is not ended for the visitor: the chip just starts prompting.
  const onComplete = useCallback(() => setDone(true), []);

  const endHold = useCallback(() => {
    setHolding(false);
    setDone(false);
  }, []);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setHolding(true);
    }
  };
  const onKeyUp = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") endHold();
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
        endHold();
      }}
      onPointerDown={() => setHolding(true)}
      onPointerUp={endHold}
      onPointerCancel={endHold}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    >
      <div className="absolute inset-0">
        {/* The reference pins the vortex to the panel centre; only the chip
            follows the cursor. */}
        {supportsWebGL2() ? (
          <RingTunnelGL
            holding={holding}
            onHoldComplete={onComplete}
            trackPointer={false}
          />
        ) : (
          <VortexField
            variant="rings"
            holding={holding}
            onHoldComplete={onComplete}
            trackPointer={false}
          />
        )}
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
  cloud = false,
  className,
  trackPointer = true,
}: {
  color?: string;
  /** @deprecated kept for call-site compatibility; the field font is fixed. */
  fontSize?: number;
  /** @deprecated kept for call-site compatibility. */
  seed?: number;
  density?: number;
  cloud?: boolean;
  className?: string;
  trackPointer?: boolean;
}) {
  return (
    <VortexField
      variant="field"
      color={color}
      density={density}
      cloud={cloud}
      className={className}
      trackPointer={trackPointer}
    />
  );
}
