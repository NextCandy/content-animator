import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/sections/hero";
import { Problems } from "@/components/sections/problems";
import { Features } from "@/components/sections/features";
import { Repo } from "@/components/sections/repo";
import { Showcase } from "@/components/sections/showcase";
import { Pricing } from "@/components/sections/pricing";
import { Faq } from "@/components/sections/faq";

const title = "The Content Architecture — The Sanity setup agents don't reinvent";
const description =
  "A Next.js 16 and Sanity v6 kit that commits six years of decisions, so your agent builds inside them instead of redesigning the architecture every run.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <Problems />
      <Features />
      <Repo />
      <Showcase />
      <Pricing />
      <Faq />
    </>
  );
}
