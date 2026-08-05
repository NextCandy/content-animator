import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MaskReveal, Reveal } from "@/components/motion/primitives";
import { BLOG_POSTS } from "@/lib/site-data";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }],
      };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} — The Content Architecture` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: BlogPost,
});

function BlogPost() {
  const { post } = Route.useLoaderData();

  return (
    <article className="px-6 pt-40 pb-28 md:px-10 md:pt-48">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <Link to="/blog" className="mono-label text-muted-foreground hover:text-foreground">
            ← Back to blog
          </Link>
        </Reveal>
        <MaskReveal
          as="h1"
          text={post.title}
          className="display-title mt-8 max-w-4xl text-[clamp(2rem,4.6vw,3.75rem)]"
        />
        <Reveal delay={0.1}>
          <p className="mono-label mt-8 text-muted-foreground">
            {post.date} · {post.readingTime}
          </p>
        </Reveal>

        <div className="mt-16 max-w-2xl space-y-7 border-t border-border pt-14">
          {post.body.map((para: string, i: number) => (
            <Reveal key={i} delay={Math.min(i * 0.05, 0.3)}>
              <p className="text-[1.0625rem] leading-relaxed text-muted-foreground">
                {para}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </article>
  );
}