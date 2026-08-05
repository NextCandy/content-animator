import {
  motion,
  useReducedMotion,
  Reveal,
  Scramble,
  SplitButton,
} from "@/components/motion/primitives";
import { INCLUDED, PLANS, STRIPE_URL } from "@/lib/site-data";
import { cn } from "@/lib/utils";

function PricingDivider() {
  return (
    <div className="flex h-1 justify-center text-ink">
      <div className="h-1 w-[90%] rounded-full bg-current" aria-hidden />
    </div>
  );
}

export function Pricing() {
  const reduce = useReducedMotion();

  return (
    <section id="pricing" className="bg-background py-28 text-foreground md:py-40 lg:pb-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-20">
        <div className="grid items-end gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <h2 className="display-title text-headline-10 whitespace-pre-line">
              {"Two editions.\nOne architecture.\nLifetime updates."}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9">
            <p className="mono-label w-full text-muted-foreground">
              Astro and bundle pricing announced at launch.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal
              key={plan.name}
              y={reduce ? 0 : 30}
              delay={reduce ? 0 : i * 0.09}
              className={cn(
                "relative isolate flex h-[400.21875px] min-h-0 flex-col text-ink-foreground",
              )}
            >
              <div className="flex flex-col gap-3 rounded-lg bg-ink p-8">
                <span className="font-mono text-caption-10 text-ink-muted uppercase">
                  {plan.name}
                </span>
                <p className="display-title text-[40px] leading-none">
                  <Scramble text={plan.price} duration={500} />
                </p>
              </div>

              <PricingDivider />

              <ul className="flex min-h-0 flex-1 flex-col gap-1 rounded-lg bg-ink p-8 font-mono text-caption-10 uppercase">
                {plan.points.map((point, pi) => (
                  <li key={point} className="flex gap-6 text-ink-foreground/80">
                    <span className="shrink-0 text-ink-muted">
                      {String(pi + 1).padStart(3, "0")}
                    </span>
                    <span className="flex-1">{point}</span>
                  </li>
                ))}
              </ul>

              <PricingDivider />

              <div className="flex flex-col gap-3 rounded-lg bg-ink p-8">
                {plan.status === "available" ? (
                  <SplitButton label="Get" sublabel="access" href={STRIPE_URL} tone="cream" />
                ) : (
                  <>
                    <p className="font-mono text-caption-10 text-ink-muted uppercase">
                      In development
                    </p>
                    <form
                      onSubmit={(e) => e.preventDefault()}
                      className="flex w-full min-w-0 flex-col gap-3"
                    >
                      <div className="flex gap-1 lg:flex-row">
                        <input
                          type="email"
                          required
                          placeholder="your@email.com"
                          aria-label="Email"
                          className="h-12 min-w-0 flex-1 rounded-lg border border-ink-border bg-transparent px-4 font-mono text-body-10 text-ink-foreground outline-none placeholder:text-ink-muted focus:border-ink-foreground"
                        />
                        <button
                          type="submit"
                          className="h-12 shrink-0 rounded-lg bg-ink-foreground px-6 font-mono text-body-10 uppercase text-ink transition-colors duration-200 ease-out hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                        >
                          Notify
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-16">
          <div className="flex flex-col gap-4 rounded-lg bg-ink p-8 text-ink-foreground">
            <span className="font-mono text-caption-10 text-ink-muted uppercase">
              Every edition includes
            </span>
            <ul className="font-mono text-caption-10 uppercase lg:columns-2 lg:gap-x-16">
              {INCLUDED.map((item, i) => (
                <li key={item} className="flex break-inside-avoid gap-6 py-0.5">
                  <span className="text-ink-muted">{String(i + 1).padStart(3, "0")}</span>
                  <span className="text-ink-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
