import type { ReactNode } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import "../../product-demo/fonts";
import { light } from "../../product-demo/theme";
import { CardBeat, DoneBeat } from "./beats-console";
import { DesktopBeat } from "./beats-desktop";
import { LibraryBeat } from "./beats-library";
import {
  ApplyBeat,
  EndCardBeat,
  EndpointBeat,
  HookBeat,
  NoteBeat,
  ReachBeat,
} from "./beats-type";
import { GreenWipe } from "./kit";

/**
 * The thirty three second spot.
 *
 * The long agent video is a demonstration: one window, one continuous session,
 * every step in order and at reading speed. This is the other job. It is cut,
 * not filmed. There is no camera move anywhere in it, because a screen recording
 * that sways is a screen recording with a problem, not a film. What carries it
 * instead is the thing spots have always been carried by: the cut, the size of
 * the type, and how long each idea is allowed to stay on screen.
 *
 * Ten beats, hard cut, one idea each, and they answer two questions in that
 * order. What is the product? A shelf of skills a team wrote down, which is why
 * the second beat is a grid of five and not a sentence about one. Where does it
 * land? In the client, which is why the middle of the film hands back the whole
 * window instead of another fragment of one. The example run is release notes,
 * but it does not start until the shelf it came off is already on screen.
 *
 * Three of the cuts are made with a band of brand green crossing the frame,
 * which is the only transition in the film. Every fact is a string out of
 * `../content`.
 */

export const MCP_SPOT_FPS = 30;

/** Frames per beat, in order. They sum to `MCP_AGENT_SPOT_DURATION`. */
const BEATS = [
  { at: 0, length: 86, node: <HookBeat /> },
  { at: 86, length: 110, node: <LibraryBeat /> },
  { at: 196, length: 200, node: <DesktopBeat /> },
  { at: 396, length: 100, node: <CardBeat /> },
  { at: 496, length: 92, node: <NoteBeat /> },
  { at: 588, length: 46, node: <DoneBeat /> },
  { at: 634, length: 76, node: <ApplyBeat /> },
  { at: 710, length: 96, node: <ReachBeat /> },
  { at: 806, length: 78, node: <EndpointBeat /> },
  { at: 884, length: 112, node: <EndCardBeat /> },
] as const satisfies readonly { at: number; length: number; node: ReactNode }[];

/** 996 frames at 30fps: thirty three seconds and a fifth. */
export const MCP_AGENT_SPOT_DURATION = 996;

/** How long a wipe takes to cross, and where its midpoint sits. */
const WIPE = 12;
/** The three cuts the green band makes: into the client, into the payoff, into the endpoint. */
const WIPE_CUTS = [196, 634, 806] as const;

/** The frame the poster would be cut from: the whole window, answer and all. */
export const MCP_AGENT_SPOT_POSTER_FRAME = 380;

export function SkillsboardMcpAgentSpot() {
  return (
    <AbsoluteFill style={{ background: light.background }}>
      {BEATS.map((beat) => (
        <Sequence durationInFrames={beat.length} from={beat.at} key={beat.at}>
          {beat.node}
        </Sequence>
      ))}

      {WIPE_CUTS.map((cut) => (
        <Sequence durationInFrames={WIPE} from={cut - WIPE / 2} key={`wipe-${cut}`}>
          <GreenWipe durationInFrames={WIPE} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
