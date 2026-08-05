import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  MaskReveal,
  FadeIn,
  SplitButton,
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
  const panelWidth = useTransform(scrollYProgress, [0, 1], ["49.375%", "100%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden">
      <motion.div
        style={{ width: reduce ? "49.375%" : panelWidth }}
        className="absolute inset-y-0 right-0 hidden bg-ink md:block"
      >
        <VortexPanel />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="pointer-events-none relative mx-auto grid min-h-[100svh] max-w-[1400px] grid-cols-1 items-center px-6 py-32 md:grid-cols-12 md:gap-4 md:px-0"
      >
        <div className="pointer-events-auto md:col-span-5 md:-translate-y-10 md:pl-20">
          <FadeIn
            as="p"
            delay={0.1}
            className="relative inline-block font-mono text-caption-20 text-foreground uppercase"
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
            className="display-title mt-[22px] max-w-[438px] text-[40px] leading-none tracking-normal"
          />

          <FadeIn
            as="p"
            delay={0.55}
            y={reduce ? 0 : 16}
            className="text-body-20 mt-9 max-w-[438px] text-muted-foreground"
          >
            Every run invents a new one, none decided. This Next.js and Sanity kit commits six years
            of decisions. Your agent builds inside them, and checks its work through MCP and a real
            Chrome.
          </FadeIn>

          <FadeIn
            as="p"
            delay={0.3}
            className="mt-5 font-mono text-caption-10 text-muted-foreground uppercase"
          >
            For engineers who work in Next.js and Sanity.
          </FadeIn>

          <FadeIn delay={0.85} y={reduce ? 0 : 14} className="mt-7">
            <SplitButton label="Get" sublabel="access" href={STRIPE_URL} />
          </FadeIn>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <div
        aria-hidden
        className="absolute bottom-10 left-[calc(50%-11px)] z-10 hidden h-[68px] w-[22px] rounded-[4px] bg-ink lg:block"
      >
        <span className="animate-hero-scroll-cue absolute top-2 left-1/2 block h-2 w-1 -translate-x-1/2 bg-ink-foreground motion-reduce:hidden" />
        <span className="absolute top-2 left-1/2 hidden h-2 w-1 -translate-x-1/2 bg-ink-foreground motion-reduce:block" />
      </div>

      <div className="absolute bottom-10 left-6 z-10 w-[calc(50%-3rem)] overflow-hidden md:left-10 lg:bottom-8 lg:left-20 lg:w-[444px]">
        <div className="hidden grid-cols-3 gap-x-16 gap-y-2 font-mono text-caption-10 text-foreground uppercase lg:grid">
          {TICKER_ITEMS.map((item, i) => (
            <span key={item} className="relative whitespace-nowrap">
              {item}
              {i === TICKER_ITEMS.length - 1 && (
                <span
                  aria-hidden
                  className="animate-cursor-blink absolute top-0 left-full ml-px h-[1em] w-[0.55em] translate-y-[0.15em] bg-current motion-reduce:hidden"
                />
              )}
            </span>
          ))}
        </div>
        <div className="lg:hidden">
          <div className="flex gap-8 whitespace-nowrap font-mono text-caption-10 text-muted-foreground uppercase">
            {TICKER_ITEMS.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
