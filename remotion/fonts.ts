import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const SANS = "Bricolage Grotesque";
export const MONO = "Geist Mono";

for (const weight of ["400", "500", "600", "700"]) {
  loadFont({
    family: SANS,
    url: staticFile(`fonts/bricolage-grotesque-latin-${weight}-normal.woff2`),
    weight,
  });
}

for (const weight of ["400", "500"]) {
  loadFont({
    family: MONO,
    url: staticFile(`fonts/geist-mono-latin-${weight}-normal.woff2`),
    weight,
  });
}
