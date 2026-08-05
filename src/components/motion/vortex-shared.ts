"use client";

import { useEffect, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Shared tuning for the hero text vortex.                                    */
/*                                                                            */
/*  Two renderers read these: the WebGL2 tunnel (ring-tunnel-gl.tsx), which    */
/*  matches how the reference site draws the panel, and the 2D canvas ring     */
/*  renderer in ascii-field.tsx, kept as the fallback for browsers without a   */
/*  webgl2 context.                                                            */
/* -------------------------------------------------------------------------- */

export const RING_PHRASE = "THE CONTENT ARCHITECTURE ";

/** ln-space gap between rings; larger = sparser tunnel. */
export const RING_GROWTH = 0.26;
/** Monospace advance / font size. */
export const CHAR_ADVANCE = 0.62;
/** Whole phrase repeats per ring. Integer, so the strip wraps seamlessly. */
export const RING_REPEATS = 8;
/** Glyph colour. */
export const RING_COLOR = "rgba(232, 232, 232, 0.88)";

export const BASE_ZOOM_RATE = 0.075; // ln-units per second at rest
export const HOLD_ZOOM_RATE = 0.8; // ln-units per second while held
export const HOLD_RAMP_MS = 500; // ease-in time to reach HOLD_ZOOM_RATE
export const HOLD_COMPLETE_MS = 2000; // sustained hold that counts as completed
export const POINTER_LERP = 0.09; // vortex centre easing toward the pointer
/** Radians of counter-rotation per ln-unit of zoom, alternating by ring. */
export const RING_SPIN = 0.35;

/* --- swell: the surface lifts and rolls outward while the pointer is held --- */

/** Peak radial displacement, in rings (1.0 would shift a ring onto the next). */
export const SWELL_AMPLITUDE = 0.34;
/** Wavelength in rings — lower spreads one crest over more of the tunnel. */
export const SWELL_FREQUENCY = 0.22;
/** Crest travel, rings per second. */
export const SWELL_SPEED = 0.7;
/** Time for the swell to rise on press and settle on release. */
export const SWELL_RISE_MS = 650;
export const SWELL_FALL_MS = 900;

export function usePrefersReducedMotion() {
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

/** Resolves the app's mono stack into something canvas `font` can parse. */
export function monoFontFamily() {
  if (typeof document === "undefined") return "monospace";
  const declared = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-mono")
    .trim();
  return declared || "ui-monospace, SFMono-Regular, Menlo, monospace";
}
