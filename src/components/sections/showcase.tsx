import { useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  Reveal,
} from "@/components/motion/primitives";
import { SHOWCASE, TESTIMONIALS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function Showcase() {
  const reduce = useReducedMotion();
  const [slide, setSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = TESTIMONIALS.length;

  return (
    <section id="showcase" className="scroll-mt-24 py-28 md:py-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <p className="mono-label text-muted-foreground">Showcase</p>
          <h2 className="display-title mt-6 max-w-3xl text-[clamp(1.9rem,3.4vw,3rem)]">
            Client work shipped on this architecture.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {SHOWCASE.map((site, i) => (
            <motion.a
              key={site.name}
              href={site.url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: reduce ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{
                duration: 0.65,
                delay: reduce ? 0 : (i % 3) * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative bg-background p-6 transition-colors duration-300 hover:bg-ink"
            >
              <div className="aspect-16/9 w-full overflow-hidden rounded-[6px] bg-accent">
                <div className="size-full origin-center bg-[repeating-linear-gradient(135deg,transparent_0_10px,rgb(0_0_0/0.05)_10px_20px)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" />
              </div>
              <div className="mt-5 flex items-baseline justify-between">
                <span className="text-lg tracking-tight transition-colors group-hover:text-ink-foreground">
                  {site.name}
                </span>
                <span className="mono-label text-muted-foreground transition-colors group-hover:text-ink-muted">
                  {String(i + 1).padStart(3, "0")}
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-24 border-t border-border pt-14">
          <div className="overflow-hidden" ref={trackRef}>
            <motion.div
              className="flex"
              animate={{ x: `-${slide * 100}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="w-full shrink-0 pr-8">
                  <blockquote className="display-title max-w-4xl text-[clamp(1.35rem,2.6vw,2.25rem)] leading-tight">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mono-label mt-8 flex items-center gap-4 text-muted-foreground">
                    <span className="size-8 rounded-full bg-accent" />
                    {t.name} — {t.role}
                  </figcaption>
                </figure>
              ))}
            </motion.div>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSlide((s) => (s - 1 + total) % total)}
              aria-label="Previous testimonial"
              className="mono-label rounded-[6px] border border-border px-3 py-2 transition-colors hover:bg-ink hover:text-ink-foreground"
            >
              [&lt;]
            </button>
            <button
              type="button"
              onClick={() => setSlide((s) => (s + 1) % total)}
              aria-label="Next testimonial"
              className="mono-label rounded-[6px] border border-border px-3 py-2 transition-colors hover:bg-ink hover:text-ink-foreground"
            >
              [&gt;]
            </button>
            <span className="mono-label text-muted-foreground">
              {String(slide + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <span className="ml-auto flex gap-1.5">
              {TESTIMONIALS.map((t, i) => (
                <span
                  key={t.name}
                  className={cn(
                    "h-px w-8 transition-colors duration-500",
                    i === slide ? "bg-foreground" : "bg-border",
                  )}
                />
              ))}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}