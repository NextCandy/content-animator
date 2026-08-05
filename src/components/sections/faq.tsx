import { useState } from "react";
import { SplitButton } from "@/components/motion/primitives";
import { FAQS, STRIPE_URL } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="bg-ink px-6 py-28 text-ink-foreground md:px-10 md:py-40 lg:px-20 lg:py-40"
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-y-16 lg:grid-cols-12 lg:gap-x-4 lg:gap-y-32">
        <div className="lg:sticky lg:top-20 lg:col-span-4 lg:flex lg:max-h-[calc(100svh-10rem)] lg:flex-col lg:justify-between lg:self-stretch">
          <h2 className="display-title text-headline-10">Before you buy</h2>
          <SplitButton
            label="Get"
            sublabel="access"
            href={STRIPE_URL}
            tone="cream"
            className="mt-14 self-start lg:mt-0"
          />
        </div>

        <ul className="flex flex-col lg:col-span-7 lg:col-start-6">
          {FAQS.map((item, i) => {
            const expanded = open === i;
            return (
              <li
                key={item.q}
                data-active={expanded ? "true" : "false"}
                className="group border-b border-ink-border"
              >
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : i)}
                  className="group flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left font-mono text-caption-20 uppercase focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 text-ink-muted">
                      Q.{String(i + 1).padStart(3, "0")} /
                    </span>
                    <span className="min-w-0">{item.q}</span>
                  </span>
                  <span
                    className={cn(
                      "relative grid size-6 shrink-0 place-items-center rounded-[2px] bg-white/10 text-ink-muted transition-colors group-hover:bg-white/20",
                      expanded && "text-ink-foreground",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute text-base leading-none transition-transform duration-200 ease-out",
                        expanded && "rotate-45",
                      )}
                    >
                      +
                    </span>
                  </span>
                </button>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-data-[active=true]:grid-rows-[1fr] motion-reduce:transition-none">
                  <div className="overflow-hidden">
                    <div className="max-w-3xl space-y-[1em] pb-6">
                      {item.a.map((para) => (
                        <p key={para.slice(0, 24)} className="text-body-20 text-[#dedede]">
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
