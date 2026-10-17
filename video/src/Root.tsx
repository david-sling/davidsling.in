import { Composition } from "remotion";
import { Story } from "./Story";
import { FPS, DURATION } from "./timeline";
export const Root = () => (
  <Composition id="EquanimStory" component={Story} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
);
