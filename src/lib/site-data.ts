export const NAV_LINKS = [
  { label: "Features", to: "/", hash: "features" },
  { label: "The Repo", to: "/", hash: "the-repo" },
  { label: "Showcase", to: "/", hash: "showcase" },
  { label: "Pricing", to: "/", hash: "pricing" },
  { label: "FAQ", to: "/", hash: "faq" },
] as const;

export const STRIPE_URL = "https://buy.stripe.com/28E9AVdxkfd0etg1mg0Ny00";

export const TICKER_ITEMS = [
  "NEXT 16.x",
  "SANITY v6",
  "TS: STRICT",
  "AGENTS.MD: LOADED",
  "MCP: 2 SERVERS",
  "DRIFT: 0",
];

export const PROBLEMS = [
  { n: "001", text: "Agent redesigns the architecture on every prompt", hrs: "∞ HRS" },
  { n: "002", text: "Page builder schema + section registration + preview", hrs: "~5 HRS" },
  { n: "003", text: "Draft mode + live preview + webhook revalidation", hrs: "~4 HRS" },
  { n: "004", text: "CDN vs. data cache — stale content after publish", hrs: "~3 HRS" },
  { n: "005", text: "Studio structure editors can actually use", hrs: "~3 HRS" },
  { n: "006", text: "SEO metadata, OG images, sitemaps, robots.txt", hrs: "~2 HRS" },
  { n: "007", text: "Rewriting the same 12 components", hrs: "~2 HRS" },
  { n: "008", text: "Redirects, analytics, view transitions, Mux", hrs: "~2 HRS" },
  { n: "009", text: "Contact form + spam guard + Resend wiring", hrs: "~1 HR" },
  { n: "010", text: "ESLint, Prettier, Biome, git hooks", hrs: "~1 HR" },
  { n: "011", text: "Basic auth for staging environments", hrs: "~1 HR" },
];

export const FEATURES = [
  {
    n: "001",
    title: "Agent-native",
    body: "AGENTS.md and a dozen scoped skills let Claude Code or Cursor ingest the conventions before the first prompt, instead of proposing a plausible new architecture per run. Two preconfigured MCP servers ship in the repo: one reads the Next.js runtime, compilation errors, routes, docs matching the installed version, the other drives a real Chrome for screenshots, traces, and screencasts. The agent builds inside the decisions and checks its own work.",
  },
  {
    n: "002",
    title: "Agent-ready in production",
    body: "The shipped site stays legible to agents that read it. An editable llms.txt, drafted from your content with Sanity Agent Actions, and a token-light Markdown version of every page, served on the same URL through content negotiation. Generated in Studio, served verbatim, and a feature you can put in your own proposal.",
  },
  {
    n: "003",
    title: "Schema as a system",
    body: "Document roles, factory functions, singletons. Every schema looks the same, so every editor knows where to go. You never model the structure from scratch again.",
  },
  {
    n: "004",
    title: "The hard fields, already built",
    body: "The three fields nobody gets right the first time. A link field that handles internal refs, external URLs, email, and params. A media field that normalizes image, Mux, Rive, and Lottie into one shape, each returning dimensions, so you forget layout shift. A page builder with guardrails. Reusable, typed, composed everywhere.",
  },
  {
    n: "005",
    title: "Fetch layer, solved",
    body: "CDN bypassed in production, Data Cache doing the work, webhooks invalidating on publish, draft mode wired in. Stale content after publish stops being a midnight problem.",
  },
  {
    n: "006",
    title: "A Studio editors actually use",
    body: "Every document type where editors expect it. Pages own their routes, singletons stay locked, no hunting. Clients stop emailing to ask where their homepage lives.",
  },
  {
    n: "007",
    title: "SEO, done not deferred",
    body: "Per-page metadata from schema, sitemap driven by Sanity, OpenGraph with auto-cropped images, robots.txt included. Nothing bolted on the week before launch.",
  },
  {
    n: "008",
    title: "Production-ready from day one",
    body: "Basic auth, spam-protected forms, redirects managed in Sanity, analytics, view transitions. The plumbing you reconfigure every project, already wired.",
  },
  {
    n: "009",
    title: "Wired up, not just cloned",
    body: "An interactive setup script provisions the Sanity project, mints the tokens, adds CORS, and registers the revalidation webhook, then writes your .env. Export and migration scripts back up production and move content between environments. The first run is handled, not documented.",
  },
];

