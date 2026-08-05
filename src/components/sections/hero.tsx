import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  MaskReveal,
  FadeIn,
  SplitButton,
  Marquee,
} from "@/components/motion/primitives";
import { VortexPanel } from "@/components/motion/ascii-field";
import { useScrollContainer } from "@/components/motion/scroll-container";
import { STRIPE_URL, TICKER_ITEMS } from "@/lib/site-data";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const container = useScrollContainer();
  const fallback = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    container: container ?? fallback,
    offset: ["start start", "end start"],
  });
  const panelWidth = useTransform(scrollYProgress, [0, 1], ["50%", "100%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden">
      <motion.div
        style={{ width: reduce ? "50%" : panelWidth }}
        className="absolute inset-y-0 right-0 hidden bg-ink md:block"
      >
        <VortexPanel />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="pointer-events-none relative mx-auto grid min-h-[100svh] max-w-[1400px] grid-cols-1 items-center px-6 py-32 md:grid-cols-2 md:px-10"
      >
        <div className="pointer-events-auto max-w-[46rem] md:pr-10">
          <FadeIn
            as="p"
            delay={0.1}
            className="mono-label relative inline-block text-foreground"
          >
            Built for agentic development.
            <span
              aria-hidden
              className="animate-cursor-blink absolute top-0 left-full ml-px h-[1em] w-[0.55em] translate-y-[0.15em] bg-current motion-reduce:hidden"
            />
            <span
              aria-hidden
              className="absolute top-0 left-full ml-px hidden h-[1em] w-[0.55em] translate-y-[0.15em] bg-current motion-reduce:block"
            />
          </FadeIn>

          <MaskReveal
            as="h1"
            delay={0.1}
            text="The Sanity setup agents don't reinvent."
            className="display-title mt-8 text-[clamp(2.25rem,4.4vw,4rem)]"
          />

          <FadeIn
            as="p"
            delay={0.55}
            y={reduce ? 0 : 16}
            className="mt-10 max-w-xl text-[1.0625rem] leading-relaxed text-muted-foreground"
          >
            Every run invents a new one, none decided. This Next.js and Sanity kit
            commits six years of decisions. Your agent builds inside them, and checks
            its work through MCP and a real Chrome.
          </FadeIn>

          <FadeIn
            as="p"
            delay={0.3}
            className="mono-label mt-8 text-muted-foreground"
          >
            For engineers who work in Next.js and Sanity.
          </FadeIn>

          <FadeIn delay={0.85} y={reduce ? 0 : 14} className="mt-10">
            <SplitButton label="Get" sublabel="access" href={STRIPE_URL} />
          </FadeIn>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <div
        aria-hidden
        className="absolute bottom-24 left-6 z-10 hidden h-16 w-px bg-border md:left-10 lg:block"
      >
        <span className="animate-hero-scroll-cue absolute top-0 left-1/2 block h-2 w-px -translate-x-1/2 bg-foreground motion-reduce:hidden" />
        <span className="absolute top-0 left-1/2 hidden h-2 w-px -translate-x-1/2 bg-foreground motion-reduce:block" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-border bg-background/70 backdrop-blur-sm">
        <Marquee speed={30} className="py-3">
          {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, i) => (
            <span
              key={i}
              className="mono-label flex items-center px-6 text-muted-foreground"
            >
              {item}
              <span className="ml-6 inline-block size-1 bg-foreground/40" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
