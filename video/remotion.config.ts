import { Config } from "@remotion/cli/config";

// Reuse the site's own fonts instead of copying them.
Config.setPublicDir("../public");
Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");