export const README_LINES = [
  "# The Content Architecture (Next.js)",
  "",
  "A modern Next.js 16.3 starter with Sanity CMS integration.",
  "",
  "## Features",
  "",
  "- Next.js 16 with App Router and Server Components",
  "- Sanity CMS with in-app Studio",
  "- TypeScript 6, Tailwind CSS 4, and Biome",
  "- Reusable components, page builder sections, and rich text blocks",
  "- Draft mode with Sanity Live, SEO helpers, and ISR revalidation",
  "- HTTP Basic Auth (optional): proxy.ts gates the site or individual URLs",
  "- llms.txt for AI assistants, drafted with Sanity Agent Actions",
  "- Agent Markdown served on the same URL via content negotiation",
  "- Feature modules for redirects, analytics, view transitions, Mux",
  "- Scaffolding via Plop for repeatable section/block generation",
  "- Seed dataset of example content (pages, articles, media)",
  "",
  "## Getting Started",
  "",
  "```bash",
  "npm install",
  "npm run dev",
  "```",
];

export const SHOWCASE = [
  {
    name: "Good Fella",
    url: "https://good-fella.com/",
    image: "/showcase/good-fella.jpg",
  },
  {
    name: "House of Honey",
    url: "https://www.houseofhoney.com/",
    image: "/showcase/house-of-honey.jpg",
  },
  {
    name: "Aspen Search",
    url: "https://www.aspensearch.com/",
    image: "/showcase/aspen-search.jpg",
  },
  {
    name: "Anuc Home",
    url: "https://www.anuchome.com/",
    image: "/showcase/anuc-home.jpg",
  },
  {
    name: "Edoardo Lunardi",
    url: "https://www.edoardolunardi.dev/",
    image: "/showcase/edoardo-lunardi.jpg",
  },
  {
    name: "Serve Robotics",
    url: "https://www.serverobotics.com/",
    image: "/showcase/serve-robotics.jpg",
  },
  {
    name: "Muralia",
    url: "https://www.muralia.at/",
    image: "/showcase/muralia.jpg",
  },
  {
    name: "blink",
    url: "https://www.blink.trade/",
    image: "/showcase/blink.jpg",
  },
  {
    name: "WASL",
    url: "https://www.waslarchitects.com/",
    image: "/showcase/wasl.jpg",
  },
  {
    name: "Creative Lives in Progress",
    url: "https://creativelivesinprogress.com/",
    image: "/showcase/creative-lives.jpg",
  },
  {
    name: "This site :D",
    url: "https://www.contentarchitecture.dev/",
    image: "/showcase/this-site.png",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "We shipped the Good Fella site on an early version and it saved us tons of time. Six months in, we're still building pages and sections in an afternoon without fighting the setup.",
    name: "Julian Fella",
    role: "Co-Founder, Good Fella",
    avatar: "/avatars/julian.jpg",
  },
  {
    quote:
      "Edo and I ran a client project on this together. The plumbing was already handled, so the week we'd normally lose to setup went into the creative work the client actually remembers.",
    name: "Elliott Mangham",
    role: "Founder & Frontend Engineer",
    avatar: "/avatars/elliott.png",
  },
  {
    quote:
      "I opened the fetch layer and found the revalidation problem I'd burned two days on last project, already solved and committed. That one folder paid for the whole thing, and the rest is six years of decisions I'd have made the slow way.",
    name: "Malik Kotb",
    role: "Web Designer & Engineer",
    avatar: "/avatars/malik.jpg",
  },
];

export const PLANS = [
  {
    name: "Next.js",
    price: "€549",
    was: "€549",
    status: "available" as const,
    points: ["THE NEXT.JS 16 + SANITY V6 REPO", "FOR NEXT.JS + SANITY ENGINEERS, NOT NO-CODE"],
  },
  {
    name: "Astro",
    price: "Soon",
    status: "soon" as const,
    points: ["THE ASTRO 7 + SANITY V6 REPO", "FOR ASTRO + SANITY ENGINEERS, NOT NO-CODE"],
  },
  {
    name: "Next.js + Astro",
    price: "Soon",
    status: "soon" as const,
    points: ["BOTH REPOS, NEXT.JS AND ASTRO", "FOR NEXT.JS + ASTRO ENGINEERS, NOT NO-CODE"],
  },
];

