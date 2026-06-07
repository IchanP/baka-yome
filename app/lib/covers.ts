// Per-title placeholder cover gradients. Hashed at runtime per book or
// episode title, so they're applied inline rather than defined as CSS tokens.
// Used until real cover art is wired up.

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
