import { useEffect, useRef, useState } from "react";
import { MaskReveal } from "@/components/motion/primitives";
import { AsciiImageCurtain } from "@/components/motion/glyph-field";
import { SHOWCASE, TESTIMONIALS } from "@/lib/site-data";
import { usePrefersReducedMotion } from "@/components/motion/vortex-shared";

/**
 * The reference uses a live ASCII veil as the first state of every project
 * card. Hovering reveals the card and clicking keeps it open on touch devices.
 */
function ShowcaseCard({ site }: { site: { name: string; url: string; image: string } }) {
  const [active, setActive] = useState(false);

  return (
    <article
      data-active={active ? "true" : "false"}
      className="group relative bg-ink"
      onPointerDown={() => setActive(true)}
    >
      <a
        href={site.url}
        target="_blank"
        rel="noreferrer"
        className="block cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        <div className="relative mb-3 aspect-16/9 w-full overflow-hidden bg-black">
          <AsciiImageCurtain src={site.image} alt={`${site.name} website`} />
          <img
            src={site.image}
            alt={`${site.name} website built on The Content Architecture`}
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-data-[active=true]:opacity-100 motion-reduce:transition-none"
          />
        </div>
        <h3 className="font-mono text-caption-20 text-ink-muted uppercase transition-colors duration-500 ease-out group-hover:text-ink-foreground group-data-[active=true]:text-ink-foreground motion-reduce:transition-none">
          {site.name}
        </h3>
      </a>
    </article>
  );
}

function TypewriterQuote({ text, resetKey }: { text: string; resetKey: number }) {
  const reduced = usePrefersReducedMotion();
  const hostRef = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(reduced ? text.length : 0);

  useEffect(() => {
    if (reduced) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let index = 0;
    let timer = 0;
    const start = () => {
      if (timer) return;
      timer = window.setInterval(() => {
        index += 1;
        setCount(index);
        if (index >= text.length) window.clearInterval(timer);
      }, 16);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) start();
      },
      { threshold: 0.1 },
    );
    if (hostRef.current) observer.observe(hostRef.current);
    return () => {
      if (timer) window.clearInterval(timer);
      observer.disconnect();
    };
  }, [reduced, resetKey, text]);

  return (
    <>
      <span className="sr-only">“{text}”</span>
      <span ref={hostRef} aria-hidden className="whitespace-pre-wrap">
        <span>“{text.slice(0, count)}</span>
        {!reduced && count < text.length && (
          <span className="relative inline">
            <span className="absolute top-[0.1em] left-0 inline-block h-[1.05em] w-[0.1em] animate-cursor-blink bg-current" />
          </span>
        )}
        <span className="text-transparent">{text.slice(count)}”</span>
      </span>
    </>
  );
}

export function Showcase() {
  const [slide, setSlide] = useState(0);
  const total = TESTIMONIALS.length;

  return (
    <>
      <section
        id="showcase"
        className="bg-ink px-6 py-28 text-ink-foreground md:px-10 lg:px-20 lg:py-40"
      >
        <div className="mb-20 flex flex-col gap-4">
          <MaskReveal
            as="h2"
            text="The work that gets remembered."
            className="display-title text-headline-10"
          />
          <div className="text-body-20 w-full max-w-[600px] text-ink-foreground/75">
            Real sites, shipped on The Content Architecture. With the plumbing already handled, the
            effort goes where it shows. The work here has been recognized by{" "}
            <a
              className="underline decoration-ink-muted underline-offset-4"
              href="https://www.awwwards.com/"
              target="_blank"
              rel="noreferrer"
            >
              Awwwards
            </a>
            ,{" "}
            <a
              className="underline decoration-ink-muted underline-offset-4"
              href="https://thefwa.com/"
              target="_blank"
              rel="noreferrer"
            >
              FWA
            </a>
            , and{" "}
            <a
              className="underline decoration-ink-muted underline-offset-4"
              href="https://www.cssdesignawards.com/"
              target="_blank"
              rel="noreferrer"
            >
              CSSDA
            </a>
            , and picked up across design directories.
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-6">
          {SHOWCASE.map((site) => (
            <ShowcaseCard key={site.name} site={site} />
          ))}
        </div>
      </section>

      <section
        id="reviews"
        className="min-h-[720px] overflow-x-clip bg-ink py-[72px] text-ink-foreground lg:pb-[160px]"
      >
        <div className="relative">
          <div className="cursor-grab overflow-hidden active:cursor-grabbing">
            <div
              className="flex items-stretch gap-4 will-change-transform"
              style={{
                transform: `translate3d(-${slide * 56.2658}%, 0, 0)`,
                transition: "transform 500ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              {TESTIMONIALS.map((t, index) => (
                <div
                  key={t.name}
                  className="min-w-0 shrink-0 grow-0 select-none basis-[calc(90%+16px)] pl-0 first:basis-[calc(90%+16px)] first:pl-4 last:pr-4 md:basis-[55%] md:first:basis-[calc(55%+80px)] md:first:pl-20 md:last:basis-[calc(55%+80px)] md:last:pr-20"
                >
                  <div
                    className="h-full rounded-lg bg-black p-2 shadow-lg ring-1 ring-black"
                    style={{
                      backgroundImage:
                        "repeating-conic-gradient(rgb(255 255 255 / 0.22) 0% 25%, transparent 0% 50%)",
                      backgroundSize: "4px 4px",
                    }}
                  >
                    <figure className="flex h-full min-h-[300px] flex-col justify-between gap-6 overflow-hidden rounded-[4px] bg-black p-6 ring-1 ring-white/10 md:min-h-[460px] md:gap-12 md:p-12">
                      <blockquote className="review-quote">
                        <TypewriterQuote text={t.quote} resetKey={slide + index} />
                      </blockquote>
                      <figcaption className="flex items-center gap-4">
                        <img
                          src={t.avatar}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="size-12 shrink-0 rounded-full object-cover ring-1 ring-white/15"
                        />
                        <div className="min-w-0 flex-1 font-mono text-caption-10 uppercase">
                          <p className="truncate text-ink-foreground">{t.name}</p>
                          <p className="truncate text-ink-muted">{t.role}</p>
                        </div>
                      </figcaption>
                    </figure>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex items-center justify-center gap-4 md:mt-16">
            <button
              type="button"
              disabled={slide === 0}
              onClick={() => setSlide((value) => Math.max(0, value - 1))}
              aria-label="Previous slide"
              className="flex size-11 items-center justify-center font-mono text-body-20 leading-none text-ink-foreground/50 transition-colors hover:text-ink-foreground disabled:pointer-events-none disabled:text-ink-foreground/15 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              [&lt;]
            </button>
            <p className="min-w-14 text-center font-mono text-caption-10 text-ink-muted tabular-nums">
              <span className="text-ink-foreground">{String(slide + 1).padStart(2, "0")}</span>
              <span className="px-1 text-ink-foreground/30">/</span>
              {String(total).padStart(2, "0")}
            </p>
            <button
              type="button"
              disabled={slide === total - 1}
              onClick={() => setSlide((value) => Math.min(total - 1, value + 1))}
              aria-label="Next slide"
              className="flex size-11 items-center justify-center font-mono text-body-20 leading-none text-ink-foreground/50 transition-colors hover:text-ink-foreground disabled:pointer-events-none disabled:text-ink-foreground/15 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              [&gt;]
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
