import { pixelBasedPreset, type TailwindConfig } from "react-email"

/**
 * Email palette pinned to remotion/product-demo/theme.ts (hex mirrors of app/globals.css).
 * Keep in sync when the product palette moves.
 */
export const emailColors = {
  brand: "#00752a",
  brandForeground: "#fbfaf4",
  paper: "#f5f4ec",
  surface: "#fdfdf8",
  ink: "#0b140f",
  muted: "#4c5951",
  border: "#cccbbe",
  panel: "#e7e7de",
} as const

const tailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        brand: emailColors.brand,
        "brand-foreground": emailColors.brandForeground,
        paper: emailColors.paper,
        surface: emailColors.surface,
        ink: emailColors.ink,
        muted: emailColors.muted,
        border: emailColors.border,
        panel: emailColors.panel,
      },
    },
  },
} satisfies TailwindConfig

export default tailwindConfig