export const INCLUDED = [
  "ONE-TIME FEE, NO SUBSCRIPTION",
  "PERPETUAL LICENSE, UNLIMITED PROJECTS",
  "COMMERCIAL USE, NO ATTRIBUTION",
  "LIFETIME UPDATES, INCLUDED",
  "AGENT-READY: SKILLS, MCP, LLMS.TXT",
  "PRIVATE GITHUB DISCUSSIONS",
  "DIRECT LINE TO THE MAINTAINER",
  "FULL SOURCE ON PURCHASE, SALES FINAL",
  "ALL PRICES IN EUR",
];

export const FAQS = [
  {
    q: "What stack is this built on?",
    a: [
      "Next.js 16 with the App Router and React Compiler, Sanity v6, TypeScript in strict mode, Tailwind 4, and Biome for lint and format. Deploys on Vercel out of the box, and runs on Cloudflare via OpenNext.",
    ],
  },
  {
    q: "Does it work with Claude Code and Cursor?",
    a: [
      "It is built for it. AGENTS.md plus a dozen scoped skills mean any agentic tool ingests the conventions and boundaries before you write a prompt. Ask an agent to build this from scratch and you get a different architecture every run. Here the decisions are already made, so the agent works inside them instead of inventing new ones. You still read and write the real code yourself; the agent works inside the architecture, it does not write the app for you.",
      "It also ships two preconfigured MCP servers. One reads the running Next.js dev server: compilation errors, routes, docs that match the installed version. The other drives a real Chrome: screenshots across viewports, performance traces, screencasts of transitions it can review frame by frame. The agent doesn't just know the conventions, it can look at the app it's changing.",
    ],
  },
  {
    q: "Is the shipped site agent-ready too?",
    a: [
      "Yes. Every site built on this ships with an editable llms.txt, drafted from your content with Sanity Agent Actions from the Site document, and a token-light Markdown version of every page and article, served on the same URL to any agent that sends Accept: text/markdown. You generate it per page in Studio, review it, and it is served verbatim. Your client's site is readable by assistants and agentic crawlers on day one, a line item you can put in your own proposal.",
    ],
  },
  {
    q: "Am I locked into this exact stack?",
    a: [
      "No. The opinion lives in the architecture, and the tools sit on top of it. Tailwind, Biome, Mux, Rive, Lottie, these are the defaults I reach for on most projects, wired in cleanly so they come out just as cleanly. Don't want Tailwind? Pull it. Prefer ESLint over Biome? Swap it. No Mux, Rive, or Lottie in this project? Drop them. What you are really buying is the patterns underneath, how content is modeled, fetched, and composed. The libraries are just what I ship with on 90% of my projects.",
      "The Sanity layer is decoupled by design too. Every import inside the sanity/ folder is relative or an external package, nothing reaches into the Next.js app, so you can lift the whole Studio, schema, and field primitives into another project. The content layer doesn't hold you hostage to the front end.",
    ],
  },
  {
    q: "Do I need to know Sanity?",
    a: [
      "Some, yes. This is a real codebase, not a no-code template. You should be comfortable in a Sanity schema file and a Next.js project. If you are, you will feel at home in minutes. If you have never opened a schema, the article series is the best place to start before deciding.",
    ],
  },
  {
    q: "Is this for me if I don't code?",
    a: [
      "No, and I'd rather tell you here than take your money. This is a real Next.js and Sanity codebase, not a no-code tool: no visual page builder, no drag-and-drop editor. You clone the repo and write real code on top of it. If you don't work in Next.js and Sanity, it isn't for you.",
    ],
  },
  {
    q: "Can I use this for client work?",
    a: [
      "Yes. Unlimited projects, commercial use, no attribution required. Use it on every client site you ship. The one thing you cannot do is resell the architecture itself as a competing product.",
    ],
  },
  {
    q: "How is this different from other boilerplates?",
    a: [
      "Most boilerplates give you a pile of features. This gives you decisions. Every hard call, document modeling, the fetch layer, revalidation, the link and media fields, was made once over six years and committed. It is opinionated on purpose, and it is the architecture I ship my own client work on, not a side project cleaned up for sale.",
    ],
  },
  {
    q: "Why not just use a free Sanity starter?",
    a: [
      "A free starter gets you a clean install and the easy parts. What it leaves you is the work that actually costs the days: a page builder with guardrails, the fetch layer and revalidation, the link and media fields, a Studio structure your editors don't email you about. Those decisions are still yours to make on every project. Here they're already made, over six years of real client work, and committed. You're not paying for code you could scaffold in an afternoon. You're paying to skip the part nobody quotes for.",
    ],
  },
  {
    q: "Will it break on Next.js updates?",
    a: [
      "This is my daily driver, so I keep it current. Next.js majors, Sanity migrations, breaking plugin changes, I handle them and push the update. Your license includes every update for as long as I maintain it, which is for as long as I am using it myself.",
    ],
  },
  {
    q: "What do I actually get, and for how long?",
    a: [
      "The full repo on day one, a perpetual license, and lifetime updates for as long as the architecture is maintained. One-time fee, no subscription, unlimited projects.",
    ],
  },
  {
    q: "Do you offer support?",
    a: [
      "Yes. The purchase includes access to private GitHub discussions and a direct line to the maintainer for questions about the architecture and shipped setup.",
    ],
  },
  {
    q: "What if I find a bug?",
    a: [
      "Open it in the private repository and include a reproduction. Bugs in the maintained architecture are fixed and shipped as updates.",
    ],
  },
  {
    q: "Can I get a refund?",
    a: [
      "Sales are final because the full source is delivered immediately. Read the stack, audience, and licensing details above before purchasing.",
    ],
  },
  {
    q: "What is this not?",
    a: [
      "It is not a no-code builder, a visual editor, a generic starter, or an agent that writes the whole site for you. It is a real, opinionated Next.js and Sanity codebase that gives you a strong place to start.",
    ],
  },
];

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  body: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "serve-content-to-ai-agents-llms-txt-markdown-sanity",
    title: "Serve content to AI agents: llms.txt and Markdown from Sanity",
    excerpt:
      "An editable llms.txt drafted from your own content, and a token-light Markdown version of every page served on the same URL through content negotiation.",
    date: "2026-02-11",
    readingTime: "9 MIN",
    body: [
      "Agents read your site differently than people do. They do not need your hero animation, your nav, or the six kilobytes of markup wrapped around a paragraph. They need the content, in the smallest legible form you can hand them, at the URL they already have.",
      "That is what llms.txt is for. One file, per llmstxt.org, that describes the site and points at the pages worth reading. The problem with most implementations is that they are generated once, by hand, and go stale the week after launch. Drafting it from your content with Sanity Agent Actions fixes that: the editor reviews a generated draft in Studio, edits it like any other field, and publishes.",
      "The second half is content negotiation. A page that serves HTML to a browser can serve Markdown to an agent that sends Accept: text/markdown, on the same URL, with no /md mirror to maintain. The Markdown is generated per page in Studio, reviewed, stored, and served verbatim — no runtime HTML-to-Markdown conversion, no surprises.",
      "The result is a site that is readable by assistants and agentic crawlers on day one, and a line item you can put in your own proposal.",
    ],
  },
  {
    slug: "stale-sanity-content-nextjs-caching-revalidation",
    title: "Stale Sanity content in Next.js: the caching and revalidation fix",
    excerpt:
      "CDN bypassed in production, Data Cache doing the work, webhooks invalidating on publish. Why published content goes stale, and how to stop it happening at midnight.",
    date: "2026-01-19",
    readingTime: "12 MIN",
    body: [
      "The bug always looks the same. The client publishes, refreshes, and sees the old copy. You refresh and see the new copy. Somebody starts a thread titled 'is the site broken?' and you spend an evening proving it is not.",
      "There are two caches in play, and they are not the same thing. Sanity's CDN caches the query response at the edge. Next.js's Data Cache caches the fetch result in your deployment. Layering both means you have two independent TTLs and no reliable way to invalidate either on publish.",
      "The fix is to pick one. Bypass the Sanity CDN in production, let the Next.js Data Cache do the caching with tags, and register a publish webhook that revalidates those tags the moment content changes. Draft mode reads live, uncached, with a view token.",
      "Once that is committed, stale content stops being a midnight problem. It is roughly four hours of work the first time you get it right, and about ten minutes of doubt every project after that — which is exactly the kind of decision worth making once.",
    ],
  },
];

