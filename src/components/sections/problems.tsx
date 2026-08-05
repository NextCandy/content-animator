import { useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  Reveal,
  Scramble,
} from "@/components/motion/primitives";
import { PROBLEMS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function Problems() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section ref={ref} className="bg-ink py-28 text-ink-foreground md:py-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <p className="mono-label text-ink-muted">Common problems</p>
        </Reveal>

        <ul className="mt-14 border-t border-ink-border">
          {PROBLEMS.map((p, i) => (
            <motion.li
              key={p.n}
              initial={{ opacity: 0, y: reduce ? 0 : 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: 0.6,
                delay: reduce ? 0 : i * 0.045,
                ease: [0.16, 1, 0.3, 1],
              }}
              onMouseEnter={() => setHovered(p.n)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "group flex items-baseline gap-4 border-b border-ink-border py-5 transition-colors duration-300 md:gap-8",
                hovered && hovered !== p.n
                  ? "text-ink-muted/50"
                  : "text-ink-foreground",
              )}
            >
              <span className="mono-label w-10 shrink-0 text-ink-muted">{p.n}</span>
              <span className="flex-1 text-lg leading-snug tracking-tight md:text-2xl">
                {p.text}
              </span>
              <span className="mono-label shrink-0 text-ink-muted">
                <Scramble text={p.hrs} />
              </span>
            </motion.li>
          ))}
        </ul>

        <Reveal delay={0.1} className="mt-10">
          <p className="mono-label text-ink-foreground">
            <Scramble
              text="ESTIMATED TIME LOST: ~24 HOURS PER PROJECT"
              duration={1100}
            />{" "}
            <span className="text-ink-muted">(3 FULL DAYS)</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}