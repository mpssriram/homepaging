// Mobile-only device-orientation (gyro) tilt for the drone scene.
//
// This module is fully self-contained: it owns its own listener, rAF loop, and
// IntersectionObserver gating, and it only ever writes `target.style.transform`.
// It shares no state with the cockpit hero, so the two systems stay decoupled.
//
// Tilting left/right leans the drone (roll); tilting forward/back pitches it.
// The motion is damped, clamped, and only active while the drone section is on
// screen, the tab is visible, the viewport is mobile, and reduced-motion is off.

const MOBILE_QUERY = "(max-width: 640px)";

// iOS 13+ exposes a static requestPermission() on DeviceOrientationEvent that is
// absent from the standard DOM typings.
type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied" | "default">;
};

export type DroneGyroController = {
  requestPermissionIfNeeded: () => Promise<boolean>;
  needsPermissionPrompt: boolean;
  start: () => void;
  stop: () => void;
  destroy: () => void;
};

type InitDroneGyroOptions = {
  section: Element;
  target: HTMLElement;
};

export function initDroneGyro({
  section,
  target,
}: InitDroneGyroOptions): DroneGyroController | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (!window.matchMedia(MOBILE_QUERY).matches) {
    return null; // mobile only
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null; // accessibility
  }
  if (typeof window.DeviceOrientationEvent === "undefined") {
    return null; // no sensor / desktop guard
  }

  // --- tunables ---
  const GAMMA_CLAMP = 25;
  const BETA_CLAMP = 18; // deg of input we read (roll / pitch)
  const MAX_TX = 24;
  const MAX_RZ = 6; // px / deg of horizontal lean
  const MAX_TY = 16;
  const MAX_RX = 4; // px / deg of vertical pitch
  const DAMP = 0.08; // 0..1 smoothing per frame (lower = smoother)

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  let betaNeutral: number | null = null;
  const want = { tx: 0, ty: 0, rz: 0, rx: 0 };
  const cur = { tx: 0, ty: 0, rz: 0, rx: 0 };
  let rafId: number | null = null;
  let listening = false;
  // On iOS the listener may only attach after an explicit permission grant.
  // Once granted, the IntersectionObserver is free to auto-resume on re-entry.
  let permissionGranted = false;

  const onOrient = (event: DeviceOrientationEvent) => {
    if (betaNeutral === null) {
      betaNeutral = event.beta ?? 45; // neutral = natural hold angle
    }
    const g = clamp(event.gamma ?? 0, -GAMMA_CLAMP, GAMMA_CLAMP);
    const b = clamp(
      (event.beta ?? betaNeutral) - betaNeutral,
      -BETA_CLAMP,
      BETA_CLAMP,
    );
    want.tx = (g / GAMMA_CLAMP) * MAX_TX;
    want.rz = (g / GAMMA_CLAMP) * MAX_RZ;
    want.ty = (b / BETA_CLAMP) * MAX_TY;
    want.rx = (b / BETA_CLAMP) * MAX_RX;
  };

  const loop = () => {
    cur.tx += (want.tx - cur.tx) * DAMP;
    cur.ty += (want.ty - cur.ty) * DAMP;
    cur.rz += (want.rz - cur.rz) * DAMP;
    cur.rx += (want.rx - cur.rx) * DAMP;
    target.style.transform =
      `translate3d(${cur.tx.toFixed(2)}px, ${cur.ty.toFixed(2)}px, 0) ` +
      `rotateZ(${cur.rz.toFixed(2)}deg) rotateX(${cur.rx.toFixed(2)}deg)`;
    rafId = window.requestAnimationFrame(loop);
  };

  const start = () => {
    if (listening) {
      return;
    }
    listening = true;
    window.addEventListener("deviceorientation", onOrient, true);
    rafId = window.requestAnimationFrame(loop);
  };

  const stop = () => {
    if (!listening) {
      return;
    }
    listening = false;
    window.removeEventListener("deviceorientation", onOrient, true);
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const DeviceOrientation =
    window.DeviceOrientationEvent as DeviceOrientationEventWithPermission;
  const needsPermissionPrompt =
    typeof DeviceOrientation.requestPermission === "function";

  const requestPermissionIfNeeded = async (): Promise<boolean> => {
    if (needsPermissionPrompt) {
      try {
        const granted =
          (await DeviceOrientation.requestPermission!()) === "granted";
        permissionGranted = granted;
        return granted;
      } catch {
        return false;
      }
    }
    return true; // Android / others: no prompt
  };

  // Gate to the drone section ONLY. This is what keeps the cockpit untouched:
  // the listener attaches only while the drone is on screen and detaches when it
  // scrolls away.
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !document.hidden) {
          // Don't auto-start when a permission prompt is still pending (iOS);
          // the enable button drives start() after the user grants access.
          if (!needsPermissionPrompt || permissionGranted) {
            start();
          }
        } else {
          stop();
        }
      });
    },
    { threshold: 0.2 },
  );
  io.observe(section);

  const onVisibilityChange = () => {
    if (document.hidden) {
      stop();
    }
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  return {
    requestPermissionIfNeeded,
    needsPermissionPrompt,
    start,
    stop,
    destroy: () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      target.style.transform = "";
    },
  };
}