export const ROADMAP = [
  {
    status: "Shipped",
    items: [
      "Next.js 16 + React Compiler upgrade",
      "Sanity v6 migration",
      "Agent Markdown via content negotiation",
      "Editable llms.txt with Sanity Agent Actions",
      "Two preconfigured MCP servers",
    ],
  },
  {
    status: "In progress",
    items: [
      "Astro 7 + Sanity v6 edition",
      "Bundle pricing for both editions",
      "Expanded skills library for agentic tools",
    ],
  },
  {
    status: "Planned",
    items: [
      "Visual regression harness driven by the Chrome MCP server",
      "Localization patterns for multi-market clients",
      "Commerce section primitives",
    ],
  },
];
export const README_LINES_ASTRO = [
  "# The Content Architecture (Astro)",
  "",
  "The same architecture, ported to Astro 7 and Sanity v6.",
  "",
  "## Features",
  "",
  "- Astro 5 with islands, view transitions, and server endpoints",
  "- Sanity CMS with in-app Studio",
  "- TypeScript 6, Tailwind CSS 4, and Biome",
  "- Reusable components, page builder sections, and rich text blocks",
  "- Draft mode with Sanity Live, SEO helpers, and on-demand revalidation",
  "- HTTP Basic Auth (optional): middleware gates the site or individual URLs",
  "- llms.txt for AI assistants, drafted with Sanity Agent Actions",
  "- Agent Markdown served on the same URL via content negotiation",
  "- Feature modules for redirects, analytics, and Mux",
  "- Seed dataset of example content (pages, articles, media)",
  "",
  "## Getting Started",
  "",
  "```bash",
  "npm install",
  "npm run dev",
  "```",
];

