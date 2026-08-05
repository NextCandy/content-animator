import { createFileRoute, Link } from "@tanstack/react-router";
import { MaskReveal, Reveal } from "@/components/motion/primitives";
import { BLOG_POSTS } from "@/lib/site-data";

const title = "Blog — The Content Architecture";
const description =
  "Articles on Next.js and Sanity architecture: caching and revalidation, serving content to AI agents, and the decisions worth committing once.";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <section className="px-6 pt-40 pb-28 md:px-10 md:pt-48">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <p className="mono-label text-muted-foreground">Blog</p>
        </Reveal>
        <MaskReveal
          as="h1"
          text="Notes from six years of client work."
          className="display-title mt-6 max-w-3xl text-[clamp(2.25rem,5.2vw,4.5rem)]"
        />

        <ul className="mt-20">
          {BLOG_POSTS.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.08}>
              <li className="border-t border-border last:border-b">
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group grid gap-6 py-10 md:grid-cols-12"
                >
                  <span className="mono-label text-muted-foreground md:col-span-3">
                    {post.date} · {post.readingTime}
                  </span>
                  <span className="md:col-span-9">
                    <span className="block text-2xl tracking-tight transition-transform duration-300 ease-[cubic-bezier(0,0,0.2,1)] group-hover:translate-x-2 md:text-4xl">
                      {post.title}
                    </span>
                    <span className="mt-4 block max-w-2xl leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </span>
                  </span>
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}