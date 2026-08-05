# Motion audit — contentarchitecture.dev vs. this build

Measured in a real Chrome via computed styles, `document.getAnimations()`,
`CSSKeyframesRule` extraction and DOM geometry reads at a 1111px viewport
(reference `scrollHeight` 14072px, this build 13547px).

## Tokens

| Token | Value |
| --- | --- |
| `--color-off-white` | `#f1eee7` |
| `--color-black` | `#232323` |
| `--color-black-deep` | `#000000` |
| `--color-ghost-grey` | `#dedede` |
| `--color-mid-grey` | `#cbcbcb` |
| `--color-dark-grey` | `#5b5a56` |
| `--color-accent` | `#ff9100` (all focus rings) |
| `--ease-out` | `cubic-bezier(0, 0, .2, 1)` |
| Duration whitelist | 100 / 150 / 200 / 300 / 500ms (+ 420ms line reveal) |

Keyframes bound in `@theme`:

```text
cursorBlink          0%,49.9%{opacity:1} 50%,100%{opacity:0}      .9s steps(1,end) infinite
heroScrollCue        0%{translateY(-8px)} 100%{translateY(48px)}   1.4s steps(7,end) infinite
statusPing           0%{op .5;scale(1)} 75%,100%{op 0;scale(2.6)}  1.8s cubic-bezier(0,0,.2,1) infinite
minimapScan          0%{op1;-101%} 30%{op1;0} 38%,100%{op0;0}      5s ease-in-out infinite
minimapScanCounter   0%{101%} 30%,100%{0}                          5s ease-in-out infinite
```

## Section table

| Section | Reference trigger | Reference initial state | Reference end state | Duration | Easing | Sticky/Pin | Current implementation | Gap | Fix |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Global scroll | page load | native document scroll | Lenis 1.3.25 wrapper (`h-dvh overflow-y-auto overflow-x-clip overscroll-none`), `html,body{overflow:hidden}` | n/a (rAF) | Lenis default | wrapper is the scroll root | `scroll-container.tsx` wraps the app, hook exposes the ref | none | disabled under `prefers-reduced-motion` (native scroll) |
| Nav | scroll + hover | `--odometer-progress:0`, no pill | pill `absolute inset-0 rounded-lg bg-white/8 ring-1 ring-white/15`, chars rolled `-50%` | 200–300ms, per-char delay `i*20ms` | `cubic-bezier(0,0,.2,1)` | `fixed inset-x-0 top-0 z-40`, `p-8 lg:p-16`, left-aligned < lg | per-character odometer + pill, scroll-spy reads Lenis container | none | `focus-visible:ring-accent` on every link |
| Hero | load + scroll | dark panel 50% width, copy at y0 | panel → 100% width, copy y −80px, opacity → 0 at 75% progress | 500ms entrances; loops `.9s` / `1.4s` | `cubic-bezier(0,0,.2,1)` | none | split grid (`md:grid-cols-2`) so the headline can never cross the panel edge; caret `animate-cursor-blink`; cue `animate-hero-scroll-cue`; clickable AsciiField reshuffles on click/Enter/Space | headline previously overflowed at ≥1440px | headline clamp `2.25rem→4rem` inside the left grid column |
| Common Problems | in-view once | y +16px, opacity 0 | y 0, opacity 1, staggered | 400ms, 60ms stagger | `cubic-bezier(0,0,.2,1)` | none | `Reveal` + `Scramble` counters | none | durations normalised to 400/500ms |
| Features | scroll through pinned section | 9 items below the fold | 9 items always expanded, staircase indents | 420ms line reveal, 60ms/line | `cubic-bezier(0,0,.2,1)` | `lg:sticky lg:top-0 lg:h-svh` black panel | single `lg:col-span-5` column, `lg:ml-0 / lg:ml-[20%] / lg:ml-[40%]` on `index % 3`; measured left edges 64 / 205 / 345 | was an accordion; then 3.87 viewport heights | `lg:py-[14svh]` + `lg:gap-[6svh]` → ≈2.3 viewport heights (reference 2545px / 1111px = 2.29) |
| Features ASCII background | always (paused offscreen) | static grid of glyphs | ~4% of cells replaced per frame at ~13fps | frame budget 1000/13 ms | linear (rAF) | inside the pinned panel | `AsciiField` canvas, dpr-aware, IntersectionObserver pause | build had zero canvases | one static frame under reduced motion |
| The Repo | tab click / hover / loop | tab inactive, minimap unscanned | active tab `bg-white/[0.06]`, scan sweeps top→bottom | tabs 200ms, tree rows 150ms, scan 5s loop | `ease-out`; scan `ease-in-out` | `lg:h-svh` (exactly one viewport) | file tree + README + minimap + terminal + `MAIN · UPDATED TODAY` / `99 COMMITS` status bar; NEXT.JS / ASTRO tabs swap tree and README | had only tabs + README | `animate-minimap-scan(-counter)`, `animate-cursor-blink` terminal caret |
| Showcase | hover / click / scroll | ASCII overlay `opacity 1` covering the card | overlay `opacity 0`, content `opacity 1` | 500ms | `ease-out` | `lg:h-[240svh]` sticky viewport with a translating grid (3.58 viewport heights in the reference: 3974px / 1111px) | `group-hover:opacity-0 group-data-[active=true]:opacity-0`; click toggles `data-active`; button element, Enter/Space native, `focus-visible:ring-accent` | interaction was missing entirely | `motion-reduce:hidden` on the canvas mask |
| Reviews | auto-loop, pause on hover | strip at x 0 | continuous horizontal drift | linear loop, `overflow-x-clip` | linear | none | `Marquee speed={46}` reviewer strip + slider | static before | `group-hover:[animation-play-state:paused]`, `motion-reduce:animate-none` |
| Pricing | hover / in-view | flat card, price scrambling | `hover:ring-2 hover:ring-accent`, `hover:bg-white/[0.06]` | 200ms card, 500ms price scramble | `ease-out` | none | `transition-[box-shadow,background-color]`, `animate-status-ping` dot on the available plan | scramble ran 900ms | capped at 500ms |
| FAQ | click | `grid-rows-[0fr]`, icon 0° | `grid-rows-[1fr]`, icon 45° | 300ms rows / 200ms icon | `ease-out` | none | CSS grid transition driven by `data-active` on the group | used Motion height auto | `focus-visible:ring-accent` on triggers, `motion-reduce:transition-none` |
| Footer | hover | no underline | `underline` + colour shift | 150ms | `ease-out` | none | link hover underline + accent focus ring | none | — |
| Buttons | hover | `bg-white/10` | `bg-white/20` → `bg-white/30` | 100–150ms | `ease-out` | none | `SplitButton` colour-only transition | previously translated ±4px over 500ms with `cubic-bezier(.16,1,.3,1)` | translation removed, `transition-colors duration-150 ease-out` |
| Reduced motion | `prefers-reduced-motion: reduce` | animated element | swapped static counterpart | 0 | none | none | Lenis off, line reveals render plain text, canvases draw one frame, loops `motion-reduce:hidden` with a `motion-reduce:block` static twin | — | — |

