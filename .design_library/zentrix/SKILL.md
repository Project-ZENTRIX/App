---
name: zentrix-design
description: Use this skill to generate well-branded interfaces for Zentrix. Contains colors, type, fonts, assets, and UI kit for prototyping dashboard UIs.
user-invocable: true
---
# Zentrix Design Skill

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts, copy assets out and create static HTML files. If working on production code, read the rules here to become an expert in designing with this brand.

## Quick map

- `README.md` — brand context, content fundamentals, visual foundations (read first)
- `css.json` — structured token understanding source
- `colors_and_type.css` — drop-in runtime CSS variables; link it for tokens
- `components/index.json` — component index + cross-component patterns
- `components.css` — aggregated component CSS
- `library-consumption.json` — recommended downstream read order
- `preview/` — small HTML cards illustrating foundations and components

When resolving components, prefer `preview/component-{slug}.html` first, then `components/{slug}.json` for intent and variants.

## Essentials at a glance

- Primary: `#008235` (light) / `#026630` (dark) — crisp green accent on neutral surfaces
- Radius: `7.2px` base; scale runs `4.3px` / `5.8px` / `7.2px` / `10.1px` / `13px` / `15.8px` / `18.7px`
- Type: sans stack uses `"Segoe UI"`, `Roboto`, `"Helvetica Neue"`, `Arial`; heading shares the same stack
- Controls: `32px` default height, `border-radius: 7.2px` (`--radius-lg`), focus ring on `--ring` (`#9f9fa9`)
- Surfaces: white cards (`#fff`) on white background (light); `#18181b` cards on `#09090b` (dark)
- Semantic: destructive red `#e7000b` (light) / `#ff6467` (dark); muted zinc fills for secondary actions
- Elevation: no drop-shadow tokens; cards use a `1px` outline mix for quiet separation
- Voice: neutral, precise, dashboard-oriented

## Components

| Slug | Name | Key Insight |
|------|------|-------------|
| button | Button | Six variants + four sizes; icon-only sizes use tighter radius |
| card | Card | Vertical rhythm via `1rem` gap; footer band with muted background |
| input | Input | Focus ring on ring token; invalid state uses destructive |
| badge | Badge | Pill-shaped status labels with six semantic variants |
| dialog | Dialog | Centered modal with overlay blur and zoom animation |
| select | Select | Trigger + floating content; sm/default sizes |
