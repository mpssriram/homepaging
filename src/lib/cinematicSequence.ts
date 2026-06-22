// Desktop sequence is served from /cockpit-sequence-optimized as 1920x1080
// WebP frames. Keep this path in sync with scripts/prepare-cockpit-sequence.mjs.
export const COCKPIT_FRAME_COUNT = 240;

// Portrait mobile sequence (720x1280 / 1080x1920, true vertical) served from
// /cockpit-mobile-portrait, prepared by scripts/prepare-mobile-portrait-frames.mjs.
// This is the default mobile experience: the frames are already portrait, so they
// fill a phone screen with "cover" and never read like a landscape clip.
export const COCKPIT_MOBILE_PORTRAIT_FRAME_COUNT = 120;

// Legacy landscape mobile sequence (AUTOx480, ~853x480 16:9) served from
// /cockpit-mobile, prepared by scripts/prepare-mobile-frames.mjs. Retained as a
// fallback (e.g. the reduced-motion still) now that the portrait set is primary.
export const COCKPIT_MOBILE_FRAME_COUNT = 120;

const frameName = (index: number, ext: "webp" | "jpg") =>
  `frame_${String(index).padStart(4, "0")}.${ext}`;

export const getCockpitFrameSrc = (index: number) =>
  `/cockpit-sequence-optimized/${frameName(index, "webp")}`;

export const getCockpitMobilePortraitFrameSrc = (index: number) =>
  `/cockpit-mobile-portrait/${frameName(index, "jpg")}`;

export const getCockpitMobileFrameSrc = (index: number) =>
  `/cockpit-mobile/${frameName(index, "jpg")}`;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export type CockpitOverride = "mobile" | "desktop" | null;

// Runtime override read from the URL, so the mobile/desktop branch can be forced
// on a real device against the deployed build:
//   ?cockpitMobile=1  -> force the mobile sequence
//   ?cockpitDesktop=1 -> force the desktop sequence
export function readCockpitOverride(search?: string): CockpitOverride {
  if (typeof window === "undefined" && search === undefined) {
    return null;
  }

  const params = new URLSearchParams(search ?? window.location.search);

  if (params.get("cockpitMobile") === "1") {
    return "mobile";
  }

  if (params.get("cockpitDesktop") === "1") {
    return "desktop";
  }

  return null;
}
