import { useState } from "react";
import { Reveal } from "@/components/motion/primitives";
import {
  FILE_TREE,
  README_LINES,
  README_LINES_ASTRO,
  TERMINAL_LINES,
} from "@/lib/site-data";
import { cn } from "@/lib/utils";

const TABS = ["Next.js", "Astro"] as const;
type Tab = (typeof TABS)[number];

function lineClass(line: string) {
  if (line.startsWith("#")) return "text-ink-foreground";
  if (line.startsWith("-")) return "text-ink-muted";
  return "text-signal/90";
}

export function Repo() {
  const [tab, setTab] = useState<Tab>("Next.js");
  const lines = tab === "Next.js" ? README_LINES : README_LINES_ASTRO;
  const tree = FILE_TREE[tab];

  return (
    <section
      id="the-repo"
      className="scroll-mt-24 bg-ink py-20 text-ink-foreground lg:h-svh lg:py-0"
    >
      <div className="mx-auto flex h-full max-w-[1400px] flex-col px-6 py-0 md:px-10 lg:py-[8svh]">
        <Reveal>
          <p className="mono-label text-ink-muted">The Repo</p>
          <h2 className="display-title mt-4 text-[clamp(1.9rem,3.4vw,3rem)]">
            This is the actual repo.
          </h2>
        </Reveal>

        <div className="mt-8 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-ink-border bg-black/30">
          {/* Tab bar */}
          <div className="flex items-stretch border-b border-ink-border">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                data-active={tab === t ? "true" : "false"}
                onClick={() => setTab(t)}
                className={cn(
                  "mono-label border-r border-ink-border px-5 py-3 transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                  tab === t
                    ? "bg-white/[0.06] text-ink-foreground"
                    : "text-ink-muted hover:bg-white/[0.04] hover:text-ink-foreground",
                )}
              >
                {t.toUpperCase()}
              </button>
            ))}
            <span className="mono-label ml-auto flex items-center px-5 text-ink-muted">
              README.md
            </span>
          </div>

          {/* Body: tree · readme · minimap */}
          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_1fr_72px]">
            <ul className="hidden min-h-0 overflow-auto border-r border-ink-border py-3 lg:block">
              {tree.map((file) => (
                <li key={file}>
                  <button
                    type="button"
                    className="mono-label w-full px-4 py-1.5 text-left text-ink-muted transition-colors duration-150 ease-out hover:bg-white/[0.04] hover:text-ink-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                  >
                    {file}
                  </button>
                </li>
              ))}
            </ul>

            <div className="min-h-0 overflow-auto px-4 py-4 font-mono text-[12.5px] leading-6">
              {lines.map((line, i) => (
                <div key={`${tab}-${i}`} className="flex gap-5">
                  <span className="w-6 shrink-0 text-right text-ink-muted/50 select-none">
                    {i + 1}
                  </span>
                  <span className={lineClass(line)}>{line || "\u00A0"}</span>
                </div>
              ))}
            </div>

            {/* Minimap with the 5s scan sweep */}
            <div className="relative hidden overflow-hidden border-l border-ink-border py-3 lg:block">
              <div className="flex flex-col gap-[3px] px-3">
                {lines.map((line, i) => (
                  <span
                    key={`m-${tab}-${i}`}
                    className="h-[3px] rounded-full bg-ink-foreground/25"
                    style={{ width: `${Math.min(100, Math.max(8, line.length * 1.8))}%` }}
                  />
                ))}
              </div>
              <span
                aria-hidden
                className="animate-minimap-scan pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-transparent via-accent/25 to-transparent motion-reduce:hidden"
              />
              <span
                aria-hidden
                className="animate-minimap-scan-counter pointer-events-none absolute inset-x-0 top-0 h-px bg-accent/60 motion-reduce:hidden"
              />
            </div>
          </div>

          {/* Terminal */}
          <div className="border-t border-ink-border px-4 py-3 font-mono text-[12px] leading-5">
            <p className="mono-label mb-2 text-ink-muted">Terminal</p>
            {TERMINAL_LINES.map((line) => (
              <div key={line} className="text-ink-muted">
                {line}
              </div>
            ))}
            <div className="flex items-center text-ink-foreground">
              <span>$&nbsp;</span>
              <span className="animate-cursor-blink inline-block h-[1em] w-[0.55em] bg-current motion-reduce:hidden" />
              <span className="hidden h-[1em] w-[0.55em] bg-current motion-reduce:inline-block" />
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between border-t border-ink-border px-4 py-2">
            <span className="mono-label text-ink-muted">Main · Updated today</span>
            <span className="mono-label text-ink-muted">99 Commits</span>
          </div>
        </div>
      </div>
    </section>
  );
}