## Interaction inventory

| Interaction | Selector pattern | Timing |
| --- | --- | --- |
| Nav hover odometer | `a[--odometer-progress:0] motion-safe:hover:[--odometer-progress:1]` → inner `.flex-col` `translateY(calc(var(--odometer-progress) * -50%))` | 300ms ease-out, `i*20ms` delay per character |
| Nav active section | `span.pointer-events-none.absolute.inset-0.rounded-lg.bg-white/8.ring-1.ring-white/15` + `aria-current="true"` | instant (IntersectionObserver on the Lenis container) |
| Hero panel click | `div[role=button].relative.size-full.cursor-pointer.select-none.overflow-hidden` → `AsciiField seed` | immediate reshuffle |
| Showcase hover reveal | `.group:hover .pointer-events-none.absolute.inset-0 { opacity: 0 }` | 500ms ease-out |
| Showcase click lock | `.group[data-active=true] … group-data-[active=true]:opacity-0 / :opacity-100` | 500ms ease-out, toggles |
| Repo tab switch | `button[data-active]` → `bg-white/[0.06]` | 200ms ease-out |
| Repo file row hover | `hover:bg-white/[0.04]` | 150ms ease-out |
| Pricing card hover | `hover:ring-2 hover:ring-accent hover:bg-white/[0.06]` | 200ms ease-out |
| FAQ toggle | `li.group[data-active]` → `grid-rows-[0fr]→[1fr]`, `+` icon `rotate-45` | 300ms / 200ms ease-out |
| Footer link hover | `hover:underline` | 150ms ease-out |
| Focus ring (all) | `focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none` | instant |

## Responsive behaviour (single meaningful breakpoint: `lg` = 1024px)

- **Below lg**: no sticky pinning, no staircase indent, no `max-w-1/2`; every
  section is single-column full width; nav is left-aligned with `p-8`; the
  Repo IDE hides the file tree and minimap columns; Showcase drops the pinned
  travel and stacks the cards.
- **lg and above**: Features pins a black `h-svh` panel and staircases items at
  0 / 20% / 40%; Showcase pins for 240svh; Repo is exactly `h-svh` with the
  three-column IDE; nav is centred with `p-16`.
- Verified with no horizontal overflow at 1920×1080, 1440×900, 1280×800,
  768×1024, 390×844 and 375×812.
