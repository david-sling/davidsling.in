---
name: davidsling.in
description: David Sling's personal site. A conventional portfolio carried by craft, motion and microinteractions.
colors:
  ground: "oklch(0.962 0.004 225)"
  sheet: "oklch(0.993 0.002 225)"
  sheet-sunk: "oklch(0.945 0.005 225)"
  line: "oklch(0.89 0.006 225)"
  ink: "oklch(0.21 0.014 245)"
  ink-2: "oklch(0.45 0.012 245)"
  ink-3: "oklch(0.58 0.01 245)"
  ink-fixed: "oklch(0.21 0.014 245)"
  blue: "oklch(0.81 0.105 214)"
  blue-strong: "oklch(0.74 0.12 216)"
  blue-wash: "oklch(0.94 0.035 214)"
  blue-text: "oklch(0.47 0.1 224)"
  wave: "#f8c840"
  wave-text: "oklch(0.43 0.085 80)"
  wave-deep: "oklch(0.22 0.04 85)"
  equanim: "#06b6d4"
  equanim-text: "oklch(0.48 0.09 215)"
  equanim-deep: "oklch(0.2 0.035 225)"
  offlyn: "#ff6b9f"
  offlyn-text: "oklch(0.5 0.17 2)"
  offlyn-deep: "oklch(0.24 0.06 0)"
  ai-protect: "#2563eb"
  ai-protect-text: "oklch(0.5 0.2 264)"
  ai-protect-deep: "oklch(0.985 0.008 260)"
  valet: "#efd09b"
  valet-text: "#7a5c2c"
  valet-deep: "oklch(0.3 0.05 65)"
  cmd-facts: "#4ec981"
  cmd-facts-text: "oklch(0.46 0.1 158)"
  cmd-facts-deep: "oklch(0.22 0.05 160)"
  cf-effect-read: "oklch(0.47 0.09 230)"
  cf-effect-write: "oklch(0.5 0.1 80)"
  cf-effect-delete: "oklch(0.52 0.18 28)"
  cf-effect-power: "oklch(0.47 0.15 300)"
typography:
  display:
    fontFamily: "General Sans, Kavivanar, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.8rem, 6.4vw, 5.25rem)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  hero-headline:
    fontFamily: "General Sans, Kavivanar, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, min(4.4vw, 8vh), 4.25rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "General Sans, Kavivanar, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  headline-case:
    fontFamily: "General Sans, Kavivanar, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 3.4vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "General Sans, Kavivanar, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "General Sans, Kavivanar, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.05rem, 1.6vw, 1.3rem)"
    fontWeight: 500
    lineHeight: 1.375
    letterSpacing: "-0.01em"
  body:
    fontFamily: "General Sans, Kavivanar, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "\"ss01\""
  body-case:
    fontFamily: "General Sans, Kavivanar, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "General Sans, Kavivanar, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 600
    lineHeight: 1.3
  mono:
    fontFamily: "ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "0.86em"
    fontWeight: 400
rounded:
  pill: "999px"
  sheet: "40px"
  block: "32px"
  tile: "28px"
  panel: "24px"
  inset: "20px"
  field: "16px"
  icon: "12px"
  code: "0.4em"
spacing:
  bento-gap: "12px"
  gutter-sm: "16px"
  gutter: "24px"
  tile-pad: "20px"
  sheet-pad-sm: "24px"
  sheet-pad: "48px"
  card-gap-y: "56px"
  section-case: "128px"
  section-home: "144px"
  container: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.ink-fixed}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 20px 0 24px"
  button-primary-hover:
    backgroundColor: "{colors.blue-strong}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 20px 0 24px"
  button-quiet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 20px 0 24px"
  button-quiet-hover:
    backgroundColor: "{colors.sheet-sunk}"
  button-flow:
    backgroundColor: "{colors.sheet-sunk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 24px"
  sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "48px"
  bento-tile:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "20px"
  tag-chip:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  nav-link:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 16px"
  nav-link-hover:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
  explain-panel:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "28px"
  command-line:
    backgroundColor: "{colors.sheet-sunk}"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.field}"
    padding: "12px 16px"
---

# Design System: davidsling.in

## Overview

**Creative North Star: "The Well-Made Ordinary"**

A familiar personal portfolio, built so that every surface answers the hand. The structure is the category standard (a sticky header, a hero, selected work, a role history, writing, a footer) and the quality lives in the execution: soft tinted ground, large rounded sheets floating on it, one blue that works as a fill, and per-project colour fields that let each piece of work wear its own identity. Nothing on the page is a concept costume; the craft is in squash-on-press buttons, pointer-following glows, arrows that slide, and tiles that lift.

