import type { CSSProperties } from "react";

// Theme palettes. Every token maps 1:1 to a CSS variable in app/globals.css.

export const TOKEN_GROUPS = {
  Base: ["background", "foreground"],
  Card: ["card", "card-foreground"],
  Popover: ["popover", "popover-foreground"],
  Primary: ["primary", "primary-foreground"],
  Secondary: ["secondary", "secondary-foreground"],
  Muted: ["muted", "muted-foreground"],
  Accent: ["accent", "accent-foreground"],
  Destructive: ["destructive"],
  Borders: ["border", "input", "ring"],
  Charts: ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"],
  Sidebar: [
    "sidebar",
    "sidebar-foreground",
    "sidebar-primary",
    "sidebar-primary-foreground",
    "sidebar-accent",
    "sidebar-accent-foreground",
    "sidebar-border",
    "sidebar-ring",
  ],
} as const;

export type Token = (typeof TOKEN_GROUPS)[keyof typeof TOKEN_GROUPS][number];
export type Palette = Record<Token, string>;
export type Theme = { id: string; name: string; light: Palette; dark: Palette };

// Mirrors the values in app/globals.css.
const DEFAULT: Theme = {
  id: "default",
  name: "Default",
  light: {
    background: "oklch(0.9521 0 0)",
    foreground: "oklch(0.3171 0 0)",
    card: "oklch(1 0 0)",
    "card-foreground": "oklch(0.145 0 0)",
    popover: "oklch(1 0 0)",
    "popover-foreground": "oklch(0.145 0 0)",
    primary: "oklch(0.205 0 0)",
    "primary-foreground": "oklch(0.985 0 0)",
    secondary: "oklch(0.97 0 0)",
    "secondary-foreground": "oklch(0.205 0 0)",
    muted: "oklch(0.97 0 0)",
    "muted-foreground": "oklch(0.556 0 0)",
    accent: "oklch(0.97 0 0)",
    "accent-foreground": "oklch(0.205 0 0)",
    destructive: "oklch(0.577 0.245 27.325)",
    border: "oklch(0.922 0 0)",
    input: "oklch(0.922 0 0)",
    ring: "oklch(0.708 0 0)",
    "chart-1": "oklch(0.646 0.222 41.116)",
    "chart-2": "oklch(0.6 0.118 184.704)",
    "chart-3": "oklch(0.398 0.07 227.392)",
    "chart-4": "oklch(0.828 0.189 84.429)",
    "chart-5": "oklch(0.769 0.188 70.08)",
    sidebar: "oklch(0.985 0 0)",
    "sidebar-foreground": "oklch(0.145 0 0)",
    "sidebar-primary": "oklch(0.205 0 0)",
    "sidebar-primary-foreground": "oklch(0.985 0 0)",
    "sidebar-accent": "oklch(0.97 0 0)",
    "sidebar-accent-foreground": "oklch(0.205 0 0)",
    "sidebar-border": "oklch(0.922 0 0)",
    "sidebar-ring": "oklch(0.708 0 0)",
  },
  dark: {
    background: "oklch(0.3171 0 0)",
    foreground: "oklch(0.9521 0 0)",
    card: "oklch(0.205 0 0)",
    "card-foreground": "oklch(0.985 0 0)",
    popover: "oklch(0.205 0 0)",
    "popover-foreground": "oklch(0.985 0 0)",
    primary: "oklch(0.922 0 0)",
    "primary-foreground": "oklch(0.205 0 0)",
    secondary: "oklch(0.269 0 0)",
    "secondary-foreground": "oklch(0.985 0 0)",
    muted: "oklch(0.269 0 0)",
    "muted-foreground": "oklch(0.708 0 0)",
    accent: "oklch(0.269 0 0)",
    "accent-foreground": "oklch(0.985 0 0)",
    destructive: "oklch(0.704 0.191 22.216)",
    border: "oklch(1 0 0 / 10%)",
    input: "oklch(1 0 0 / 15%)",
    ring: "oklch(0.556 0 0)",
    "chart-1": "oklch(0.488 0.243 264.376)",
    "chart-2": "oklch(0.696 0.17 162.48)",
    "chart-3": "oklch(0.769 0.188 70.08)",
    "chart-4": "oklch(0.627 0.265 303.9)",
    "chart-5": "oklch(0.645 0.246 16.439)",
    sidebar: "oklch(0.205 0 0)",
    "sidebar-foreground": "oklch(0.985 0 0)",
    "sidebar-primary": "oklch(0.488 0.243 264.376)",
    "sidebar-primary-foreground": "oklch(0.985 0 0)",
    "sidebar-accent": "oklch(0.269 0 0)",
    "sidebar-accent-foreground": "oklch(0.985 0 0)",
    "sidebar-border": "oklch(1 0 0 / 10%)",
    "sidebar-ring": "oklch(0.556 0 0)",
  },
};

