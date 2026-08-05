import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  MaskReveal,
  SplitButton,
  Marquee,
} from "@/components/motion/primitives";
import { STRIPE_URL, TICKER_ITEMS } from "@/lib/site-data";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const panelWidth = useTransform(scrollYProgress, [0, 1], ["50%", "100%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden">
      <motion.div
        aria-hidden
        style={{ width: reduce ? "50%" : panelWidth }}
        className="absolute inset-y-0 right-0 hidden bg-ink md:block"
      />
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-center px-6 py-32 md:px-10"
      >
        <div className="max-w-[46rem]">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mono-label text-foreground"
          >
            Built for agentic development.
          </motion.p>

          <MaskReveal
            as="h1"
            delay={0.1}
            text="The Sanity setup agents don't reinvent."
            className="display-title mt-8 text-[clamp(2.75rem,8.2vw,6.5rem)]"
          />

          <motion.p
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 max-w-xl text-[1.0625rem] leading-relaxed text-muted-foreground"
          >
            Every run invents a new one, none decided. This Next.js and Sanity kit
            commits six years of decisions. Your agent builds inside them, and checks
            its work through MCP and a real Chrome.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mono-label mt-8 text-muted-foreground"
          >
            For engineers who work in Next.js and Sanity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10"
          >
            <SplitButton label="Get" sublabel="access" href={STRIPE_URL} />
          </motion.div>
        </div>
      </motion.div>

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