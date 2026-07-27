// Skills Board is already publicly available. This flag controls only the
// temporary homepage treatment for the coordinated GTM launch.
export const launchTreatmentIsActive = false

export const launchTreatmentIsVisible =
  launchTreatmentIsActive ||
  process.env.VERCEL_ENV === "preview" ||
  process.env.NODE_ENV === "development"
