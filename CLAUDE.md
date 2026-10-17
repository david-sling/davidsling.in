# davidsling.in

David Sling's personal portfolio and blog, rebuilt from scratch. It shows David as an engineer who ships real products with AI agents.

The app is not scaffolded yet. Until it is, this repo holds planning, design context and assets only.

## Ground rules

- **Use impeccable for all UI work.** Use the `impeccable` skill (`.claude/skills/impeccable`) for every design or frontend task: shaping, building, critique, polish and motion. Follow its workflow. Load context with `scripts/impeccable context`, and read `craft-floor.md` before editing UI. Product context lives in `PRODUCT.md` and the visual system in `DESIGN.md`. Those two files override anything here about design.
- **Nothing from the old site's design.** Use the current davidsling.in only as a source of content and blog posts. Don't reuse its layout, colors, type or components.
- **Use the inspiration images for direction, not as templates.** They live in `inspiration/`. Check every idea taken from them against impeccable's refuse list. These are banned even though some images use them:
  - eyebrow or kicker labels above headings
  - numbered section labels (01 / 02)
  - gradient text
  - glass used as decoration
- **Assets:** photos of David are in `assets/`.

## Stack

- **Framework:** TanStack Start (React, file-based routing, server functions). Don't use Next.js-only APIs; replace them with TanStack equivalents.
- **Styling:** Tailwind CSS with design tokens in CSS variables. Use OKLCH for colors.
- **Components:** shadcn CLI.
  - Spell UI is set up as the `@spell` registry in `components.json`, so you can run `npx shadcn@latest add @spell/<name>`.
  - The shadcn MCP server is set up in `.mcp.json`.
- **Animation:** the `motion` library (`motion/react`), not `framer-motion`.

### When adding a Spell UI component

- **Reduced motion:** none of its components check `prefers-reduced-motion`. Add a reduced path to each one: fewer and gentler animations, not motion switched off entirely.
- **Missing dependencies:** some components don't declare all of theirs. Check the imports:
  - `special-text` needs `motion`.
  - `flow-button` and `pop-button` need `@radix-ui/react-slot`.
  - `tweet` needs `lucide-react`.
- **Next.js-only parts:** `animated-gradient` uses `next-themes`, and `spotify-card` needs an `/api/spotify` route. Replace both before use.
- **Screen readers:** split-text and scramble effects (`special-text`, `text-marquee`, etc.) need an `aria-label` or sr-only copy of the full text.

## Interaction and motion

- Every clickable element gets a deliberate microinteraction: hover, press, focus-visible and, where it applies, loading, disabled or success.
- Keep feedback to 100–150 ms and state changes to 150–300 ms. Make exits faster than entrances.
- Use ease-out curves such as `cubic-bezier(0.16, 1, 0.3, 1)`. No bounce or elastic easing.
- Animate only `transform`, `opacity` and `filter`.
- Content must be visible at rest. Never hide content until an animation runs.
- Use one authored focal moment per page, not the same reveal on every section.
- Keyboard focus rings must be visible and styled. Keep hit targets at least 44px.

## Content

- **Featured projects** (each gets a detailed project page):
  - **Wave:** `github.com/david-sling/wave`, live at wave.davidsling.in.
  - **Equanim:** `github.com/david-sling/equanim`.
  - **Offlyn:** offlyn.love, a web app plus an Expo mobile app.
    - The `offlyn.love` and `offlyn-app` repos are **private**. Never link to their source.
    - Never quote their code or config.
    - Product images from those repos are approved for use.
- **Blog:** migrate the MDX posts from `david-sling/portfolio-2`, keeping their original dates and slugs.
- **No resume impact numbers** (20% / 30% / 40%) anywhere on the site.
- **Deploy:** Vercel.
- **Contact and socials:** email, GitHub, LinkedIn and Instagram. Don't put a phone number on the site's pages. The exception is `public/resume.pdf` (served at `/resume`): David approved keeping his number in it.

## Security

- Never commit secrets, `.env` files, API keys or service config files (e.g. `google-services.json`).
- Any server function that calls a third-party API keeps its keys on the server.

## Git

- Keep the Claude `Co-Authored-By` trailer on commits in this project. AI-built is part of the story this site tells.
- Use conventional, imperative commit subjects.
