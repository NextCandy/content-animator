import { LineReveal } from "@/components/motion/primitives";
import { AsciiField } from "@/components/motion/ascii-field";
import { FEATURES } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const INDENTS = ["lg:ml-0", "lg:ml-[20%]", "lg:ml-[40%]"] as const;

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-24 py-24 lg:py-0">
      {/* Pinned black panel with the live ASCII field behind the content. */}
      <div className="absolute inset-0 -z-1">
        <div className="size-full lg:sticky lg:top-0 lg:h-svh">
          <div className="relative size-full bg-black">
            <div className="absolute inset-0">
              <AsciiField />
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none grid grid-cols-1 gap-16 px-6 py-16 lg:grid-cols-12 lg:px-16 lg:py-[22svh]">
        <ul className="flex flex-col gap-16 text-ink-foreground lg:col-span-5 lg:gap-[18svh]">
          {FEATURES.map((f, i) => (
            <li
              key={f.n}
              className={cn(
                "pointer-events-auto flex flex-col gap-6 lg:max-w-1/2 lg:gap-12",
                INDENTS[i % 3],
              )}
            >
              <LineReveal
                as="p"
                className="mono-label text-ink-muted"
                text={`${f.n} / ${f.title.toUpperCase()}`}
              />
              <LineReveal
                as="p"
                className="text-[1.0625rem] leading-relaxed text-ink-foreground/80"
                text={f.body}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
