import { MaskReveal, Reveal } from "@/components/motion/primitives";

export function Narrative() {
  return (
    <section className="py-28 md:py-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-7">
            <MaskReveal
              text="The page builder alone costs you days. Every single time."
              className="display-title text-[clamp(2rem,4.6vw,3.75rem)]"
            />
          </div>
          <div className="space-y-6 text-muted-foreground md:col-span-5 md:pt-3">
            <Reveal delay={0.1}>
              <p className="leading-relaxed">
                It's never the easy stuff that hurts. It's the page builder, modeled
                from scratch again. Draft mode and live preview, wired up and subtly
                broken again. The cache bug where published content goes stale and the
                client swears you shipped something wrong. A Studio structure your
                editors actually understand, instead of one they email you about.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="leading-relaxed">
                This is the part nobody quotes for and everybody rebuilds. Days gone
                before the real work starts.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-32 grid gap-14 md:grid-cols-12">
          <div className="md:col-span-7">
            <MaskReveal
              text="Every decision already made. So you can skip to the actual work."
              className="display-title text-[clamp(2rem,4.6vw,3.75rem)]"
            />
          </div>
          <div className="md:col-span-5 md:pt-3">
            <Reveal delay={0.1}>
              <p className="leading-relaxed text-muted-foreground">
                The Content Architecture is the production foundation underneath my
                client work. Hundreds of choices, schema, fetching, structure, SEO,
                made once over six years and committed. Not a starter you outgrow in a
                month. Clone it, rename it, ship. The architecture is fixed; the tools
                are defaults you can swap. Fixed decisions are also what make agentic
                development work: an agent inside committed conventions ships, an agent
                without them redesigns.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}