Density is calm and generous at the section level (96 to 144px between sections) and compact inside tiles and panels. Neutrals are tinted toward the accent hue so ground, sheet and ink read as one family. Dark mode is its own palette with deeper sheets and softer ink, never an inversion.

The site has a confirmed visual rejection on record: concept-driven worlds (railway chart, cut-paper, contact sheet, ikebana) were declined in favour of "normal looking sites, but make it good and interactive". The previous davidsling.in design language does not carry over.

**Key Characteristics:**
- Rounded sheets (40px) and bento tiles (28px) on a cool soft-neutral ground.
- One accent, David's blue, used as a fill with ink on it.
- Each project owns a colour field for its hero, its signature block, its home card and its "next project" door.
- General Sans throughout, semibold headlines with tight negative tracking.
- Every clickable element gives tactile feedback; every motion has a reduced-motion path.

## Colors

A cool, low-chroma neutral family tinted to hue ~225, one bright cyan-blue accent, and a set of saturated project fields that appear only where a project is speaking.

### Primary
- **David's Blue** (`blue`): the site's single accent, always a fill: the primary pill button, the portrait disc, the logo badge, text selection, the "Say hi" tile wash. Ink sits on it; white never does.
- **Pressed Blue** (`blue-strong`): hover state of blue fills and the global focus outline.
- **Blue Wash** (`blue-wash`): a tinted sheet for the "How I build" block and blog blockquotes.
- **Blue Ink** (`blue-text`): the text-level accent. Hover colour on post titles, the dashed outline of the flow button, small labels inside blue-washed tiles.

### Secondary: project fields
Each project has a field colour, a `-text` shade for accent text on the site's own sheets, and a `-deep` shade for text sitting on the field.
- **Wave Yellow** (`wave`), **Equanim Cyan** (`equanim`), **Offlyn Pink** (`offlyn`), **AI Protect Blue** (`ai-protect`), **Valet Sand** (`valet`), **cmd-facts Green** (`cmd-facts`).
- AI Protect's field is dark, so its `-deep` is near-white. Every other field carries dark text.
- Field text muted tone is derived, not tokenised: `color-mix(in oklch, deep 72%, field)`.

### Tertiary: cmd-facts effect words
Scoped to the cmd-facts explain panel. Each colours an effect word by what it does to the machine.
- **Looks** (`cf-effect-read`): read.
- **Leaves Marks** (`cf-effect-write`): write, create, configure, install.
- **Takes Away** (`cf-effect-delete`): delete, terminate.
- **Hands Over Control** (`cf-effect-power`): transmit, execute, elevate.

### Neutral
- **Soft Ground** (`ground`): page background and the sticky header.
- **Sheet** (`sheet`): sections, tiles, panels, tag chips.
- **Sunk Sheet** (`sheet-sunk`): wells inside sheets: command lines, inline code, icon squares, the flow button at rest.
- **Hairline** (`line`): dividers, ruled decision rows, 1px inset rings on wells and chips.
- **Ink** (`ink`), **Ink 2** (`ink-2`), **Ink 3** (`ink-3`): headings, body copy, and meta labels or dates respectively.
- **Fixed Ink** (`ink-fixed`): ink on blue fills. Same value as light-mode ink, but it does not flip in dark mode, because blue does not flip.

### Named Rules
**The Fill-Not-Text Rule.** Blue is a surface, never a text colour. Text that needs the accent uses `blue-text`; text on blue uses fixed ink.

**The Field Owns Its Moments Rule.** A project colour appears only in that project's case hero, its signature block, its home card and the "next project" door that leads to it. Shared frame sections (prose, decisions) stay on ground and sheet.

**The Dark Is Its Own Palette Rule.** Dark mode redefines every neutral, every `-text` shade, both shadows and the effect colours. Field fills and blue stay; anything read as text is retuned for the dark ground.

## Typography

**Display Font:** General Sans (with ui-sans-serif, system-ui)
**Body Font:** General Sans, weights 400, 500, 600, 700
**Label/Mono Font:** ui-monospace, SF Mono, Menlo, for literal command and code text only
**Tamil:** Kavivanar, loaded for Tamil glyphs only, with `font-synthesis: none`

