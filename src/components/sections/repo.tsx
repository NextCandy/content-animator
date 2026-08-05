import { useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  Reveal,
} from "@/components/motion/primitives";
import { README_LINES } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const TABS = ["Next.js", "Astro"] as const;

export function Repo() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Next.js");
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 60, reduce ? 0 : -60]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.96, 1]);

  return (
    <section
      id="the-repo"
      ref={ref}
      className="scroll-mt-24 bg-ink py-28 text-ink-foreground md:py-40"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="mono-label text-ink-muted">The Repo</p>
            <h2 className="display-title mt-6 text-[clamp(1.9rem,3.4vw,3rem)]">
              This is the actual repo.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex gap-px overflow-hidden rounded-[8px] border border-ink-border">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    "mono-label px-4 py-2 transition-colors",
                    tab === t
                      ? "bg-ink-foreground text-ink"
                      : "text-ink-muted hover:text-ink-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <motion.div
          style={{ y, scale }}
          className="mt-14 overflow-hidden rounded-[10px] border border-ink-border bg-black/30"
        >
          <div className="flex items-center justify-between border-b border-ink-border px-4 py-3">
            <span className="mono-label text-ink-muted">README.md</span>
            <span className="flex gap-2">
              <kbd className="mono-label rounded-[4px] border border-ink-border px-2 py-1 text-ink-muted">
                Ctrl J
              </kbd>
              <kbd className="mono-label rounded-[4px] border border-ink-border px-2 py-1 text-ink-muted">
                Ctrl K
              </kbd>
            </span>
          </div>
          <div className="max-h-[28rem] overflow-auto px-4 py-5 font-mono text-[12.5px] leading-6">
            {README_LINES.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: reduce ? 0 : -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: reduce ? 0 : Math.min(i * 0.02, 0.6),
                }}
                className="flex gap-5"
              >
                <span className="w-6 shrink-0 select-none text-right text-ink-muted/50">
                  {i + 1}
                </span>
                <span
                  className={cn(
                    line.startsWith("#")
                      ? "text-ink-foreground"
                      : line.startsWith("-")
                        ? "text-ink-muted"
                        : "text-signal/90",
                  )}
                >
                  {line || "\u00A0"}
                </span>
              </motion.div>
            ))}
            <span className="ml-11 inline-block h-4 w-2 animate-[caret_1s_step-end_infinite] bg-ink-foreground align-middle" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}