export const COCKPIT_FRAME_COUNT = 240;

export const getCockpitFrameSrc = (index: number) =>
  `/cockpit-sequence/frame_${String(index).padStart(4, "0")}.webp`;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
