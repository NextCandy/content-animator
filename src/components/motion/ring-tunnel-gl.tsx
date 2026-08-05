"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
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
  RING_REPEATS,
  RING_SPIN,
  SWELL_AMPLITUDE,
  SWELL_FALL_MS,
  SWELL_FREQUENCY,
  SWELL_RISE_MS,
  SWELL_SPEED,
  monoFontFamily,
  usePrefersReducedMotion,
} from "./vortex-shared";

/* -------------------------------------------------------------------------- */
/*  Hero text vortex, WebGL2 — the reference site's panel is a webgl2 canvas.  */
/*                                                                            */
/*  The tunnel is one full-screen fragment pass in log-polar space: the phrase */
/*  is baked once into a strip texture, then sampled with                      */
/*                                                                            */
/*      u = -angle / 2pi                   (around the ring)                   */
/*      v = (ln(radius) - zoom) / growth   (one unit per ring)                 */
/*                                                                            */
/*  so glyphs follow the ring tangent, scale linearly with radius, and read    */
/*  upside down along the top of each ring — all of it falling out of the      */
/*  mapping rather than being drawn glyph by glyph. Advancing `zoom` slides    */
/*  v and the tunnel zooms forever.                                            */
/* -------------------------------------------------------------------------- */

const TEX_WIDTH = 4096;

const VERT_SRC = `#version 300 es
const vec2 VERTS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(VERTS[gl_VertexID], 0.0, 1.0);
}`;

const FRAG_SRC = `#version 300 es
precision highp float;

uniform vec2 u_res;
uniform vec2 u_center;
uniform float u_zoom;
uniform float u_growth;
uniform float u_spin;
uniform float u_swell;   // 0 at rest, 1 while held
uniform float u_time;    // seconds
uniform vec3 u_swellCfg; // amplitude, frequency, speed
uniform vec4 u_color;
uniform sampler2D u_tex;

out vec4 outColor;

const float TAU = 6.28318530718;

void main() {
  // gl_FragCoord is y-up; the centre is tracked in y-down canvas space.
  vec2 p = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 d = p - u_center;
  float r = length(d);
  if (r < 1.0) {
    outColor = vec4(0.0);
    return;
  }

  // Negated: glyph tops face the centre, so the phrase has to advance
  // anticlockwise or every ring reads mirrored.
  float u = -atan(d.y, d.x) / TAU;
  float v = (log(r) - u_zoom) / u_growth;

  // Pressing lifts the surface: a crest rolls outward through the rings, so the
  // tunnel heaves like water instead of just spinning faster.
  v += u_swell * u_swellCfg.x *
       sin(v * u_swellCfg.y * TAU - u_time * u_swellCfg.z * TAU);

  // Alternate rings counter-rotate, so the tunnel never reads as one rigid disc.
  u += (mod(floor(v), 2.0) < 1.0 ? 1.0 : -1.0) * u_spin;

  // atan() wraps at the seam, so the implicit derivatives would collapse the mip
  // level along one radial line. Differentiate the mapping by hand instead.
  float r2 = r * r;
  vec2 dUVdx = vec2((d.y / r2) / TAU, (d.x / r2) / u_growth);
  vec2 dUVdy = vec2((-d.x / r2) / TAU, (d.y / r2) / u_growth);

  float cov = textureGrad(u_tex, vec2(u, v), dUVdx, dUVdy).a;
  float a = cov * u_color.a * smoothstep(0.0, 26.0, r);
  outColor = vec4(u_color.rgb * a, a); // premultiplied
}`;

let cachedSupport: boolean | null = null;

/** True when the browser can give us a webgl2 context at all. */
export function supportsWebGL2() {
  if (cachedSupport !== null) return cachedSupport;
  if (typeof document === "undefined") return false;
  try {
    cachedSupport = !!document.createElement("canvas").getContext("webgl2");
  } catch {
    cachedSupport = false;
  }
  return cachedSupport;
}

function parseColor(css: string) {
  const m = /rgba?\(([^)]+)\)/.exec(css);
  if (!m) return [1, 1, 1, 1] as const;
  const parts = m[1]!.split(",").map((n) => Number(n.trim()));
  return [
    (parts[0] ?? 255) / 255,
    (parts[1] ?? 255) / 255,
    (parts[2] ?? 255) / 255,
    parts[3] ?? 1,
  ] as const;
}

/** Bakes one unrolled ring band: the phrase repeated RING_REPEATS times. */
function buildStrip() {
  // Unrolled, a band at radius r measures 2*pi*r across by growth*r tall, so the
  // strip has to carry that aspect or the glyphs come out stretched.
  const height = Math.max(2, Math.round((TEX_WIDTH * RING_GROWTH) / (2 * Math.PI)));
  const canvas = document.createElement("canvas");
  canvas.width = TEX_WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const chars = RING_PHRASE.length * RING_REPEATS;
  const advance = TEX_WIDTH / chars;
  ctx.font = `${(advance / CHAR_ADVANCE).toFixed(2)}px ${monoFontFamily()}`;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < chars; i++) {
    const ch = RING_PHRASE[i % RING_PHRASE.length]!;
    if (ch === " ") continue;
    ctx.fillText(ch, (i + 0.5) * advance, height / 2);
  }
  return canvas;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export interface RingTunnelGLProps {
  className?: string;
  color?: string;
  holding?: boolean;
  onHoldComplete?: () => void;
  onUnavailable?: () => void;
  trackPointer?: boolean;
}

