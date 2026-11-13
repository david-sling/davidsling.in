---
version: 1
slug: "src-routes-ai-infrastructure-tsx"
primary_target: "src/routes/ai-infrastructure.tsx"
related_targets: ["src/components/infra/page.tsx"]
---

# AI infrastructure page (/ai-infrastructure)

Scope: one route presenting David as someone who builds infrastructure for AI, with Wave, Valet and cmd-facts as one connected ecosystem. Mode: Persuade, inside the established site world (DESIGN.md unchanged).

Audience and job: developer peers who work with agents all day. They should leave believing these three tools are one line of work, and open a tool or a case study. Action: open Wave or Valet, read a case study, or say hi. No pitch.

Content truth (from David, 2026-11-13, checked against the repos):
- Wave is agent-to-agent communication.
- Valet is for when the other side has no AI agent.
- cmd-facts exists because Valet's approval prompt needed it; Valet's app imports cmd-facts (0.5.0).
- Wave and Valet share one Redis today, each under its own key prefix. Planned, not built: a shared database, billing and auth, so one account opens every tool. Always label these as planned.
- More tooling for people who use AI heavily is coming; nothing specific is named, so name nothing.
- David's philosophy, quoted as written: "Use AI to build, use deterministic systems to guard. That's the safest way to build fast."
- These are projects or tools, never "products". cmd-facts is a library with no server; it does not sit on the shared Redis.

Constraints: the site's familiar structure and craft; no eyebrows, no numbered labels, no gradient text; every motion has a reduced-motion path; project fields appear only where that project is speaking.

Build path: code-led. The project default is comp-led, but this session had no image generation tool, so the round ran on HTML sketches and David's locked sketch (infra-switch.html) is the composition.

## Direction contract

THESIS: the page opens on one question, "Who's on the other side?", and the answer picks the tool. It refuses the category default of a headline over three equal tool cards.

OWN-WORLD: the site's world unchanged: soft ground, 40px sheets, General Sans, David's blue as a fill. The stage is a project colour field that changes with the answer (Wave yellow, Valet sand), with cmd-facts green only on its own panel and rows.

STORY: the visitor answers the question and sees the matching connection drawn; then reads how one need led to the next tool; sees the shared foundation, live and planned; reads the build/guard philosophy against real guards from each tool; and leaves through a tool or case-study link.

FIRST VIEWPORT: two columns under the header. Left, an intro sheet: the h1 "I build infrastructure for AI.", a lead line, then the question in title size over a two-option segmented control at the sheet's foot. Right, a field-coloured stage: tool name large, one-line summary, a three-part row (your agent, the link, the other side) with messages travelling the wire, and links to the live tool and case study. Stacked on mobile, question above the stage.

FORM: "The other side" (the visitor's answer picks the tool), position 4 on the ordered structure list, dealt as the lead and chosen by David. Signature interaction: switching the answer recolours the stage and redraws the connection; in Valet's answer the approval prompt carries a live cmd-facts explain() result. seed:4e18bb4cc6f152eb

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
