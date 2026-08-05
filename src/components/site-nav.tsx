import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useScrollContainer } from "@/components/motion/scroll-container";
import { NAV_LINKS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const MINI_MAP_SECTIONS = [
  { id: "features", label: "FEATURES" },
  { id: "the-repo", label: "THE REPO" },
  { id: "showcase", label: "SHOWCASE" },
  { id: "pricing", label: "PRICING" },
  { id: "faq", label: "FAQ" },
] as const;

/** Per-character odometer roll driven by --odometer-progress on the link. */
function Odometer({ label }: { label: string }) {
  const rollGlyphs = 6;
  return (
    <>
      <span className="sr-only">{label}</span>
      <span aria-hidden className="flex">
        {label.split("").map((char, i) => (
          <span
            key={`${char}-${i}`}
            className="relative inline-block overflow-hidden align-baseline"
          >
            <span className="invisible">{char === " " ? "\u00A0" : char}</span>
            <span
              className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-[520ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
              style={{
                transform: "translateY(calc(var(--odometer-progress) * -5em))",
                transitionDelay: `${i * 20}ms`,
              }}
            >
              {Array.from({ length: rollGlyphs }, (_, glyphIndex) => (
                <span key={`${char}-${glyphIndex}`}>{char === " " ? "\u00A0" : char}</span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </>
  );
}

const linkClass =
  "relative z-1 flex h-[30px] items-center whitespace-nowrap px-3 text-ink-muted transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:text-ink-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none [--odometer-progress:0] motion-safe:hover:[--odometer-progress:1]";

function SiteMinimap({ active }: { active: string | null }) {
  return (
    <aside
      aria-label="Mini-map"
      className="site-minimap pointer-events-auto relative hidden h-[54px] w-[96px] overflow-hidden border border-ink-border bg-ink p-1 shadow-[0_12px_35px_rgba(0,0,0,0.16)] md:block"
    >
      <div aria-hidden className="absolute inset-1 grid grid-rows-[18px_1fr] gap-px">
        <div className="relative overflow-hidden bg-black">
          <span className="absolute top-2 left-1 h-1 w-8 bg-ink-muted/80" />
          <span className="absolute top-2 right-1 h-1 w-4 bg-ink-muted/35" />
        </div>
        <div className="grid grid-cols-2 gap-px">
          <span className="bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.08)_0_2px,transparent_2px_5px)]" />
          <span className="bg-[linear-gradient(180deg,rgb(255_255_255/0.08),rgb(255_145_0/0.75))]" />
        </div>
      </div>
      <nav className="relative z-1 grid h-full grid-cols-5 gap-0.5" aria-label="Page sections">
        {MINI_MAP_SECTIONS.map((section, index) => (
          <Link
            key={section.id}
            to="/"
            hash={section.id}
            title={section.label}
            className="group relative flex items-end focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            <span className="sr-only">{section.label}</span>
            <span
              className={cn(
                "h-1 w-full bg-ink-muted/30 transition-colors duration-200",
                index === 0 && "bg-ink-muted/70",
                active === section.id && "bg-ink-foreground",
              )}
            />
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function LearnMoreDock() {
  const [open, setOpen] = useState(false);

  return (
    <div className="learn-more-dock pointer-events-auto fixed right-4 bottom-4 z-40 hidden w-24 md:block">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="group flex w-full flex-col text-center shadow-[0_12px_35px_rgba(0,0,0,0.18)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        <span className="mono-label flex h-6 w-full items-center justify-center bg-ink-foreground px-1 text-[9px] text-ink transition-colors duration-200 group-hover:bg-white">
          LEARN MORE
        </span>
        <span className="relative h-12 w-full bg-ink-foreground text-ink">
          <span
            aria-hidden
            className={cn(
              "absolute right-3 bottom-2 text-base leading-none transition-transform duration-300",
              open && "rotate-45",
            )}
          >
            +
          </span>
        </span>
      </button>
      <div
        className={cn(
          "absolute right-0 bottom-14 grid w-56 transition-[grid-template-rows,opacity] duration-300",
          open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="border border-ink-border bg-ink p-3 text-ink-muted shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
            <p className="mono-label max-w-44 leading-relaxed">
              Read the decisions, then ship inside them.
            </p>
            <Link
              to="/"
              hash="faq"
              className="mono-label mt-3 inline-block text-ink-foreground underline underline-offset-4"
            >
              Read FAQ ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SiteNav() {
  const [active, setActive] = useState<string | null>(null);
  const containerRef = useScrollContainer();

  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.hash);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      {
        root: containerRef?.current ?? null,
        rootMargin: "-40% 0px -50% 0px",
        threshold: [0, 0.25, 0.5],
      },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [containerRef]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-start p-4 lg:justify-center lg:p-4">
      <div
        className="site-nav-shell pointer-events-auto max-w-[calc(100vw-2rem)] rounded-lg bg-black p-2 shadow-lg ring-1 ring-black"
        style={{
          backgroundImage:
            "repeating-conic-gradient(rgb(255 255 255 / 0.22) 0% 25%, transparent 0% 50%)",
          backgroundSize: "4px 4px",
        }}
      >
        <nav className="relative flex max-w-full items-center overflow-x-auto rounded bg-ink p-1 ring-1 ring-white/10 backdrop-blur-md">
          <Link
            to="/"
            className="site-mark mr-1 grid size-[30px] place-items-center rounded text-[9px] font-bold text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            aria-label="The Content Architecture home"
          >
            <span className="sr-only">CA</span>
          </Link>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.hash}
              to="/"
              hash={link.hash}
              aria-current={active === link.hash ? "true" : undefined}
              className={cn("mono-label", linkClass, active === link.hash && "text-ink-foreground")}
            >
              {active === link.hash && (
                <span className="pointer-events-none absolute inset-0 rounded-lg bg-white/8 ring-1 ring-white/15" />
              )}
              <Odometer label={link.label} />
            </Link>
          ))}
          <Link
            to="/blog"
            className={cn("mono-label", linkClass)}
            activeProps={{ className: "text-ink-foreground" }}
          >
            <Odometer label="Blog" />
          </Link>
        </nav>
      </div>
      <div className="absolute top-4 right-4">
        <SiteMinimap active={active} />
      </div>
      <LearnMoreDock />
    </header>
  );
}
