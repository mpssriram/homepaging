import { useEffect, useState } from "react";
import type { MutableRefObject } from "react";
import type { LoadedFrame } from "../../hooks/useImagePreloader";
import type { CockpitOverride } from "../../lib/cinematicSequence";

type FitMode = "cover" | "contain";

type CockpitDebugOverlayProps = {
  frameIndexRef: MutableRefObject<number>;
  getFrameSrc: (index: number) => string;
  isMobile: boolean;
  fitMode: FitMode;
  sequencePath: string;
  override: CockpitOverride;
  // Optional: when present, the overlay reports the natural pixel size of the
  // frame currently on the canvas so a portrait set (e.g. 720x1280 / 1080x1920)
  // can be verified against a landscape one (~853x480) on a real device.
  getNearestLoadedFrame?: (targetFrame: number) => LoadedFrame | null;
};

// Dev-only (or ?cockpitDebug=1) diagnostics for the cockpit hero. It ticks a few
// times a second so the live frame index / src track the scroll position, and
// listens for resize so the viewport numbers stay current on orientation change.
export function CockpitDebugOverlay({
  frameIndexRef,
  getFrameSrc,
  isMobile,
  fitMode,
  sequencePath,
  override,
  getNearestLoadedFrame,
}: CockpitDebugOverlayProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((value) => value + 1);
    const intervalId = window.setInterval(bump, 150);
    window.addEventListener("resize", bump);
    window.addEventListener("orientationchange", bump);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("resize", bump);
      window.removeEventListener("orientationchange", bump);
    };
  }, []);

  const frame = Math.round(frameIndexRef.current);
  const loadedImage = getNearestLoadedFrame?.(frame)?.image;
  const naturalSize = loadedImage
    ? `${loadedImage.naturalWidth}x${loadedImage.naturalHeight}`
    : "—";
  const rows: Array<[string, string]> = [
    ["window.innerWidth", `${window.innerWidth}px`],
    ["window.innerHeight", `${window.innerHeight}px`],
    ["devicePixelRatio", String(window.devicePixelRatio)],
    ["isMobile", String(isMobile)],
    ["sequence", sequencePath],
    ["frame src", getFrameSrc(frame)],
    ["image natural size", naturalSize],
    ["fitMode", fitMode],
    ["override", override ?? "none"],
  ];

  return (
    <div className="cockpit-debug" role="status" aria-live="off">
      <strong className="cockpit-debug__title">cockpit debug</strong>
      {rows.map(([label, value]) => (
        <div className="cockpit-debug__row" key={label}>
          <span className="cockpit-debug__key">{label}</span>
          <span className="cockpit-debug__value">{value}</span>
        </div>
      ))}
    </div>
  );
}