export function RingTunnelGL({
  className,
  color = RING_COLOR,
  holding = false,
  onHoldComplete,
  onUnavailable,
  trackPointer = true,
}: RingTunnelGLProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  const state = useRef({
    w: 0,
    h: 0,
    dpr: 1,
    zoom: 0,
    swell: 0,
    clock: 0,
    cx: 0,
    cy: 0,
    targetCx: 0,
    targetCy: 0,
    holdStart: 0,
    holding: false,
    completed: false,
    visible: true,
  });

  useEffect(() => {
    state.current.holding = holding;
    state.current.holdStart = holding ? performance.now() : 0;
    state.current.completed = false;
  }, [holding]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    });
    if (!gl) {
      onUnavailable?.();
      return;
    }

    const s = state.current;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    const program = vs && fs ? gl.createProgram() : null;
    if (!vs || !fs || !program) {
      onUnavailable?.();
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(program));
      onUnavailable?.();
      return;
    }

    const strip = buildStrip();
    if (!strip) {
      onUnavailable?.();
      return;
    }

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, strip);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);

    // The mapping is wildly anisotropic near the centre; this is the difference
    // between crisp rings and a grey smear.
    const aniso =
      gl.getExtension("EXT_texture_filter_anisotropic") ??
      gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
    if (aniso) {
      const max = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number;
      gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(16, max));
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.useProgram(program);
    const uRes = gl.getUniformLocation(program, "u_res");
    const uCenter = gl.getUniformLocation(program, "u_center");
    const uZoom = gl.getUniformLocation(program, "u_zoom");
    const uGrowth = gl.getUniformLocation(program, "u_growth");
    const uSpin = gl.getUniformLocation(program, "u_spin");
    const uSwell = gl.getUniformLocation(program, "u_swell");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uColor = gl.getUniformLocation(program, "u_color");
    gl.uniform3f(
      gl.getUniformLocation(program, "u_swellCfg"),
      SWELL_AMPLITUDE,
      SWELL_FREQUENCY,
      SWELL_SPEED,
    );
    gl.uniform1i(gl.getUniformLocation(program, "u_tex"), 0);
    gl.uniform1f(uGrowth, RING_GROWTH);
    const rgba = parseColor(color);
    gl.uniform4f(uColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const draw = () => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uCenter, s.cx * s.dpr, s.cy * s.dpr);
      gl.uniform1f(uZoom, s.zoom);
      gl.uniform1f(uSpin, (s.zoom * RING_SPIN) / (2 * Math.PI));
      gl.uniform1f(uSwell, s.swell);
      gl.uniform1f(uTime, s.clock);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      s.dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = rect.width;
      s.h = rect.height;
      canvas.width = Math.round(s.w * s.dpr);
      canvas.height = Math.round(s.h * s.dpr);
      // Without pointer tracking the centre must stay pinned through resizes.
      if (!s.cx || !trackPointer) {
        s.cx = s.targetCx = s.w / 2;
        s.cy = s.targetCy = s.h / 2;
      }
      draw();
    };

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!s.visible || document.visibilityState === "hidden") return;

      s.clock += dt;
      const swellTarget = s.holding ? 1 : 0;
      const swellStep = (dt * 1000) / (swellTarget > s.swell ? SWELL_RISE_MS : SWELL_FALL_MS);
      s.swell =
        swellTarget > s.swell
          ? Math.min(swellTarget, s.swell + swellStep)
          : Math.max(swellTarget, s.swell - swellStep);

      if (trackPointer) {
        s.cx += (s.targetCx - s.cx) * POINTER_LERP;
        s.cy += (s.targetCy - s.cy) * POINTER_LERP;
      }

      let rate = BASE_ZOOM_RATE;
      if (s.holding && s.holdStart) {
        const held = now - s.holdStart;
        const ramp = Math.min(1, held / HOLD_RAMP_MS);
        rate += (HOLD_ZOOM_RATE - BASE_ZOOM_RATE) * (1 - Math.pow(1 - ramp, 3));
        // Fires once: the reference keeps accelerating and just swaps the chip
        // to "RELEASE" — it does not end the hold for you.
        if (!s.completed && held >= HOLD_COMPLETE_MS) {
          s.completed = true;
          onHoldComplete?.();
        }
      }
      s.zoom += rate * dt;
      draw();
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

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      onUnavailable?.();
    };
    canvas.addEventListener("webglcontextlost", onLost);

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
      canvas.removeEventListener("webglcontextlost", onLost);
      document.removeEventListener("visibilitychange", onVis);
      gl.deleteTexture(texture);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    };
  }, [color, onHoldComplete, onUnavailable, reduced, trackPointer]);

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
