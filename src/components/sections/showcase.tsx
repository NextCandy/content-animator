import { useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  Reveal,
} from "@/components/motion/primitives";
import { AsciiField } from "@/components/motion/ascii-field";
import { useScrollContainer } from "@/components/motion/scroll-container";
import { SHOWCASE, TESTIMONIALS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

/**
 * One showcase card: an ASCII canvas masks the real content until the card is
 * hovered (500ms ease-out dissolve) or clicked/tapped, which sets
 * data-active="true" so the reveal sticks. Clicking again toggles it back.
 */
function ShowcaseCard({ site, index }: { site: { name: string; url: string }; index: number }) {
  const [active, setActive] = useState(false);

  return (
    <div
      data-active={active ? "true" : "false"}
      className="group relative bg-background"
    >
      <button
        type="button"
        aria-pressed={active}
        onClick={() => setActive((a) => !a)}
        className="block w-full cursor-pointer p-6 text-left select-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        <div className="aspect-16/9 w-full overflow-hidden rounded-[6px] bg-ink">
          <div className="size-full origin-center bg-[repeating-linear-gradient(135deg,transparent_0_10px,rgb(255_255_255/0.06)_10px_20px)] opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-data-[active=true]:opacity-100 motion-reduce:transition-none" />
        </div>
        <div className="mt-5 flex items-baseline justify-between">
          <span className="text-lg tracking-tight opacity-40 transition-opacity duration-500 ease-out group-hover:opacity-100 group-data-[active=true]:opacity-100 motion-reduce:opacity-100 motion-reduce:transition-none">
            {site.name}
          </span>
          <span className="mono-label text-muted-foreground">
            {String(index + 1).padStart(3, "0")}
          </span>
        </div>
      </button>

      {/* ASCII mask sitting above the card content. */}
      <div className="pointer-events-none absolute inset-0 size-full bg-ink transition-opacity duration-500 ease-out group-hover:opacity-0 group-data-[active=true]:opacity-0 motion-reduce:hidden motion-reduce:transition-none">
        <AsciiField color="rgba(255,255,255,0.16)" fontSize={11} />
      </div>

      <a
        href={site.url}
        target="_blank"
        rel="noreferrer"
        tabIndex={active ? 0 : -1}
        className="mono-label absolute right-6 bottom-6 z-1 opacity-0 transition-opacity duration-200 ease-out group-data-[active=true]:opacity-100 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        Visit ↗
      </a>
    </div>
  );
}

export function Showcase() {
  const reduce = useReducedMotion();
  const [slide, setSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const container = useScrollContainer();
  const fallback = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: container ?? fallback,
    offset: ["start start", "end end"],
  });
  const gridY = useTransform(scrollYProgress, [0.05, 0.85], ["0%", "-46%"]);
  const total = TESTIMONIALS.length;

  return (
    <section
      id="showcase"
      ref={sectionRef}
      className="relative scroll-mt-24 py-28 lg:h-[240svh] lg:py-0"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-center lg:overflow-hidden lg:py-[10svh]">
        <Reveal>
          <p className="mono-label text-muted-foreground">Showcase</p>
          <h2 className="display-title mt-6 max-w-3xl text-[clamp(1.9rem,3.4vw,3rem)]">
            Client work shipped on this architecture.
          </h2>
        </Reveal>

        <div className="mt-10 lg:max-h-[52svh] lg:overflow-hidden">
          <motion.div
            style={{ y: reduce ? "0%" : gridY }}
            className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
          >
            {SHOWCASE.map((site, i) => (
              <ShowcaseCard key={site.name} site={site} index={i} />
            ))}
          </motion.div>
        </div>
      </div>

      <div id="reviews" className="mx-auto max-w-[1400px] scroll-mt-24 overflow-x-clip px-6 md:px-10">
        <div className="mt-24 border-t border-border pt-14 lg:mt-0">
          <Marquee speed={46} className="mb-12 opacity-70">
            {TESTIMONIALS.concat(TESTIMONIALS).map((t, i) => (
              <span key={i} className="mono-label px-6 text-muted-foreground">
                {t.name} — {t.role}
              </span>
            ))}
          </Marquee>
          <div className="overflow-hidden" ref={trackRef}>
            <motion.div
              className="flex"
              animate={{ x: `-${slide * 100}%` }}
              transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
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
                    "h-px w-8 transition-colors duration-300",
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