/**
 * Swatch colours for the colour names sellers give their variants.
 * Variant colours are free text, so a name missing here has no swatch
 * and is drawn as a neutral one with its name.
 */
const swatches: Record<string, string> = {
  tangerine: '#FF6A2B',
  tomato: '#F0452B',
  cherry: '#E0283C',
  red: '#E0283C',
  bubblegum: '#FF5DA2',
  pink: '#FF5DA2',
  peach: '#FF9E7A',
  coral: '#FF7A6B',
  orange: '#FF6A2B',
  sunshine: '#FFC21A',
  sunflower: '#F5C242',
  yellow: '#F5C242',
  lemon: '#F5D33B',
  lime: '#9BDB2E',
  grass: '#2FB34A',
  green: '#2FB34A',
  mint: '#3FC9A0',
  sage: '#7FA88B',
  teal: '#0FA3A3',
  sky: '#4FB6F2',
  ocean: '#1E7BD9',
  blue: '#1E7BD9',
  cobalt: '#2747D9',
  navy: '#1F2A5C',
  violet: '#7B4DFF',
  purple: '#7B4DFF',
  lilac: '#A98BF0',
  brown: '#7A4E2D',
  beige: '#D9C7A7',
  grey: '#9A9EA6',
  gray: '#9A9EA6',
  silver: '#C4C7CC',
  black: '#1B1C1F',
  white: '#F4F4F2',
};

/** The swatch colour for a colour name, matched case-insensitively. */
export function colourHex(name: string): string | undefined {
  return swatches[name.trim().toLowerCase()];
}

/** Ink or white, whichever reads better on top of the colour. */
export function contrastOn(hex: string) {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.179 ? 'var(--color-ink)' : '#ffffff';
}
