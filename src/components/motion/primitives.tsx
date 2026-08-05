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

/** Word-by-word mask reveal, used for the big display headlines. */
export function MaskReveal({
  text,
  className,
  delay = 0,
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const MotionTag = motion[Tag];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ staggerChildren: reduce ? 0 : 0.035, delayChildren: delay }}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: "0.16em", marginBottom: "-0.16em" }}
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: reduce ? 0 : "110%", opacity: reduce ? 0 : 1 },
              visible: { y: "0%", opacity: 1 },
            }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

/** Generic in-view fade + lift, with optional index-based stagger. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
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
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
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