import { useState } from "react";
import {
  motion,
  useReducedMotion,
  Reveal,
  SplitButton,
} from "@/components/motion/primitives";
import { FAQS, STRIPE_URL } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function Faq() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 py-28 md:py-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <Reveal>
            <h2 className="display-title text-[clamp(1.9rem,3.8vw,3.25rem)]">
              Before you buy
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <SplitButton label="Get" sublabel="access" href={STRIPE_URL} />
          </Reveal>
        </div>

        <ul className="mt-14">
          {FAQS.map((item, i) => {
            const expanded = open === i;
            return (
              <motion.li
                key={item.q}
                initial={{ opacity: 0, y: reduce ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{
                  duration: 0.55,
                  delay: reduce ? 0 : (i % 4) * 0.05,
                  ease: [0, 0, 0.2, 1],
                }}
                className="border-t border-border last:border-b"
              >
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : i)}
                  className="flex w-full items-baseline gap-5 py-6 text-left"
                >
                  <span className="mono-label w-20 shrink-0 text-muted-foreground">
                    Q.{String(i + 1).padStart(3, "0")} /
                  </span>
                  <span className="flex-1 text-lg tracking-tight md:text-2xl">
                    {item.q}
                  </span>
                  <span
                    className={cn(
                      "mono-label shrink-0 transition-transform duration-300",
                      expanded ? "rotate-45" : "rotate-0",
                    )}
                  >
                    +
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
                  transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="max-w-3xl space-y-4 pb-8 md:pl-25">
                    {item.a.map((para) => (
                      <p key={para.slice(0, 24)} className="leading-relaxed text-muted-foreground">
                        {para}
                      </p>
                    ))}
                  </div>
                </motion.div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}