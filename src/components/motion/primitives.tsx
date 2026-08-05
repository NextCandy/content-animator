"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  useEffect,
  useLayoutEffect as useLayoutEffectRaw,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type React from "react";
import { cn } from "@/lib/utils";
import { useScrollContainer } from "@/components/motion/scroll-container";

const useLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffectRaw : useEffect;

const EASE_OUT = [0, 0, 0.2, 1] as const;
const EASE_CSS = "cubic-bezier(0, 0, 0.2, 1)";

/** Reduced-motion query without depending on the Motion runtime. */
function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduce;
}

/**
 * In-view detection that works with the Lenis scroll container:
 * - resolves the observer root from the scroll-container context
 * - checks intersection synchronously on mount (elements already on screen)
 * - forces the visible state after 1200ms as a safety net
 */
function useRevealInView(ref: RefObject<HTMLElement | null>, enabled = true) {
  const container = useScrollContainer();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!enabled || inView) return;
    const el = ref.current;
    if (!el) return;
    const root = container?.current ?? null;

    const check = () => {
      const rect = el.getBoundingClientRect();
      const bounds = root
        ? root.getBoundingClientRect()
        : { top: 0, bottom: window.innerHeight };
      if (rect.bottom > bounds.top && rect.top < bounds.bottom) {
        setInView(true);
        return true;
      }
      return false;
    };
    if (check()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setInView(true);
      },
      { root, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);

    // Safety net: copy is never allowed to stay invisible.
    const timer = window.setTimeout(() => setInView(true), 1200);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [container, enabled, inView, ref]);

  return inView;
}

/**
 * Line-by-line reveal driven by plain CSS transitions (no animation library).
 * The markup renders at its final visible state; the hidden state is applied
 * in a layout effect only after JS has taken over, so a JS/runtime failure
 * leaves plain readable text instead of an invisible block.
 */
