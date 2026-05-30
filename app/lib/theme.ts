// Site-wide design tokens. Neutrals are universal (dark mode only for now);
// accents are exported separately so each page can pick which one(s) it uses.
// The library only uses READING_ACCENT; the statistics page swaps between
// READING_ACCENT and LISTENING_ACCENT based on the reading/listening mode.

export type AccentTheme = {
  accent: string;
  accentInk: string;
  heatScale: readonly [string, string, string, string, string];
};

export const NEUTRAL_TOKENS = {
  bg: "#1c1d21",
  surface: "#25262b",
  surface2: "#2e2f35",
  ink: "#ebe9ee",
  inkSoft: "#cdcad3",
  mute: "#8d8a96",
  muteSoft: "#5f5d68",
  rule: "#36373d",
  ruleSoft: "#2b2c33",
  heatEmpty: "#2b2c33",
} as const;

export const READING_ACCENT: AccentTheme = {
  accent: "#a380e5",
  accentInk: "#1c1d21",
  heatScale: ["#2b2c33", "#363041", "#4a3a6e", "#6f55a3", "#a380e5"],
};

export const LISTENING_ACCENT: AccentTheme = {
  accent: "#e0685c",
  accentInk: "#1c1d21",
  heatScale: ["#2b2c33", "#3a2e30", "#6e3a37", "#a84e45", "#e0685c"],
};

// Deterministic placeholder cover gradient for a book/episode title.
// Hashes the title into a small set of harmonized palette pairs.
const COVER_PALETTES = [
  { bg1: "#7a8c69", bg2: "#3f5d4a", fg: "#f7eed8" },
  { bg1: "#c66a4e", bg2: "#8e3f29", fg: "#fbf3e1" },
  { bg1: "#456680", bg2: "#2c4258", fg: "#e8efd9" },
  { bg1: "#8a6991", bg2: "#5e4566", fg: "#fbf3e1" },
  { bg1: "#b6884b", bg2: "#7a5a2a", fg: "#fbf3e1" },
  { bg1: "#3f5d4a", bg2: "#22382c", fg: "#e8d9c3" },
  { bg1: "#a93c3c", bg2: "#6e1f1f", fg: "#f3e6d6" },
];

export type CoverPalette = (typeof COVER_PALETTES)[number];

export function coverFor(title: string): CoverPalette {
  let h = 0;
  for (let i = 0; i < title.length; i++) {
    h = (h * 31 + title.charCodeAt(i)) | 0;
  }
  return COVER_PALETTES[Math.abs(h) % COVER_PALETTES.length];
}
