import { Link } from "@tanstack/react-router";
import { Marquee, Reveal } from "@/components/motion/primitives";
import { TICKER_ITEMS } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <Marquee speed={38} className="border-y border-ink-border py-3">
        {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, i) => (
          <span key={i} className="mono-label px-6 text-ink-muted">
            {item}
          </span>
        ))}
      </Marquee>

      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-20 md:grid-cols-3 md:px-10">
        <Reveal>
          <p className="mono-label text-ink-muted">The Content Architecture</p>
          <p className="display-title mt-6 max-w-sm text-3xl">
            The Sanity setup agents don't reinvent.
          </p>
          <a
            href="mailto:hello@edoardolunardi.dev"
            className="mono-label mt-8 inline-block border-b border-ink-border pb-1 transition-colors duration-150 ease-out hover:border-ink-foreground hover:underline focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            hello@edoardolunardi.dev
          </a>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mono-label text-ink-muted">Site</p>
          <ul className="mt-6 space-y-3">
            {[
              { label: "Features", hash: "features" },
              { label: "Showcase", hash: "showcase" },
              { label: "Pricing", hash: "pricing" },
              { label: "FAQ", hash: "faq" },
            ].map((l) => (
              <li key={l.hash}>
                <Link
                  to="/"
                  hash={l.hash}
                  className="mono-label text-ink-muted transition-colors duration-150 ease-out hover:text-ink-foreground hover:underline focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/blog"
                className="mono-label text-ink-muted transition-colors duration-150 ease-out hover:text-ink-foreground hover:underline focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                to="/roadmap"
                className="mono-label text-ink-muted transition-colors duration-150 ease-out hover:text-ink-foreground hover:underline focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                Roadmap
              </Link>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mono-label text-ink-muted">Legal</p>
          <ul className="mt-6 space-y-3">
            <li>
              <Link
                to="/privacy-policy"
                className="mono-label text-ink-muted transition-colors duration-150 ease-out hover:text-ink-foreground hover:underline focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms-of-service"
                className="mono-label text-ink-muted transition-colors duration-150 ease-out hover:text-ink-foreground hover:underline focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <a
                href="https://www.edoardolunardi.dev"
                target="_blank"
                rel="noreferrer"
                className="mono-label text-ink-muted transition-colors duration-150 ease-out hover:text-ink-foreground hover:underline focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
              >
                Edoardo Lunardi
              </a>
            </li>
          </ul>
        </Reveal>
      </div>

      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 border-t border-ink-border px-6 py-6 md:px-10">
        <span className="mono-label text-ink-muted">
          © {new Date().getFullYear()} The Content Architecture
        </span>
        <span className="mono-label text-ink-muted">Built for agentic development.</span>
      </div>
    </footer>
  );
}