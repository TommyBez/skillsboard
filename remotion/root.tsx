import { Composition } from "remotion";
import { PROMO_DURATION, SkillsboardPromo } from "./skillsboard-promo";

export function RemotionRoot() {
  return (
    <Composition
      component={SkillsboardPromo}
      durationInFrames={PROMO_DURATION}
      fps={30}
      height={720}
      id="skillsboard-promo"
      width={1280}
    />
  );
}