export function LineReveal({
  text,
  className,
  delay = 0,
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
}) {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [lines, setLines] = useState<string[] | null>(null);
  const [armed, setArmed] = useState(false);
  const [measureKey, setMeasureKey] = useState(0);
  const shown = useRevealInView(ref, armed);
  const words = text.split(" ");

  useEffect(() => {
    setLines(null);
    setArmed(false);
  }, [text]);

  useEffect(() => {
    const onResize = () => {
      setLines(null);
      setMeasureKey((k) => k + 1);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useLayoutEffect(() => {
    if (lines !== null) return;
    const el = ref.current;
    if (!el) return;
    const spans = Array.from(
      el.querySelectorAll<HTMLElement>("[data-line-word]"),
    );
    if (!spans.length) return;
    const grouped: string[] = [];
    let currentTop: number | null = null;
    spans.forEach((span) => {
      const top = Math.round(span.offsetTop);
      const word = span.textContent?.trim() ?? "";
      if (currentTop === null || Math.abs(top - currentTop) > 2) {
        currentTop = top;
        grouped.push(word);
      } else {
        grouped[grouped.length - 1] += ` ${word}`;
      }
    });
    setLines(grouped);
  }, [lines, measureKey, text]);

  // Arm the hidden state before the browser paints the measured lines.
  useLayoutEffect(() => {
    if (lines === null || reduce || armed) return;
    setArmed(true);
  }, [armed, lines, reduce]);

  const Tagged = Tag as "h2";

  if (reduce) {
    return <Tagged className={className}>{text}</Tagged>;
  }

  // Pre-measure pass: rendered fully visible (also the SSR / no-JS output).
  if (lines === null) {
    return (
      <Tagged
        className={className}
        ref={ref as unknown as RefObject<HTMLHeadingElement>}
      >
        {words.map((word, i) => (
          <span data-line-word key={`${word}-${i}`} className="inline-block">
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        ))}
      </Tagged>
    );
  }

  const hidden = armed && !shown;

  return (
    <Tagged
      className={className}
      ref={ref as unknown as RefObject<HTMLHeadingElement>}
    >
      {lines.map((line, i) => (
        <span
          key={`${line}-${i}`}
          className="block overflow-hidden"
          style={{ paddingBottom: "0.16em", marginBottom: "-0.16em" }}
        >
          <span
            className="block will-change-transform"
            style={{
              opacity: hidden ? 0 : 1,
              transform: hidden ? "translateY(100%)" : "translateY(0)",
              transition: `transform 420ms ${EASE_CSS}, opacity 420ms ${EASE_CSS}`,
              transitionDelay: `${delay * 1000 + i * 60}ms`,
            }}
          >
            {line}
          </span>
        </span>
      ))}
    </Tagged>
  );
}

/** Back-compat alias: existing call sites import MaskReveal. */
export const MaskReveal = LineReveal;

/**
 * Generic in-view fade + lift, CSS-driven. Visible by default; the hidden
 * state is only armed once the client is running.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
  as: Tag = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "p" | "span";
} & Omit<React.HTMLAttributes<HTMLElement>, "children" | "className">) {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const shown = useRevealInView(ref, armed);

  useLayoutEffect(() => {
    if (reduce || armed) return;
    setArmed(true);
  }, [armed, reduce]);

  const hidden = armed && !shown && !reduce;
  const Tagged = Tag as "div";

  return (
    <Tagged
      {...rest}
      ref={ref}
      className={className}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? `translateY(${y}px)` : "translateY(0)",
        transition: reduce
          ? undefined
          : `transform 400ms ${EASE_CSS}, opacity 400ms ${EASE_CSS}`,
        transitionDelay: `${delay * 1000}ms`,
      }}
    >
      {children}
    </Tagged>
  );
}

/**
 * Mount fade/lift with no in-view trigger, CSS-driven. Renders visible first,
 * so a failed client runtime can never blank the copy.
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "p" | "span" | "li";
}) {
  const reduce = usePrefersReducedMotion();
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useLayoutEffect(() => {
    if (reduce || armed) return;
    setArmed(true);
  }, [armed, reduce]);

  useEffect(() => {
    if (!armed || shown) return;
    const raf = requestAnimationFrame(() => setShown(true));
    const timer = window.setTimeout(() => setShown(true), 1200);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [armed, shown]);

  const hidden = armed && !shown && !reduce;
  const Tagged = Tag as "div";

  return (
    <Tagged
      className={className}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? `translateY(${y}px)` : "translateY(0)",
        transition: reduce
          ? undefined
          : `transform 500ms ${EASE_CSS}, opacity 500ms ${EASE_CSS}`,
        transitionDelay: `${delay * 1000}ms`,
      }}
    >
      {children}
    </Tagged>
  );
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*_";

/** Monospace scramble/flip effect that fires once the element enters view. */
export function Scramble({
  text,
  className,
  duration = 700,
}: {
  text: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!inView || reduce) {
      setDisplay(text);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const locked = Math.floor(p * text.length);
      setDisplay(
        text
          .split("")
          .map((ch, i) => {
            if (i < locked || ch === " ") return ch;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(""),
      );
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDisplay(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, text, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/** Infinite horizontal marquee, pauses on hover. */
export function Marquee({
  children,
  speed = 28,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  return (
    <div className={cn("group relative overflow-hidden", className)}>
      <div
        className="flex w-max animate-[marquee_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: `${speed}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Two-block button with the offset hover slide from the reference site. */
export function SplitButton({
  label,
  sublabel,
  href,
  tone = "ink",
  className,
}: {
  label: string;
  sublabel: string;
  href: string;
  tone?: "ink" | "cream";
  className?: string;
}) {
  const dark = tone === "ink";
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex items-stretch gap-px focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
        className,
      )}
    >
      <span
        className={cn(
          "mono-label flex items-center px-6 py-4 transition-colors duration-150 ease-[cubic-bezier(0,0,0.2,1)]",
          dark
            ? "bg-ink text-ink-foreground group-hover:bg-ink/80"
            : "bg-background text-foreground group-hover:bg-foreground/10",
          "rounded-l-[var(--radius)]",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "mono-label flex items-center px-6 py-4 transition-colors duration-200 ease-[cubic-bezier(0,0,0.2,1)]",
          dark
            ? "bg-ink text-ink-foreground group-hover:bg-ink/70"
            : "bg-background text-foreground group-hover:bg-foreground/20",
          "rounded-r-[var(--radius)]",
        )}
      >
        {sublabel}
      </span>
    </a>
  );
}

/** Smoothed scroll progress for a section, 0 → 1 across its travel. */
export function useSectionProgress(
  ref: RefObject<HTMLElement | null>,
  offset: ["start end", "end start"] | ["start start", "end end"] = [
    "start end",
    "end start",
  ],
): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
}

export { motion, useTransform, useScroll, useReducedMotion, useInView };