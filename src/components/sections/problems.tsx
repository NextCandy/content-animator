import { useEffect, useState } from "react";
import { MaskReveal, Reveal } from "@/components/motion/primitives";
import { PROBLEMS } from "@/lib/site-data";

function ProblemTerminal() {
  const [visibleLines, setVisibleLines] = useState(1);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisibleLines((count) => (count >= PROBLEMS.length ? count : count + 1));
    }, 180);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[332.445px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-lg border border-dashed border-current/30 opacity-0"
      />
      <div
        className="h-full rounded-lg bg-black p-2 shadow-lg ring-1 ring-black"
        style={{
          backgroundImage:
            "repeating-conic-gradient(rgb(255 255 255 / 0.22) 0% 25%, transparent 0% 50%)",
          backgroundSize: "4px 4px",
        }}
      >
        <div className="isolate flex h-full flex-col overflow-hidden rounded bg-ink font-mono text-caption-10 text-white ring-1 ring-white/10">
          <div className="flex h-[26px] shrink-0 items-center border-b border-white/10 px-4">
            <span className="text-white/40 uppercase">Common problems</span>
          </div>
          <div className="min-h-0 overflow-hidden p-4">
            <ul className="flex min-w-max flex-col gap-y-2 whitespace-pre text-caption-10">
              {PROBLEMS.map((problem, index) => (
                <li
                  key={problem.n}
                  className="flex items-baseline justify-between gap-4 transition-[opacity,transform] duration-300 ease-out"
                  style={{
                    opacity: index < visibleLines ? 1 : 0,
                    transform: index < visibleLines ? "translateY(0)" : "translateY(6px)",
                  }}
                >
                  <span className="flex items-baseline gap-6">
                    <span className="text-ink-muted tabular-nums">{problem.n}</span>
                    <span>{problem.text}</span>
                  </span>
                  <span className="text-ink-muted">{problem.hrs}</span>
                </li>
              ))}
              <li className="flex items-baseline justify-between gap-4 whitespace-pre text-ink-muted">
                ESTIMATED TIME LOST: ~24 HOURS PER PROJECT
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Problems() {
  return (
    <section className="bg-background py-40 text-foreground">
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 px-6 md:px-10 lg:grid-cols-12 lg:px-0">
        <div className="order-2 lg:order-1 lg:col-span-5 lg:pl-[100px]">
          <Reveal>
            <ProblemTerminal />
          </Reveal>
        </div>

        <div className="order-1 flex flex-col gap-8 lg:order-2 lg:col-span-6 lg:col-start-7 lg:pr-20">
          <MaskReveal
            as="h2"
            text="The page builder alone costs you days. Every single time."
            className="display-title text-headline-10"
          />
          <div className="text-body-20 space-y-[1em] text-muted-foreground">
            <Reveal delay={0.1}>
              <p>
                It&apos;s never the easy stuff that hurts. It&apos;s the page builder, modeled from
                scratch again. Draft mode and live preview, wired up and subtly broken again. The
                cache bug where published content goes stale and the client swears you shipped
                something wrong. A Studio structure your editors actually understand, instead of one
                they email you about.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p>
                This is the part nobody quotes for and everybody rebuilds. Days gone before the real
                work starts.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
