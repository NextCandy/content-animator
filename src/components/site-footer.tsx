import { Link } from "@tanstack/react-router";
import { GlyphField } from "@/components/motion/glyph-field";

const FOOTER_ASCII = String.raw` /$$$$$$$$ /$$                                                       /$$            /$$$$$$              /$$
|__  $$__/| $$                                                      | $$           /$$__  $$            | $$
   | $$   | $$$$$$$   /$$$$$$        /$$$$$$$   /$$$$$$  /$$   /$$ /$$$$$$        |__/  \ $$        /$$$$$$$  /$$$$$$  /$$   /$$  /$$$$$$$
   | $$   | $$__  $$ /$$__  $$      | $$__  $$ /$$__  $$|  $$ /$$/|_  $$_/           /$$$$$/       /$$__  $$ |____  $$| $$  | $$ /$$_____/
   | $$   | $$  \ $$| $$$$$$$$      | $$  \ $$| $$$$$$$$ \  $$$$/   | $$            |___  $$      | $$  | $$  /$$$$$$$| $$  | $$|  $$$$$$
   | $$   | $$  | $$| $$_____/      | $$  | $$| $$_____/  >$$  $$   | $$ /$$       /$$  \ $$      | $$  | $$ /$$__  $$| $$  | $$ \____  $$
   | $$   | $$  | $$|  $$$$$$$      | $$  | $$|  $$$$$$$ /$$/\  $$  |  $$$$/      |  $$$$$$/      |  $$$$$$$|  $$$$$$$|  $$$$$$$ /$$$$$$$/
   |__/   |__/  |__/ \_______/      |__/  |__/ \_______/|__/  \__/   \___/         \______/        \_______/ \_______/ \____  $$|_______/
                                                                                                                       /$$  | $$
                                                                                                                      |  $$$$$$/
                                                                                                                       \______/


  /$$$$$$   /$$$$$$   /$$$$$$        /$$   /$$  /$$$$$$  /$$   /$$  /$$$$$$   /$$$$$$$
 |____  $$ /$$__  $$ /$$__  $$      | $$  | $$ /$$__  $$| $$  | $$ /$$__  $$ /$$_____/
  /$$$$$$$| $$  \__/| $$$$$$$$      | $$  | $$| $$  \ $$| $$  | $$| $$  \__/|  $$$$$$
 /$$__  $$| $$      | $$_____/      | $$  | $$| $$  | $$| $$  | $$| $$       \____  $$
|  $$$$$$$| $$      |  $$$$$$$      |  $$$$$$$|  $$$$$$/|  $$$$$$/| $$       /$$$$$$$//$$
 \_______/|__/       \_______/       \____  $$ \______/  \______/ |__/      |_______/|__/
                                     /$$  | $$
                                    |  $$$$$$/
                                     \______/                                                                                             `;

const FOOTER_PHRASE =
  "THE CONTENT ARCHITECTURE · THE NEXT 3 DAYS ARE YOURS · BUILT FOR AGENTIC DEVELOPMENT · ";

export function SiteFooter() {
  return (
    <>
      <section className="relative z-10 bg-background px-6 py-28 text-foreground md:px-10 md:py-40 lg:p-20">
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-lg border border-dashed border-current/30 opacity-0"
          />
          <div
            className="rounded-lg bg-black p-2 shadow-lg ring-1 ring-black"
            style={{
              backgroundImage:
                "repeating-conic-gradient(rgb(255 255 255 / 0.22) 0% 25%, transparent 0% 50%)",
              backgroundSize: "4px 4px",
            }}
          >
            <div className="isolate flex flex-col overflow-hidden rounded bg-ink font-mono text-caption-10 text-white ring-1 ring-white/10">
              <div className="flex h-[26px] shrink-0 items-center border-b border-white/10 px-4">
                <span className="text-white/40 uppercase">The content architecture</span>
              </div>
              <div className="@container overflow-hidden p-4">
                <pre
                  role="img"
                  aria-label="The next 3 days\nare yours."
                  className="m-0 w-full overflow-hidden whitespace-pre leading-none"
                  style={{ fontSize: "calc(100cqw / 82.80)" }}
                >
                  {FOOTER_ASCII}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-0 h-[414.57px] overflow-hidden bg-ink px-6 py-20 text-white md:px-10 lg:p-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-1 opacity-80">
          <GlyphField
            model={false}
            phrase={FOOTER_PHRASE}
            color="rgba(222, 222, 222, 0.9)"
            backgroundColor="#232323"
          />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between gap-16 lg:gap-20">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start lg:gap-16">
            <form
              onSubmit={(event) => event.preventDefault()}
              className="flex w-full max-w-md flex-col gap-3"
            >
              <label htmlFor="footer-email" className="sr-only">
                Email
              </label>
              <div className="flex gap-1">
                <input
                  id="footer-email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="h-12 min-w-0 flex-1 rounded-lg border border-white/20 bg-transparent px-4 font-mono text-body-10 text-white outline-none placeholder:text-white/60 focus-visible:border-white/60"
                />
                <button
                  type="submit"
                  className="h-12 shrink-0 rounded-lg bg-white px-6 font-mono text-body-10 uppercase text-black transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                  Stay updated
                </button>
              </div>
            </form>

            <nav aria-label="Footer" className="flex flex-col gap-3 lg:items-end">
              <Link
                to="/blog"
                className="font-mono text-caption-20 uppercase text-white/70 transition-colors hover:text-white focus-visible:outline-none"
              >
                Blog
              </Link>
              <Link
                to="/roadmap"
                className="font-mono text-caption-20 uppercase text-white/70 transition-colors hover:text-white focus-visible:outline-none"
              >
                Roadmap
              </Link>
            </nav>
          </div>

          <div className="flex flex-col justify-between gap-8 border-t border-white/15 pt-6 font-mono text-caption-10 uppercase lg:flex-row lg:items-end">
            <div className="text-white/70">
              <p>© {new Date().getFullYear()} The Content Architecture</p>
              <p className="mt-2">Built by EdoardoLunardi.dev</p>
            </div>
            <nav aria-label="Legal" className="flex flex-col gap-3 lg:items-end">
              <Link
                to="/privacy-policy"
                className="text-white/70 transition-colors hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="text-white/70 transition-colors hover:text-white"
              >
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}
