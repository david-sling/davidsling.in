---
version: 1
slug: "src-routes-work-slug-tsx"
primary_target: "src/routes/work.$slug.tsx"
related_targets: []
---

# Project case-study pages (/work/$slug)

Scope: one route rendering the case studies (Wave, Equanim, offlyn.love, AI Protect, Valet, cmd-facts). Mode: Experience inside the established landing-page world; DESIGN.md not yet written, the world lives in code (src/styles.css tokens, rounded sheets, General Sans, per-project colour fields).

Audience and job: developer peers arriving by deep link from GitHub, LinkedIn or a post. They want the story, the mechanism and the judgement calls, fast, and a way to try the thing.

Content truth: Wave story from David's LinkedIn post (Mac + Windows laptops, Claude Code on each, copy-pasting schemas between them). Wave/Equanim facts from their public repos. offlyn.love facts from David's public blog post and approved product images only; never its private source. Name is always "offlyn.love". cmd-facts facts from its public repo README and npm (`cmd-facts@0.2.0`, MIT, zero runtime dependencies); the library itself runs in the browser, so its demo is the real `explain()`, never a mock. Origin, from David (2026-11-10): he built it because Valet's approval prompt needed it, made it a library because the surface is broader than Valet, and plans the Valet integration next — Valet does NOT use it yet, so never claim it does.

## Direction contract

THESIS: one shared case-study frame, with exactly one signature element per project drawn from what the product does. Refuses the category default of a long image gallery with identical sections and a metrics hero.

OWN-WORLD: the landing page's world unchanged: ground/sheet tokens, 40px rounded sheets, General Sans, blue accent; each page owns its project colour field (wave yellow, equanim cyan, offlyn pink, ai-protect blue, valet sand, cmd-facts green) for the hero and its signature block only.

STORY: why it exists, how it works, the decisions that mattered, how it was built with agents, then a door to the next project.

FIRST VIEWPORT: project colour sheet, name large at left with one-line summary, role/date/stack facts and Live/Source buttons; product media at right (Wave video, live Equanim pendulum, offlyn.love match art, cmd-facts live explain panel). Stacked on mobile.

FORM: user-chosen structure (shared frame + option 1 signatures: Wave "joined" section dividers, Equanim spec-beside-render with hover highlighting, offlyn.love hidden-mutual-friend reveal; cmd-facts live `explain()` panel — the real npm package in the browser, command beside its sentence and fact fields, arguments highlighting their slot in the sentence on hover, plus a playground where the visitor types their own line; user chose live demo and a green field, 2026-11-10). seed: none (direction specified by the user; no roll)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
