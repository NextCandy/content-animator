import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { NAV_LINKS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.hash);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      initial={{ y: reduce ? 0 : -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 py-3"
    >
      <nav
        className={cn(
          "pointer-events-auto flex items-center gap-1 rounded-[10px] border border-ink-border bg-ink/95 px-2 py-1.5 backdrop-blur-md transition-all duration-500",
          scrolled ? "scale-[0.97] shadow-lg" : "scale-100",
        )}
      >
        <Link
          to="/"
          className="mr-1 grid size-7 place-items-center rounded-[6px] bg-ink-foreground/90 text-[9px] font-bold text-ink"
          aria-label="The Content Architecture home"
        >
          CA
        </Link>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.hash}
            to="/"
            hash={link.hash}
            className={cn(
              "mono-label relative rounded-[6px] px-3 py-2 text-ink-muted transition-colors hover:text-ink-foreground",
              active === link.hash && "text-ink-foreground",
            )}
          >
            {link.label}
            {active === link.hash && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-x-2 -bottom-0.5 h-px bg-ink-foreground"
              />
            )}
          </Link>
        ))}
        <Link
          to="/blog"
          className="mono-label rounded-[6px] px-3 py-2 text-ink-muted transition-colors hover:text-ink-foreground"
          activeProps={{ className: "text-ink-foreground" }}
        >
          Blog
        </Link>
      </nav>
    </motion.header>
  );
}