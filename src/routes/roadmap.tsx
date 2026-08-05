import { createFileRoute } from "@tanstack/react-router";
import { MaskReveal, Reveal, Scramble } from "@/components/motion/primitives";
import { ROADMAP } from "@/lib/site-data";

const title = "Roadmap — The Content Architecture";
const description =
  "What has shipped, what is in progress, and what is planned for the Next.js and Astro editions of The Content Architecture.";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Roadmap,
});

function Roadmap() {
  return (
    <section className="px-6 pt-40 pb-28 md:px-10 md:pt-48">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <p className="mono-label text-muted-foreground">Roadmap</p>
        </Reveal>
        <MaskReveal
          as="h1"
          text="Shipped, in progress, planned."
          className="display-title mt-6 max-w-3xl text-[clamp(2.25rem,5.2vw,4.5rem)]"
        />

        <div className="mt-20 space-y-16">
          {ROADMAP.map((group, gi) => (
            <div key={group.status} className="grid gap-6 border-t border-border pt-8 md:grid-cols-12">
              <p className="mono-label text-muted-foreground md:col-span-3">
                <Scramble text={group.status.toUpperCase()} />
              </p>
              <ul className="md:col-span-9">
                {group.items.map((item, i) => (
                  <Reveal key={item} delay={i * 0.06}>
                    <li className="flex items-baseline gap-5 border-b border-border py-5">
                      <span className="mono-label w-14 text-muted-foreground">
                        {String(gi + 1).padStart(2, "0")}.{String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-lg tracking-tight md:text-2xl">
                        {item}
                      </span>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}