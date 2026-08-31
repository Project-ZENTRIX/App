# Zentrix Design System

A design system reconstruction of **Zentrix** — a dashboard-oriented React UI library built on shadcn/ui primitives and Tailwind CSS v4.
The system is optimized for data-dense admin panels, analytics views, and operational dashboards where clarity and density matter more than expressive gradients.

### Source

- **Codebase package:** `packages/ui/src` component source and `globals.css`.
- **Brand owner:** Org.NEXORA-Studios / Project ZENTRIX.

### What this design system covers

- **Foundations** — color modes, type stack, radius scale, borders, focus rings, and a five-stop green chart scale.
- **Components** — 6 documented components: button, card, input, badge, dialog, select.
- **Previews** — HTML preview cards for each component under `preview/`.

## 2. Content Fundamentals

### Voice & tone

Neutral, precise, engineering-first. Labels are short and action-oriented; there is no playful ornament or apologetic hedging. The interface speaks in imperative verbs and direct nouns because the user is assumed to be an operator making decisions, not a consumer browsing content.

### Concrete copy examples

- Button: *"Save changes"*
- Button: *"Delete account"*
- Empty state: *"Select a project"*
- Dialog action: *"Close"*

### When generating copy

- Use imperative verbs for buttons ("Save", "Delete", "Select", "Close").
- Keep badges to one or two words.
- State dialog consequences plainly; do not soften the action with extra words.

## 3. Visual Foundations

### Color

The brand color is a functional green: **#008235** in light mode and **#026630** in dark mode. It carries the primary action burden — buttons, active states, and the sidebar accent — and is paired with a near-white foreground (**#f0fdf4**) to keep contrast clinical. The green is extended into a five-stop chart scale from **#7bf1a7** (lightest) through **#00c950**, **#00a63e**, **#008235**, to **#026630** (darkest), used for data visualization where saturation must remain legible against both white and zinc-950 backgrounds.

Neutrals are kept deliberately cool. In light mode, the page background is pure white (**#fff**), cards are white (**#fff**), secondary / accent / muted surfaces share **#f4f4f5**, and the sidebar sits at **#fafafa**. Foreground text is **#09090b** for headings and body, with muted text at **#71717b**. In dark mode, the canvas drops to **#09090b**, cards and popovers move to **#18181b**, and secondary / accent / muted surfaces unify at **#27272a**. Foreground inverts to **#fafafa** and muted text lightens to **#9f9fa9**.

Semantic color is minimal. Destructive is a sharp red: **#e7000b** in light mode and **#ff6467** in dark mode. Success maps directly to the primary green scale. There is no standalone warning or info hue; the palette avoids decorative divergence so that every color signals actionability.

### Typography

Zentrix uses a single sans family for both interface and headings: **ui-sans-serif** with the stack `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. No custom web fonts are imported, so the typeface resolves to the host operating system’s humanist sans — San Francisco on macOS/iOS, Segoe UI on Windows, Roboto on Android. Headings inherit the same stack via `--font-heading`, which aliases to `--font-sans`. The result is a neutral, high-readability texture that does not compete with data visualizations.

Size and weight are driven by Tailwind v4’s type scale; the token file does not override font sizes or line heights. The design relies on the default 16px base, with buttons, inputs, and labels sized through Tailwind utilities rather than custom tokens.

### Spacing

Spacing is inherited from Tailwind v4’s default scale. The token file does not define explicit spacing tokens, but component conventions assume a 4px base unit and standard Tailwind increments. Default control heights are 32px for buttons and inputs and 20px for badges. Card and dialog internal padding follows Tailwind’s `p-4` / `p-6` defaults, with the card footer rendered as a muted band (`--muted`) to separate it from the body.

### Radius

The radius system is fine-grained and intentionally restrained. The base radius is **0.45rem** (7.2px at a 16px root), giving cards and dialogs a barely-soft corner that reads as precise rather than friendly. The scale runs from **--radius-sm: 4.3px**, **--radius-md: 5.8px**, **--radius-lg: 7.2px**, **--radius-xl: 10.1px**, **--radius-2xl: 13px**, **--radius-3xl: 15.8px**, to **--radius-4xl: 18.7px**. Cards and dialogs use `--radius-xl` (10.1px); controls such as buttons and inputs use the base or `--radius-md`; badges are fully rounded pills.

### Shadow / Elevation

There are no custom shadow tokens in this library. Elevation is handled by Tailwind defaults — dialogs and select dropdowns rely on `shadow-md` combined with a 1px ring (`ring-1`) for definition. The philosophy is flat-by-default: surfaces sit on the same plane unless they are transient overlays, in which case a modest shadow plus the ring is enough to separate them from the background.

### Borders, Backgrounds, and Rings

Borders are hairline and utilitarian. In light mode, the border color is **#e4e4e7** for cards, inputs, sidebars, and dividers. In dark mode, borders become **rgba(255, 255, 255, 0.1)**, with inputs slightly more present at **rgba(255, 255, 255, 0.15)**. Input borders share the same token as general borders. Focus rings use **#9f9fa9** in light mode and **#71717b** in dark mode, giving a subtle gray halo rather than a saturated brand glow.

Backgrounds follow a clear hierarchy: page > sidebar/card > secondary/accent/muted. Pure white on light keeps the dashboard airy; the near-black dark canvas lets green data accents pop without chromatic competition.

## 4. Component Patterns

| Component | File | Key Insight |
|---|---|---|
| button | components/button.json | Six variants + four sizes; focus ring follows the ring token |
| card | components/card.json | `--card-spacing` rhythm; muted footer band |
| input | components/input.json | Focus + invalid states via ring/destructive tokens |
| badge | components/badge.json | Pill labels with primary, secondary, destructive, outline, ghost, link |
| dialog | components/dialog.json | Centered modal with overlay backdrop blur |
| select | components/select.json | Trigger + floating listbox; sm/default sizes |

## 5. Index

- `README.md` — this file
- `colors_and_type.css` — token definitions for color, type, radius, borders, rings
- `css.json` — structured tokens for programmatic consumption
- `components/` — component contracts (button, card, input, badge, dialog, select)
- `components.css` — aggregated component CSS
- `preview/` — HTML preview cards for each component
- `SKILL.md` — AI consumption entry point
- `library-consumption.json` — recommended downstream read order

## 6. Caveats / known substitutions

1. **Font stack falls back to system fonts.** No custom web fonts are loaded; the displayed face depends entirely on the operating system. If a brand font is later required, it must be imported and the `--font-sans` / `--font-heading` tokens updated.
2. **Spacing tokens are inherited from Tailwind v4 defaults.** No explicit spacing scale is defined in `colors_and_type.css`; component spacing assumptions rely on Tailwind’s base scale.
3. **Shadow values rely on Tailwind defaults.** There are no dedicated shadow tokens in the source; overlays use `shadow-md` plus `ring-1`.
4. **OKLCH source values were converted to sRGB hex for portability.** This avoids per-browser gamut variance but may clip extremely saturated greens in wide-gamut displays.
