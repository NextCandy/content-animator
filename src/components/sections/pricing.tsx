import {
  motion,
  useReducedMotion,
  Reveal,
  Scramble,
  SplitButton,
} from "@/components/motion/primitives";
import { INCLUDED, PLANS, STRIPE_URL } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function Pricing() {
  const reduce = useReducedMotion();

  return (
    <section
      id="pricing"
      className="scroll-mt-24 bg-ink py-28 text-ink-foreground md:py-40"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <Reveal>
            <h2 className="display-title max-w-2xl text-[clamp(1.9rem,3.8vw,3.25rem)]">
              Two editions. One architecture. Lifetime updates.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mono-label max-w-[16rem] text-ink-muted">
              Astro and bundle pricing announced at launch.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-px border border-ink-border bg-ink-border md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: reduce ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{
                duration: 0.4,
                delay: reduce ? 0 : i * 0.09,
                ease: [0, 0, 0.2, 1],
              }}
              className="flex flex-col bg-ink p-8"
            >
              <p className="mono-label text-ink-muted">{plan.name}</p>
              <p className="display-title mt-6 text-5xl">
                <Scramble text={plan.price} duration={900} />
              </p>
              <ul className="mt-8 flex-1 space-y-3">
                {plan.points.map((point, pi) => (
                  <li key={point} className="mono-label flex gap-3 text-ink-muted">
                    <span>{String(pi + 1).padStart(3, "0")}</span>
                    <span className="flex-1">{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                {plan.status === "available" ? (
                  <SplitButton
                    label="Get"
                    sublabel="access"
                    href={STRIPE_URL}
                    tone="cream"
                  />
                ) : (
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="flex items-center gap-px"
                  >
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      aria-label="Email"
                      className="mono-label w-full rounded-l-[var(--radius)] border border-ink-border bg-transparent px-4 py-3.5 text-ink-foreground outline-none placeholder:text-ink-muted focus:border-ink-foreground"
                    />
                    <button
                      type="submit"
                      className="mono-label shrink-0 rounded-r-[var(--radius)] bg-ink-foreground px-5 py-4 text-ink transition-transform duration-300 hover:translate-x-1"
                    >
                      Notify me
                    </button>
                  </form>
                )}
                <p className="mono-label mt-3 text-ink-muted">
                  {plan.status === "available" ? "Available now" : "In development"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-20">
          <p className="mono-label text-ink-muted">Every edition includes</p>
          <ul className="mt-8 grid gap-px border border-ink-border bg-ink-border sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map((item, i) => (
              <li
                key={item}
                className={cn(
                  "mono-label flex gap-4 bg-ink px-5 py-4 text-ink-muted transition-colors hover:text-ink-foreground",
                )}
              >
                <span>{String(i + 1).padStart(3, "0")}</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}