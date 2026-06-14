export const COCKPIT_FRAME_COUNT = 240;

// Dedicated mobile sequence (AUTOx480, ~853x480 16:9) served from /cockpit-mobile,
// prepared by scripts/prepare-mobile-frames.mjs. It is its own shorter set, so it
// carries its own frame count rather than reusing the desktop one.
export const COCKPIT_MOBILE_FRAME_COUNT = 120;

const frameName = (index: number, ext: "webp" | "jpg") =>
  `frame_${String(index).padStart(4, "0")}.${ext}`;

export const getCockpitFrameSrc = (index: number) =>
  `/cockpit-sequence/${frameName(index, "webp")}`;

export const getCockpitMobileFrameSrc = (index: number) =>
  `/cockpit-mobile/${frameName(index, "jpg")}`;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
