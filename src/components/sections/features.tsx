import { useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  Reveal,
} from "@/components/motion/primitives";
import { FEATURES } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function Features() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>(FEATURES[0]?.n ?? null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="features" ref={ref} className="scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-28">
            <Reveal>
              <p className="mono-label text-muted-foreground">Features</p>
              <h2 className="display-title mt-6 text-[clamp(1.9rem,3.4vw,3rem)]">
                Nine decisions you stop making.
              </h2>
              <div className="mt-8 h-px w-full bg-border">
                <motion.div
                  style={{ scaleX: reduce ? 1 : barScale }}
                  className="h-px origin-left bg-foreground"
                />
              </div>
              <p className="mono-label mt-4 text-muted-foreground">
                001 — 009 / COMMITTED
              </p>
            </Reveal>
          </div>
        </div>

        <ul className="md:col-span-8">
          {FEATURES.map((f, i) => {
            const expanded = open === f.n;
            return (
              <motion.li
                key={f.n}
                initial={{ opacity: 0, y: reduce ? 0 : 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12% 0px" }}
                transition={{
                  duration: 0.65,
                  delay: reduce ? 0 : (i % 3) * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="border-t border-border last:border-b"
              >
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : f.n)}
                  aria-expanded={expanded}
                  className="flex w-full items-baseline gap-5 py-6 text-left"
                >
                  <span className="mono-label w-14 shrink-0 text-muted-foreground">
                    {f.n} /
                  </span>
                  <span className="flex-1 text-xl tracking-tight md:text-3xl">
                    {f.title}
                  </span>
                  <span
                    className={cn(
                      "mono-label shrink-0 transition-transform duration-500",
                      expanded ? "rotate-45" : "rotate-0",
                    )}
                  >
                    +
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: expanded ? "auto" : 0,
                    opacity: expanded ? 1 : 0,
                  }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-8 pl-0 leading-relaxed text-muted-foreground md:pl-[4.75rem]">
                    {f.body}
                  </p>
                </motion.div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}