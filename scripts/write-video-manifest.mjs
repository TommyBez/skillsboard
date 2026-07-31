// Regenerates public/launch/skills-board-video-manifest.json after a launch render.
// Usage: node scripts/write-video-manifest.mjs

import { createHash } from "node:crypto";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

const probe = (path) => {
  const raw = execFileSync("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height,nb_frames,r_frame_rate,codec_name",
    "-of",
    "json",
    path,
  ]);
  const stream = JSON.parse(raw.toString()).streams[0];
  const [num, den] = stream.r_frame_rate.split("/").map(Number);
  const fps = den ? num / den : num;
  const frames = Number(stream.nb_frames);

  return {
    width: stream.width,
    height: stream.height,
    fps,
    frames,
    duration_seconds: Number((frames / fps).toFixed(2)),
    video_codec: stream.codec_name === "h264" ? "h264" : stream.codec_name,
  };
};

const outputs = [
  {
    composition: "skillsboard-launch-product-hunt",
    path: "public/launch/skills-board-product-demo-product-hunt.mp4",
    captions: "public/launch/skills-board-product-demo-product-hunt.vtt",
  },
  {
    composition: "skillsboard-launch-social",
    path: "public/launch/skills-board-product-demo.mp4",
    captions: "public/launch/skills-board-product-demo.vtt",
  },
  {
    composition: "skillsboard-team-loop",
    path: "public/launch/skills-board-team-loop.mp4",
  },
].map((output) => ({
  composition: output.composition,
  path: output.path,
  sha256: sha256(output.path),
  bytes: statSync(output.path).size,
  ...probe(output.path),
  audio: false,
  ...(output.captions
    ? { captions: output.captions, captions_sha256: sha256(output.captions) }
    : {}),
}));

const posters = [
  "public/launch/skills-board-product-demo-poster.jpg",
  "public/launch/skills-board-team-loop-poster.jpg",
];

const manifest = {
  schema_version: 1,
  generator: {
    source: "remotion/product-demo/index.tsx",
    source_sha256: sha256("remotion/product-demo/index.tsx"),
    font_loader: "remotion/product-demo/fonts.ts",
    font_loader_sha256: sha256("remotion/product-demo/fonts.ts"),
    remotion_version: JSON.parse(readFileSync("package.json")).dependencies["@remotion/media"],
    render_command: "pnpm video:render:launch",
  },
  outputs,
  posters: posters.map((path) => ({
    path,
    sha256: sha256(path),
    bytes: statSync(path).size,
    width: 1440,
    height: 900,
  })),
};

writeFileSync(
  "public/launch/skills-board-video-manifest.json",
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log("wrote public/launch/skills-board-video-manifest.json");
