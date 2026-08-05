import { createFileRoute } from "@tanstack/react-router";
import { MaskReveal, Reveal } from "@/components/motion/primitives";

const title = "Terms of Service — The Content Architecture";
const description =
  "Licence terms for The Content Architecture: perpetual licence, unlimited projects, commercial use, no resale of the architecture itself.";

const SECTIONS = [
  {
    h: "Licence",
    p: "Purchase grants a perpetual, non-exclusive licence to use the repository on unlimited projects, including commercial client work, with no attribution required.",
  },
  {
    h: "Restrictions",
    p: "You may not resell, redistribute, or republish the architecture itself, in whole or in substantial part, as a competing product, template, or boilerplate.",
  },
  {
    h: "Updates",
    p: "Your licence includes every update released for as long as the architecture is maintained. Updates are delivered through the same repository access you receive on purchase.",
  },
  {
    h: "Refunds",
    p: "Because the full source is delivered immediately on purchase, all sales are final. Read the FAQ before buying if you are unsure whether this is for you.",
  },
  {
    h: "Liability",
    p: "The repository is provided as is, without warranty of any kind. The maintainer is not liable for damages arising from its use in your projects.",
  },
];

export const Route = createFileRoute("/terms-of-service")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: TermsOfService,
});

function TermsOfService() {
  return (
    <section className="px-6 pt-40 pb-28 md:px-10 md:pt-48">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <p className="mono-label text-muted-foreground">Legal</p>
        </Reveal>
        <MaskReveal
          as="h1"
          text="Terms of Service"
          className="display-title mt-6 text-[clamp(2.25rem,5.2vw,4.5rem)]"
        />
        <div className="mt-16 max-w-2xl">
          {SECTIONS.map((s, i) => (
            <Reveal key={s.h} delay={i * 0.06}>
              <div className="border-t border-border py-8">
                <p className="mono-label text-muted-foreground">
                  {String(i + 1).padStart(3, "0")} / {s.h}
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">{s.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}