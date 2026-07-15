export interface CollectionColor {
  bg: string;
  text: string;
  icon: string;
  emoji: string;
}

// A distinct, stable color + icon per collection, cycling through a bright
// palette by hashing the collection's id — matches the "colorful folder"
// look where every collection reads at a glance instead of a uniform gray.
const PALETTE: CollectionColor[] = [
  { bg: "#ffd9ea", text: "#b23368", icon: "#ff6fa8", emoji: "🩷" },
  { bg: "#d8f5c9", text: "#3f7d1f", icon: "#7ed957", emoji: "🌿" },
  { bg: "#d3ecff", text: "#1d6fbf", icon: "#5ac8fa", emoji: "🌀" },
  { bg: "#e9dcff", text: "#6b3fbf", icon: "#b983ff", emoji: "🔮" },
  { bg: "#fff0b0", text: "#a87a00", icon: "#ffd93d", emoji: "⭐" },
  { bg: "#ffe0bd", text: "#c1610b", icon: "#ff9f5a", emoji: "🍊" },
  { bg: "#c8f3ea", text: "#0f7a67", icon: "#4fd8bf", emoji: "🌊" },
  { bg: "#ffd3d3", text: "#c23b3b", icon: "#ff7a7a", emoji: "🔥" },
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getCollectionColor(id: string): CollectionColor {
  return PALETTE[hash(id) % PALETTE.length];
}