**Character:** One geometric-humanist sans doing every job, with weight and tracking carrying hierarchy. Headlines are semibold and pulled tight; body is regular with the `ss01` stylistic set on.

### Hierarchy
- **Display** (600, `clamp(2.8rem, 6.4vw, 5.25rem)`, 0.95, -0.04em): case-study project names. The footer's "Say hi." runs the same treatment larger (`clamp(3rem, 9vw, 6rem)`).
- **Hero headline** (600, `clamp(2.4rem, min(4.4vw, 8vh), 4.25rem)`, 1.02, -0.035em; capped at 3.75rem on large screens): the landing headline, staggered in once.
- **Headline** (600, `clamp(2.2rem, 4.4vw, 3.6rem)`, -0.03em): home section titles.
- **Case headline** (600, `clamp(1.9rem, 3.4vw, 2.75rem)`, -0.03em): case-study section titles, sticky beside their prose on large screens.
- **Title** (600, 1.6rem, -0.02em): project names on cards and in the carousel. Decision rows use 1.15rem.
- **Lead** (500, `clamp(1.05rem, 1.6vw, 1.3rem)`, snug): hero subline and case summaries.
- **Body** (400, 1.0625rem, 1.6): default. Case prose runs 1.08rem / 1.65 in ink-2 at 64ch; blog prose 1.12rem / 1.75.
- **Label** (500 to 600, 0.76 to 0.85rem, sentence case): fact labels, dates, tile labels, chips. Always sentence case, never tracked uppercase.

### Named Rules
**The Tracking Scales With Size Rule.** The bigger the type, the tighter it is: -0.04em for display, -0.03em for headlines, -0.02em for titles, normal for body.

**The Mono Means Literal Rule.** Monospace appears only for text a machine would read: commands, code, package names. Never for decoration or labels.

## Layout

A single 1240px container with 16px gutters (24px from `sm`). Sections stack vertically with large top padding: 112px / 144px on home sections, 96px / 128px between case-study sections.

- **Home hero:** a two-column grid (`0.9fr / 1.1fr`) on large screens: the intro sheet on the left, a bento of tiles on the right, 12px gaps. The bento is three columns from `sm` and two on phones, where the carousel spans the full row and the socials fold into one icon tile.
- **Selected work:** a two-column card grid (24px column gap, 56px row gap). Featured projects span the full row at a wide aspect (up to 3:1); the others pair up between them. Ordinary cards are 4:3.
- **Case studies:** a shared frame. A field-coloured hero sheet (copy left, live media right, stacked on mobile), then sections laid out as a sticky heading column (1fr) beside a prose column (2fr), with optional full-width material underneath.
- **Measure:** prose caps at 64ch; summaries at 36 to 62ch.

## Elevation & Depth

A hybrid. Sections are flat sheets distinguished from the ground by tone alone. Interactive tiles and panels carry a soft two-layer shadow with a 1px top highlight, and lift on hover. Shadows are always tinted ink, never neutral black, in light mode.

### Shadow Vocabulary
- **Tile** (`--shadow-tile`): resting state for bento tiles, explain panels, quiet buttons, the nav hover pill and code blocks.
- **Lift** (`--shadow-lift`): hover state of tiles; also floating tips.
- **Inset ring** (`inset 0 0 0 1px var(--line)`): wells and icon squares, in place of borders.
- **Accent glow** (`0 8px 20px -8px` tinted blue, plus a 1px inset highlight): the primary button only.

### Named Rules
**The Lift-On-Hover Rule.** Resting tiles sit on `shadow-tile`; hover moves them to `shadow-lift` (eases in over 500ms, out over 200ms) and press squeezes them to 98.5%.

