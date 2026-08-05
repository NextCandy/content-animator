import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useScrollContainer } from "@/components/motion/scroll-container";
import { NAV_LINKS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

/** Per-character odometer roll driven by --odometer-progress on the link. */
function Odometer({ label }: { label: string }) {
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
              className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0,0,0.2,1)]"
              style={{
                transform: "translateY(calc(var(--odometer-progress) * -50%))",
                transitionDelay: `${i * 20}ms`,
              }}
            >
              <span>{char === " " ? "\u00A0" : char}</span>
              <span>{char === " " ? "\u00A0" : char}</span>
            </span>
          </span>
        ))}
      </span>
    </>
  );
}

const linkClass =
  "relative z-1 flex h-10 items-center whitespace-nowrap px-3 transition-colors duration-200 ease-[cubic-bezier(0,0,0.2,1)] text-ink-muted hover:text-ink-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none [--odometer-progress:0] motion-safe:hover:[--odometer-progress:1]";

export function SiteNav() {
  const [active, setActive] = useState<string | null>(null);
  const reduce = useReducedMotion();
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
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-start p-8 lg:justify-center lg:p-16"
    >
      <nav className="pointer-events-auto flex max-w-[calc(100vw-4rem)] items-center gap-1 overflow-x-auto rounded-[10px] border border-ink-border bg-ink/95 px-2 py-1.5 backdrop-blur-md">
        <Link
          to="/"
          className="mr-1 grid size-7 place-items-center rounded-[6px] bg-ink-foreground/90 text-[9px] font-bold text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          aria-label="The Content Architecture home"
        >
          CA
        </Link>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.hash}
            to="/"
            hash={link.hash}
            aria-current={active === link.hash ? "true" : undefined}
            className={cn(
              "mono-label",
              linkClass,
              active === link.hash && "text-ink-foreground",
            )}
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
    </header>
  );
}
