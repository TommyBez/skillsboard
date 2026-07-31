import { interpolate } from "remotion";
import { collections } from "../content";
import { clamp, outEasing, Scene, useSceneFrame } from "../stage";
import { light, MONO, radius } from "../theme";
import { CollectionCard } from "../ui/surfaces";

const REF = 120;

/** The empty third slot in the first card's member row. */
const DROP = { left: 126, top: 132 };

export function CollectionsScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);

  return (
    <Scene zoom={1.4}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div style={{ position: "relative", display: "flex", gap: 24 }}>
          {collections.items.map((item, index) => (
            <div
              key={item.title}
              style={{
                opacity: interpolate(frame, [index * 8, 18 + index * 8], [0, 1], clamp),
                translate: `0 ${interpolate(frame, [index * 8, 24 + index * 8], [20, 0], outEasing)}px`,
              }}
            >
              <CollectionCard
                title={item.title}
                count={[item.from, item.to]}
                members={item.members}
                incoming={index === 0 ? interpolate(frame, [56, 66], [0, 1], clamp) : 0}
                swapAt={58}
                active={index === 0 && frame >= 52}
              />
            </div>
          ))}

          <div
            style={{
              position: "absolute",
              left: DROP.left,
              top: DROP.top,
              padding: "3px 9px",
              borderRadius: radius.md,
              border: `1px solid ${light.border}`,
              background: light.card,
              fontFamily: MONO,
              fontSize: 12,
              opacity: interpolate(frame, [20, 30, 48, 58], [0, 1, 1, 0], clamp),
              translate: `${interpolate(frame, [24, 54], [46, 0], outEasing)}px ${interpolate(frame, [24, 54], [-250, 0], outEasing)}px`,
            }}
          >
            pdf
          </div>
        </div>

        <div
          style={{
            fontSize: 22,
            color: light.mutedForeground,
            opacity: interpolate(frame, [70, 88], [0, 1], clamp),
          }}
        >
          {collections.line}
        </div>
      </div>
    </Scene>
  );
}
