"use client"

import { useEffect } from "react"

let logged = false

/** A note for the people who open the console: this product is theirs to fork. */
export function LandingConsoleNote() {
  useEffect(() => {
    if (logged) return
    logged = true
    console.info(
      "%c Skills Board %c One shared library. Different agents.\nOpen source and free to run — read or fork it at https://github.com/TommyBez/skillsboard",
      "background: oklch(0.49 0.145 148); color: oklch(0.985 0.008 103); font-weight: 600; border-radius: 3px; padding: 2px 6px;",
      "font-weight: 400; padding: 2px 0;",
    )
  }, [])

  return null
}
