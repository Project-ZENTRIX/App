import fs from 'fs';

const cssPath = 'd:\\projects-code\\Org.NEXORA-Studios\\Project ZENTRIX\\.design_library\\zentrix\\colors_and_type.css';

const radiusBase = 0.45;
const remToPx = (rem) => `${Math.round(rem * 16 * 10) / 10}px`;

const newCss = `/* Zentrix Design Library — Colors & Typography Tokens */
/* Source: structured-spec */
/* Mode: light-dark */
/* @max-group-size: 50 */

/* ─────────────────────────────────────────────────────────────── */
/* PRIMITIVE TOKENS                                               */
/* ─────────────────────────────────────────────────────────────── */

:root {
    /* Background */
    --background: #fff;

    /* Foreground */
    --foreground: #09090b;

    /* Card */
    --card: #fff;
    --card-foreground: #09090b;

    /* Popover */
    --popover: #fff;
    --popover-foreground: #09090b;

    /* Primary */
    --primary: #008235;
    --primary-foreground: #f0fdf4;

    /* Secondary */
    --secondary: #f4f4f5;
    --secondary-foreground: #18181b;

    /* Muted */
    --muted: #f4f4f5;
    --muted-foreground: #71717b;

    /* Accent */
    --accent: #f4f4f5;
    --accent-foreground: #18181b;

    /* Destructive */
    --destructive: #e7000b;

    /* Border */
    --border: #e4e4e7;

    /* Input */
    --input: #e4e4e7;

    /* Ring */
    --ring: #9f9fa9;

    /* Chart */
    --chart-1: #7bf1a7;
    --chart-2: #00c950;
    --chart-3: #00a63e;
    --chart-4: #008235;
    --chart-5: #026630;

    /* Sidebar */
    --sidebar: #fafafa;
    --sidebar-foreground: #09090b;
    --sidebar-primary: #00a63e;
    --sidebar-primary-foreground: #f0fdf4;
    --sidebar-accent: #f4f4f5;
    --sidebar-accent-foreground: #18181b;
    --sidebar-border: #e4e4e7;
    --sidebar-ring: #9f9fa9;

    /* Radius */
    --radius: ${radiusBase}rem;
    --radius-sm: ${remToPx(radiusBase * 0.6)};
    --radius-md: ${remToPx(radiusBase * 0.8)};
    --radius-lg: ${remToPx(radiusBase)};
    --radius-xl: ${remToPx(radiusBase * 1.4)};
    --radius-2xl: ${remToPx(radiusBase * 1.8)};
    --radius-3xl: ${remToPx(radiusBase * 2.2)};
    --radius-4xl: ${remToPx(radiusBase * 2.6)};

    /* Font */
    --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --font-heading: var(--font-sans);
}

/* ─────────────────────────────────────────────────────────────── */
/* DARK MODE TOKENS                                               */
/* ─────────────────────────────────────────────────────────────── */

.dark {
    /* Background */
    --background: #09090b;

    /* Foreground */
    --foreground: #fafafa;

    /* Card */
    --card: #18181b;
    --card-foreground: #fafafa;

    /* Popover */
    --popover: #18181b;
    --popover-foreground: #fafafa;

    /* Primary */
    --primary: #026630;
    --primary-foreground: #f0fdf4;

    /* Secondary */
    --secondary: #27272a;
    --secondary-foreground: #fafafa;

    /* Muted */
    --muted: #27272a;
    --muted-foreground: #9f9fa9;

    /* Accent */
    --accent: #27272a;
    --accent-foreground: #fafafa;

    /* Destructive */
    --destructive: #ff6467;

    /* Border */
    --border: rgba(255, 255, 255, 0.1);

    /* Input */
    --input: rgba(255, 255, 255, 0.15);

    /* Ring */
    --ring: #71717b;

    /* Chart */
    --chart-1: #7bf1a7;
    --chart-2: #00c950;
    --chart-3: #00a63e;
    --chart-4: #008235;
    --chart-5: #026630;

    /* Sidebar */
    --sidebar: #18181b;
    --sidebar-foreground: #fafafa;
    --sidebar-primary: #00c950;
    --sidebar-primary-foreground: #f0fdf4;
    --sidebar-accent: #27272a;
    --sidebar-accent-foreground: #fafafa;
    --sidebar-border: rgba(255, 255, 255, 0.1);
    --sidebar-ring: #71717b;
}

/* ─────────────────────────────────────────────────────────────── */
/* PORTABLE ALIAS LAYER                                           */
/* ─────────────────────────────────────────────────────────────── */

:root {
    /* Color */
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-card: var(--card);
    --color-card-foreground: var(--card-foreground);
    --color-popover: var(--popover);
    --color-popover-foreground: var(--popover-foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-secondary: var(--secondary);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-muted: var(--muted);
    --color-muted-foreground: var(--muted-foreground);
    --color-accent: var(--accent);
    --color-accent-foreground: var(--accent-foreground);
    --color-destructive: var(--destructive);
    --color-border: var(--border);
    --color-input: var(--input);
    --color-ring: var(--ring);
    --color-chart-1: var(--chart-1);
    --color-chart-2: var(--chart-2);
    --color-chart-3: var(--chart-3);
    --color-chart-4: var(--chart-4);
    --color-chart-5: var(--chart-5);
    --color-sidebar: var(--sidebar);
    --color-sidebar-foreground: var(--sidebar-foreground);
    --color-sidebar-primary: var(--sidebar-primary);
    --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
    --color-sidebar-accent: var(--sidebar-accent);
    --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
    --color-sidebar-border: var(--sidebar-border);
    --color-sidebar-ring: var(--sidebar-ring);

    /* Typography */
    --type-heading: var(--font-heading);
    --type-sans: var(--font-sans);
}
`;

fs.writeFileSync(cssPath, newCss, 'utf-8');
console.log('CSS restructured');
