// Loaded through LazyMotion's async `features` so the animation runtime ships
// in its own lazy chunk instead of every route's critical JS. domMax includes
// the layout-animation support that collapsible-banner, command-palette, and
// presence-avatars rely on.
export { domMax as default } from "motion/react"