export const FILE_TREE = {
  "Next.js": [
    ".agents",
    ".husky",
    "app",
    "components",
    "docs",
    "features",
    "sanity",
    "scripts",
    "seed",
    "templates",
    ".env.example",
    ".gitignore",
    ".mcp.json",
    ".npmrc",
    ".nvmrc",
    "AGENTS.md",
    "assets.d.ts",
    "biome.jsonc",
    "README.md",
  ],
  Astro: [
    ".agents",
    ".husky",
    "src",
    "components",
    "docs",
    "features",
    "sanity",
    "scripts",
    "seed",
    "templates",
    ".env.example",
    ".gitignore",
    ".mcp.json",
    ".npmrc",
    ".nvmrc",
    "AGENTS.md",
    "assets.d.ts",
    "biome.jsonc",
    "README.md",
  ],
} as const;

export const TERMINAL_LINES = [
  "~/the-content-architecture-next-js > get-access   # €549 · one-time",
  "~/the-content-architecture-next-js > try: git, ls, tree, plop, cat README.md",
];

/**
 * Uppercase copy fragments painted into the AsciiField canvases.
 * Feature titles are derived from FEATURES so the field stays in sync.
 */
export const ASCII_PHRASES: string[] = [
  ...FEATURES.map((f) => f.title.toUpperCase()),
  "ONE MEDIA FIELD ONE SHAPE",
  "A PAGE BUILDER WITH GUARDRAILS",
  "FETCH LAYER SOLVED",
  "SCHEMA AS A SYSTEM",
  "WIRED UP NOT JUST CLONED",
  "SEO DONE NOT DEFERRED",
  "AGENT-NATIVE NO DRIFT",
  "THE HARD FIELDS ALREADY BUILT",
  "A STUDIO EDITORS ACTUALLY USE",
  "PRODUCTION-READY FROM DAY ONE",
  "EVERY DECISION ALREADY MADE",
  "WEBHOOKS INVALIDATE ON PUBLISH",
  "CDN BYPASSED IN PRODUCTION",
  "DRAFT MODE WIRED IN",
];