**The Ring-Not-Border Rule.** Wells and chips are outlined with a 1px inset or outer box-shadow ring in `line`, not a CSS border. Ruled lists (decisions, the explain panel's fact row) are the exception and use a 1px top border.

## Shapes

Everything is rounded, and radius steps down as containers nest: sheets 40px, signature blocks 32px, tiles 28px, panels 24px, wells 16px, icon squares 12px, inline code 0.4em. Interactive controls are full pills. The focus ring is pill-shaped by default (`border-radius: 999px` on `:focus-visible`). One playful shape: the tilted ink sticker beside the portrait, rotated -7deg, which wobbles on hover.

### Named Rules
**The Nesting Radius Rule.** A child's radius is always smaller than its parent's. Never put a 28px tile inside a 24px panel.

## Components

### Buttons
Tactile and quick: they squash toward the baseline when pressed.
- **Shape:** full pill, 48px tall, 24px left and 20px right padding around a label and a sliding arrow.
- **Primary:** blue fill, fixed ink text, a tinted glow underneath. Hover moves to pressed blue.
- **Ink / Quiet:** ink fill with sheet text, or a sheet fill on the tile shadow.
- **Flow (secondary):** a sunk-sheet pill with a hairline ring. On hover the fill clears and a dashed blue-ink outline fades in and runs around the edge.
- **Press:** `scale-x 1.02, scale-y 0.92` from the bottom edge in 75ms, released over 150ms on the quart ease.
- **Arrow:** slides 4px right on hover (200ms, expo ease). Outbound links use an up-right arrow that moves diagonally.
- **On a project field:** the first link is a `-deep` fill with field-coloured text; the rest are translucent white veils (55%, 80% on hover).

### Chips
- **Tag chips:** sheet pill, ink-2 label at 0.8rem, 1px line ring. Static.
- **Example chips (cmd-facts):** monospace pills on the green field, translucent white at 40% (70 to 75% on hover); the selected one is a `cmd-facts-deep` fill with green text. They press to 95%.

### Cards / Containers
- **Sheet:** 40px radius, sheet fill, 24 to 48px padding. Holds the hero intro, footer and case heroes.
- **Bento tile:** 28px radius, sheet fill, 20px padding, minimum 148px tall, tile shadow lifting on hover. A label and arrow sit on top, content at the bottom.
- **Project card:** a 28px field-coloured media frame holding real or live media that rises 6px on hover. Under it sit the name (which takes the project's `-text` colour on hover), the year, the summary, tag chips and a "Case study" arrow link.

### Inputs / Fields
- **Style:** 16px radius, no border, a translucent white fill at 75% on the project field, monospace text in the field's deep shade, an 8% inset ring.
- **Focus:** the inset ring thickens to 2px in the deep shade.

### Navigation
- Sticky header on ground, 72px tall: the wordmark (a blue disc logo plus the name, where "David" scrambles into Tamil on hover) on the left; text links in ink-2 at 0.92rem in the middle; the copy-email pill and theme toggle on the right. A sheet pill with the tile shadow follows the hovered link on a spring.

### Pointer Spotlight
Tiles track the pointer in CSS variables. On hover a 280px soft circle of the relevant colour (38% mix) fades in under the pointer, or reveals a brand fill through a mask on the social rows. It fades in over 500ms and out over 200ms.

### Carousel indicators
On the "Currently working on" tile, the active dot widens into an 8px-tall track that fills with ink over the slide's six-second stay. The clock pauses on hover or focus. Slides enter from the direction of travel and can be swiped.

### Explain panel (cmd-facts signature)
A 24px sheet panel on the tile shadow holding a live `explain()` result: a sunk monospace command line with each argument underlined, a lead-size sentence, and a ruled fact row of small labels over semibold values. Hovering an argument in the command or the sentence highlights its pair in a 32% green wash. Effect words take the effect colours. In the playground, arguments turn cmd-facts-text and show a small ink tip naming their role.

## Do's and Don'ts

### Do:
- **Do** put ink on blue (fixed ink, `oklch(0.21 0.014 245)`) and use `blue-text` wherever the accent has to be read as text.
- **Do** give every clickable element press feedback: the pill squash (`scale-y 0.92`, 75ms) for buttons, 98.5% for tiles, 90 to 95% for small chips and dots.
- **Do** ease hover-in slowly (500ms) and hover-out quickly (200ms) on the expo curve `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Do** mark travelling or tilting elements `data-motion="travel"` so reduced motion strips transform and keeps colour, opacity and shadow feedback.
- **Do** step radii down as containers nest (40, 32, 28, 24, 16, 12).
- **Do** keep a project's field colour to its hero, signature block, home card and next-project door.
- **Do** show real or live media in project frames (video, a live pendulum, the real npm package running).

### Don't:
- **Don't** put white text on David's blue.
- **Don't** use tracked uppercase eyebrows or kickers; labels are sentence case at 0.76 to 0.85rem in ink-3.
- **Don't** invert the light palette for dark mode; retune neutrals, `-text` shades and shadows.
- **Don't** use the `cf-effect-*` colours outside the cmd-facts explain panel.
- **Don't** use monospace for anything a machine wouldn't read.
- **Don't** reintroduce the previous davidsling.in design language or a concept-driven world.
