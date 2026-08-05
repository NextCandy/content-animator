import { LineReveal, MaskReveal, Reveal } from "@/components/motion/primitives";
import { GlyphField } from "@/components/motion/glyph-field";
import { FEATURES } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const INDENTS = ["lg:ml-0", "lg:ml-[20%]", "lg:ml-[40%]"] as const;

export function Features() {
  return (
    <section
      id="features"
      className="relative isolate min-h-svh overflow-clip bg-ink py-40 pb-40 text-ink-foreground lg:pb-40"
    >
      {/* Pinned black panel with the live ASCII field behind the content. */}
      <div className="absolute inset-0 z-0">
        <div className="size-full lg:sticky lg:top-0 lg:h-svh">
          <GlyphField model interactive label="Click" />
        </div>
      </div>

      <div className="relative z-10 pointer-events-none grid grid-cols-1 gap-4 px-6 lg:grid-cols-12 lg:px-20">
        <div className="lg:col-span-5">
          <div className="flex flex-col">
            <div className="pointer-events-auto flex flex-col gap-8">
              <MaskReveal
                as="h2"
                text="Every decision already made. So you can skip to the actual work."
                className="display-title text-headline-10"
              />
              <Reveal delay={0.1}>
                <p className="text-body-20 text-ink-foreground/80">
                  The Content Architecture is the production foundation underneath my client work.
                  Hundreds of choices, schema, fetching, structure, SEO, made once over six years
                  and committed. Not a starter you outgrow in a month. Clone it, rename it, ship.
                  The architecture is fixed; the tools are defaults you can swap. Fixed decisions
                  are also what make agentic development work: an agent inside committed conventions
                  ships, an agent without them redesigns.
                </p>
              </Reveal>
            </div>
          </div>
          <ul className="col-span-12 mt-20 flex flex-col gap-16 text-ink-foreground">
            {FEATURES.map((f, i) => (
              <li
                key={f.n}
                className={cn(
                  "pointer-events-auto flex flex-col gap-3 lg:max-w-1/2 lg:gap-3",
                  INDENTS[i % 3],
                )}
              >
                <LineReveal
                  as="p"
                  className="font-mono text-caption-20 text-ink-muted uppercase"
                  text={`${f.n} / ${f.title.toUpperCase()}`}
                />
                <LineReveal as="p" className="text-body-10 text-ink-foreground/80" text={f.body} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