// Builds a light + dark palette tinted around a single hue.
function tinted(id: string, name: string, h: number, c = 0.15): Theme {
  const o = (l: number, ch: number, hue = h) => `oklch(${l} ${ch} ${hue})`;
  const charts = [0, 50, 110, 180, 260].map((d) => (h + d) % 360);
  const chartsOf = (l: number) =>
    Object.fromEntries(charts.map((hue, i) => [`chart-${i + 1}`, o(l, c, hue)]));

  const light = {
    background: o(0.97, 0.012),
    foreground: o(0.27, 0.04),
    card: o(0.995, 0.004),
    "card-foreground": o(0.22, 0.04),
    popover: o(0.995, 0.004),
    "popover-foreground": o(0.22, 0.04),
    primary: o(0.55, c),
    "primary-foreground": o(0.98, 0.01),
    secondary: o(0.93, 0.03),
    "secondary-foreground": o(0.3, 0.06),
    muted: o(0.94, 0.015),
    "muted-foreground": o(0.5, 0.03),
    accent: o(0.91, 0.05),
    "accent-foreground": o(0.3, 0.08),
    destructive: "oklch(0.577 0.245 27.325)",
    border: o(0.9, 0.02),
    input: o(0.9, 0.02),
    ring: o(0.55, c),
    ...chartsOf(0.65),
    sidebar: o(0.95, 0.018),
    "sidebar-foreground": o(0.25, 0.04),
    "sidebar-primary": o(0.55, c),
    "sidebar-primary-foreground": o(0.98, 0.01),
    "sidebar-accent": o(0.9, 0.04),
    "sidebar-accent-foreground": o(0.25, 0.06),
    "sidebar-border": o(0.9, 0.02),
    "sidebar-ring": o(0.55, c),
  } as Palette;

  const dark = {
    background: o(0.2, 0.02),
    foreground: o(0.94, 0.012),
    card: o(0.24, 0.025),
    "card-foreground": o(0.96, 0.01),
    popover: o(0.24, 0.025),
    "popover-foreground": o(0.96, 0.01),
    primary: o(0.7, c),
    "primary-foreground": o(0.18, 0.03),
    secondary: o(0.3, 0.03),
    "secondary-foreground": o(0.94, 0.01),
    muted: o(0.28, 0.02),
    "muted-foreground": o(0.7, 0.03),
    accent: o(0.33, 0.05),
    "accent-foreground": o(0.95, 0.02),
    destructive: "oklch(0.704 0.191 22.216)",
    border: "oklch(1 0 0 / 10%)",
    input: "oklch(1 0 0 / 15%)",
    ring: o(0.7, c),
    ...chartsOf(0.7),
    sidebar: o(0.17, 0.02),
    "sidebar-foreground": o(0.94, 0.012),
    "sidebar-primary": o(0.7, c),
    "sidebar-primary-foreground": o(0.18, 0.03),
    "sidebar-accent": o(0.28, 0.04),
    "sidebar-accent-foreground": o(0.96, 0.01),
    "sidebar-border": "oklch(1 0 0 / 10%)",
    "sidebar-ring": o(0.7, c),
  } as Palette;

  return { id, name, light, dark };
}

export const PRESET_THEMES: Theme[] = [
  DEFAULT,
  tinted("ocean", "Ocean", 240),
  tinted("forest", "Forest", 150, 0.13),
  tinted("sunset", "Sunset", 45, 0.16),
  tinted("rose", "Rose", 10, 0.17),
  tinted("grape", "Grape", 300, 0.17),
  tinted("mint", "Mint", 180, 0.11),
];

const decls = (p: Palette) =>
  Object.entries(p)
    .map(([k, v]) => `--${k}:${v};`)
    .join("");

// `html:` prefix outranks the plain `:root` / `.dark` rules in globals.css.
export const themeCss = (t: Theme) =>
  `html:root{${decls(t.light)}}html.dark{${decls(t.dark)}}`;

// Inline style for rendering a palette preview inside any element.
export const paletteStyle = (p: Palette) =>
  Object.fromEntries(
    Object.entries(p).map(([k, v]) => [`--${k}`, v]),
  ) as CSSProperties;
