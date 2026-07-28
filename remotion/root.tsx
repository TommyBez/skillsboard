import { Composition } from "remotion";
import {
  LAUNCH_FPS,
  PRODUCT_HUNT_DURATION,
  SOCIAL_DURATION,
  SkillsboardLaunchProductHunt,
  SkillsboardLaunchSocial,
} from "./skillsboard-launch-videos";
import { PROMO_DURATION, SkillsboardPromo } from "./skillsboard-promo";

export function RemotionRoot() {
  return (
    <>
      <Composition
        component={SkillsboardPromo}
        durationInFrames={PROMO_DURATION}
        fps={30}
        height={720}
        id="skillsboard-promo"
        width={1280}
      />
      <Composition
        component={SkillsboardLaunchProductHunt}
        durationInFrames={PRODUCT_HUNT_DURATION}
        fps={LAUNCH_FPS}
        height={900}
        id="skillsboard-launch-product-hunt"
        width={1440}
      />
      <Composition
        component={SkillsboardLaunchSocial}
        durationInFrames={SOCIAL_DURATION}
        fps={LAUNCH_FPS}
        height={900}
        id="skillsboard-launch-social"
        width={1440}
      />
    </>
  );
}
