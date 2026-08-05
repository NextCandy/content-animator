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
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";

const EASE_OUT = [0, 0, 0.2, 1] as const;

/**
 * Line-by-line mask reveal: measures the natural line breaks after layout,
 * wraps each visual line in an overflow-hidden block and lifts it into place.
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
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [lines, setLines] = useState<string[] | null>(null);
  const [measureKey, setMeasureKey] = useState(0);
  const words = text.split(" ");

  useEffect(() => {
    setLines(null);
  }, [text]);

  useEffect(() => {
    const onResize = () => {
      setLines(null);
      setMeasureKey((k) => k + 1);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
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

  const Tagged = Tag as "h2";

  if (reduce) {
    return <Tagged className={className}>{text}</Tagged>;
  }

  if (lines === null) {
    return (
      <Tagged
        className={className}
        ref={ref as unknown as RefObject<HTMLHeadingElement>}
        style={{ visibility: "hidden" }}
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

  return (
    <Tagged className={className} ref={ref as unknown as RefObject<HTMLHeadingElement>}>
      {lines.map((line, i) => (
        <span
          key={`${line}-${i}`}
          className="block overflow-hidden"
          style={{ paddingBottom: "0.16em", marginBottom: "-0.16em" }}
        >
          <motion.span
            className="block"
            initial={{ y: "100%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : undefined}
            transition={{
              duration: 0.42,
              ease: EASE_OUT,
              delay: delay + i * 0.06,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tagged>
  );
}

/** Back-compat alias: existing call sites import MaskReveal. */
export const MaskReveal = LineReveal;

/** Generic in-view fade + lift, with optional index-based stagger. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.4, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
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
        className="flex w-max animate-[marquee_linear_infinite] group-hover:[animation-play-state:paused]"
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
      className={cn("group inline-flex items-stretch gap-px", className)}
    >
      <span
        className={cn(
          "mono-label flex items-center px-6 py-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-1",
          dark
            ? "bg-ink text-ink-foreground"
            : "bg-background text-foreground",
          "rounded-l-[var(--radius)]",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "mono-label flex items-center px-6 py-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1",
          dark
            ? "bg-ink text-ink-foreground"
            : "bg-background text-foreground",
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