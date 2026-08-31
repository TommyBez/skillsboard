import { interpolate, useCurrentFrame } from "remotion";
import { displayTracking, light, MONO, radius } from "../../product-demo/theme";
import { Beat, display, Kicker, Land, snap } from "./kit";
import {
  agentRun,
  libraryHeading,
  librarySkillCount,
  librarySkills,
} from "./spot-content";

/**
 * The shelf.
 *
 * Without this beat the film is about release notes, because release notes is
 * the only thing it ever shows. Five cards fix that in three seconds and without
 * a sentence: a grid reads as a plural before anyone has finished the heading
 * over it, and every card after this one is understood as one entry off a shelf
 * rather than as the product. The names are set in the same mono the client uses
 * for tool names, because that is what they are on disk.
 *
 * The first card is the one the rest of the film follows. It arrives with the
 * others and then, once the grid has settled, takes a green edge, which is the
 * whole handoff into the next cut.
 */

/** Three across, so five entries leave one gap and the grid reads as unfinished. */
const CARD = { width: 512, height: 168 } as const;

export function LibraryBeat() {
  const frame = useCurrentFrame();
  const mark = interpolate(frame, [46, 56], [0, 1], snap);

  return (
    <Beat gap={40}>
      <Kicker at={0}>{agentRun.server}</Kicker>

      <div>
        <Land at={4} over={11}>
          <div style={{ ...display, fontSize: 86 }}>{libraryHeading}</div>
        </Land>
        <Land at={10} from={14} over={9}>
          <div
            style={{
              marginTop: 18,
              fontFamily: MONO,
              fontSize: 30,
              color: light.mutedForeground,
            }}
          >
            {librarySkillCount}
          </div>
        </Land>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 28, width: 1620 }}>
        {librarySkills.map((skill, index) => {
          const lead = index === 0;

          return (
            <Land at={16 + index * 5} from={24} key={skill.name} over={10}>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  ...CARD,
                  padding: "30px 34px",
                  borderRadius: radius["2xl"],
                  border: `1px solid ${light.border}`,
                  background: light.card,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontWeight: 500,
                    fontSize: 40,
                    letterSpacing: displayTracking,
                    color: light.foreground,
                  }}
                >
                  {skill.name}
                </div>

                <div>
                  <span
                    style={{
                      padding: "8px 20px",
                      borderRadius: radius.lg,
                      border: `1px solid ${light.border}`,
                      fontFamily: MONO,
                      fontSize: 26,
                      color: light.mutedForeground,
                    }}
                  >
                    {skill.tag}
                  </span>
                </div>

                {lead ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: -1,
                      borderRadius: radius["2xl"],
                      border: `3px solid ${light.primary}`,
                      opacity: mark,
                    }}
                  />
                ) : null}
              </div>
            </Land>
          );
        })}
      </div>
    </Beat>
  );
}
