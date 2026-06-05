// Refactored: central animation presets for reusable UI motion.
export const spring = {
  snappy: { damping: 18, stiffness: 300 },
  bouncy: { damping: 12, stiffness: 200 },
  gentle: { damping: 20, stiffness: 150 },
} as const;

export const timing = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;
