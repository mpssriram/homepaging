export const COCKPIT_FRAME_COUNT = 240;

// Portrait mobile sequence (720x1280 / 1080x1920, true vertical) served from
// /cockpit-mobile-portrait, prepared by scripts/prepare-mobile-portrait-frames.mjs.
// This is the default mobile experience: the frames are already portrait, so they
// fill a phone screen with "cover" and never read like a landscape clip.
//
// 120 portrait approach frames + 60 arrival-ending frames cropped from the desktop
// set (frames 0121..0180) so the phone gets the same "cabin settle + DEV CELL CLUB
// transmission" payoff as desktop. Keep in sync with prepare-mobile-portrait-frames.mjs.
export const COCKPIT_MOBILE_PORTRAIT_FRAME_COUNT = 180;

// Legacy landscape mobile sequence (AUTOx480, ~853x480 16:9) served from
// /cockpit-mobile, prepared by scripts/prepare-mobile-frames.mjs. Retained as a
// fallback (e.g. the reduced-motion still) now that the portrait set is primary.
export const COCKPIT_MOBILE_FRAME_COUNT = 120;

const frameName = (index: number, ext: "webp" | "jpg") =>
  `frame_${String(index).padStart(4, "0")}.${ext}`;

export const getCockpitFrameSrc = (index: number) =>
  `/cockpit-sequence/${frameName(index, "webp")}`;

export const getCockpitMobilePortraitFrameSrc = (index: number) =>
  `/cockpit-mobile-portrait/${frameName(index, "jpg")}`;

export const getCockpitMobileFrameSrc = (index: number) =>
  `/cockpit-mobile/${frameName(index, "jpg")}`;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// Base paths for the sequences, surfaced for the debug overlay.
export const COCKPIT_DESKTOP_SEQUENCE_PATH = "/cockpit-sequence";
export const COCKPIT_MOBILE_PORTRAIT_SEQUENCE_PATH = "/cockpit-mobile-portrait";
export const COCKPIT_MOBILE_SEQUENCE_PATH = "/cockpit-mobile";

export type CockpitOverride = "mobile" | "desktop" | null;

// Runtime override read from the URL, so the mobile/desktop branch can be forced
// on a real device against the deployed build:
//   ?cockpitMobile=1  -> force the mobile sequence + contain fit
//   ?cockpitDesktop=1 -> force the desktop sequence + cover fit
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

// The debug overlay is on by default in dev. In a production build it stays
// hidden for normal visitors but can be switched on with ?cockpitDebug=1 so the
// same diagnostics are available on a real phone against the deployed site.
export function readCockpitDebugEnabled(search?: string): boolean {
  if (import.meta.env.DEV) {
    return true;
  }

  if (typeof window === "undefined" && search === undefined) {
    return false;
  }

  const params = new URLSearchParams(search ?? window.location.search);
  return params.get("cockpitDebug") === "1";
}
