import { useState } from "react";
import { FILE_TREE, README_LINES, README_LINES_ASTRO, TERMINAL_LINES } from "@/lib/site-data";
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
  const [showTerminal, setShowTerminal] = useState(true);
  const lines = tab === "Next.js" ? README_LINES : README_LINES_ASTRO;
  const tree = FILE_TREE[tab];

  return (
    <section
      id="the-repo"
      className="bg-background px-6 py-20 text-foreground md:px-10 lg:h-svh lg:p-20"
    >
      <div className="mx-auto flex h-full max-w-[1400px] flex-col">
        <div
          className="h-full rounded-lg bg-black p-2 shadow-lg ring-1 ring-black"
          style={{
            backgroundImage:
              "repeating-conic-gradient(rgb(255 255 255 / 0.22) 0% 25%, transparent 0% 50%)",
            backgroundSize: "4px 4px",
          }}
        >
          <div className="relative isolate flex h-full flex-col overflow-hidden rounded bg-ink text-white ring-1 ring-white/10">
            <div className="relative flex h-[34px] shrink-0 items-center justify-center border-b border-white/10 px-4">
              <div className="absolute top-1/2 left-2 flex -translate-y-1/2 items-center gap-1 rounded bg-white/5 p-1">
                {TABS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    data-active={tab === t ? "true" : "false"}
                    onClick={() => setTab(t)}
                    aria-pressed={tab === t}
                    className={cn(
                      "relative cursor-pointer rounded px-3 py-1 font-mono text-caption-10 uppercase transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                      tab === t ? "bg-white/10 text-white" : "text-white/40 hover:text-white",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <span className="max-w-1/3 truncate font-mono text-caption-10 text-white/40 uppercase">
                This is the actual repo.
              </span>
              <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
                <button
                  type="button"
                  aria-label={showTerminal ? "Hide terminal" : "Show terminal"}
                  aria-pressed={showTerminal}
                  onClick={() => setShowTerminal((value) => !value)}
                  className={cn(
                    "cursor-pointer rounded px-2 py-1 font-mono text-caption-10 text-white/40 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                    showTerminal && "bg-white/10 text-white/80",
                  )}
                >
                  ▣ <span className="hidden sm:inline">⌘ J</span>
                </button>
                <button
                  type="button"
                  aria-label="Search files"
                  className="cursor-pointer rounded px-2 py-1 font-mono text-caption-10 text-white/40 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                >
                  ⌕ <span className="hidden sm:inline">⌘ K</span>
                </button>
              </div>
            </div>

            <div className="relative flex min-h-0 flex-1">
              <aside className="hidden w-[240px] shrink-0 flex-col border-r border-white/10 lg:flex">
                <nav aria-label="File explorer" className="min-h-0 flex-1 overflow-auto py-3">
                  <ul className="min-w-full">
                    {tree.map((file) => {
                      const folder = !file.includes(".");
                      return (
                        <li key={file}>
                          <button
                            type="button"
                            className="flex w-full cursor-pointer items-center gap-1.5 whitespace-nowrap py-[3px] pr-3 pl-3 text-left font-mono text-caption-10 uppercase text-white/55 transition-colors duration-100 ease-out hover:bg-white/[0.04] hover:text-white/90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                          >
                            <span aria-hidden className="w-[0.85em] shrink-0 text-white/40">
                              {folder ? "›" : "·"}
                            </span>
                            <span className="truncate">{file.replace(/\/$/, "")}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </aside>

              <div className="min-w-0 flex-1">
                <div className="flex min-h-0 h-full flex-col">
                  <div className="flex h-[36px] shrink-0 items-center border-b border-white/10 px-4 font-mono text-caption-10 text-white/40 uppercase">
                    README.md
                  </div>

                  <div className="flex min-h-0 flex-1">
                    <div className="min-w-0 flex-1 overflow-auto px-4 py-4 font-mono text-[12.5px] leading-6">
                      {lines.map((line, i) => (
                        <div key={`${tab}-${i}`} className="flex gap-5 whitespace-pre">
                          <span className="w-6 shrink-0 text-right text-white/25 select-none">
                            {i + 1}
                          </span>
                          <span className={lineClass(line)}>{line || "\u00A0"}</span>
                        </div>
                      ))}
                    </div>

                    <div className="relative hidden w-[72px] shrink-0 overflow-hidden border-l border-white/10 py-3 lg:block">
                      <div className="flex flex-col gap-[3px] px-3">
                        {lines.map((line, i) => (
                          <span
                            key={`m-${tab}-${i}`}
                            className="h-[3px] rounded-full bg-white/25"
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

                  {showTerminal && (
                    <div className="h-[202px] shrink-0 border-t border-white/10 px-4 py-4 font-mono text-caption-10 leading-5">
                      <p className="mb-3 text-white/40 uppercase">Terminal</p>
                      {TERMINAL_LINES.map((line) => (
                        <div key={line} className="whitespace-nowrap text-white/55">
                          {line}
                        </div>
                      ))}
                      <div className="flex items-center text-white/80">
                        <span>~/the-content-architecture-next-js &gt;&nbsp;</span>
                        <span className="animate-cursor-blink inline-block h-[1em] w-[0.55em] bg-current motion-reduce:hidden" />
                        <span className="hidden h-[1em] w-[0.55em] bg-current motion-reduce:inline-block" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex h-[28px] shrink-0 items-center justify-between border-t border-white/10 px-4">
              <span className="font-mono text-caption-10 text-white/40 uppercase">
                Main · Updated today
              </span>
              <span className="font-mono text-caption-10 text-white/40 uppercase">99 Commits</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
