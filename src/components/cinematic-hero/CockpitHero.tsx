import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useImagePreloader } from "../../hooks/useImagePreloader";
import { useMobileViewport } from "../../hooks/useMobileViewport";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import {
  clamp,
  COCKPIT_FRAME_COUNT,
  COCKPIT_MOBILE_PORTRAIT_FRAME_COUNT,
  getCockpitFrameSrc,
  getCockpitMobileFrameSrc,
  getCockpitMobilePortraitFrameSrc,
  readCockpitOverride,
} from "../../lib/cinematicSequence";
import { CockpitCanvasSequence } from "./CockpitCanvasSequence";
import { HeroOverlay } from "./HeroOverlay";

// The cockpit swaps to the dedicated mobile sequence below 768px (per the
// responsive brief). The navbar keeps its own default breakpoint.
const COCKPIT_MOBILE_BREAKPOINT = 768;
// A representative mid-sequence frame for the reduced-motion still.
const MOBILE_STATIC_FRAME = 60;

export function CockpitHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isMobileViewport = useMobileViewport(COCKPIT_MOBILE_BREAKPOINT);
  // A ?cockpitMobile=1 / ?cockpitDesktop=1 URL override forces the branch so the
  // mobile vs desktop path can be confirmed on a real device; otherwise the
  // viewport breakpoint decides. Read once — the query string is stable per load.
  const override = useMemo(() => readCockpitOverride(), []);
  const isMobile =
    override === "mobile"
      ? true
      : override === "desktop"
        ? false
        : isMobileViewport;
  // The portrait frames are already vertical, so the phone fills with "cover"
  // (no blurred bands, no landscape-clip look). Desktop stays "cover" too.
  const fitMode = "cover";
  const shouldUseStaticFallback = reducedMotion;
  // Mobile and desktop are independent sequences with their own frame counts;
  // both play full-length, mapped across the same scroll progress.
  const frameCount = isMobile
    ? COCKPIT_MOBILE_PORTRAIT_FRAME_COUNT
    : COCKPIT_FRAME_COUNT;
  const sequenceStartFrame = 1;
  const sequenceEndFrame = frameCount;
  const frameStep = isMobile ? 2 : 4;
  const getFrameSrc = isMobile
    ? getCockpitMobilePortraitFrameSrc
    : getCockpitFrameSrc;
  // Scroll progress is written here every frame and read by the canvas rAF
  // loop, so the cockpit sequence never drives a React re-render.
  const frameIndexRef = useRef(sequenceStartFrame);
  const [hasEntered, setHasEntered] = useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const cueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const acquireOpacity = useTransform(
    scrollYProgress,
    [0.82, 0.9, 1],
    [0, 1, 1],
  );
  const { getNearestLoadedFrame, preloadFrameWindow } = useImagePreloader({
    frameCount,
    getFrameSrc,
    enabled: !shouldUseStaticFallback,
    batchSize: isMobile ? 2 : 3,
    frameStep,
    maxLoadedFrames: isMobile ? 72 : 72,
    preloadDelayMs: isMobile ? 80 : 96,
    startFrame: sequenceStartFrame,
    endFrame: sequenceEndFrame,
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (shouldUseStaticFallback) {
      return;
    }

    const sequenceProgress = Math.min(progress / 0.86, 1);
    const availableFrames = sequenceEndFrame - sequenceStartFrame;
    const rawFrame =
      Math.round(sequenceProgress * availableFrames) + sequenceStartFrame;
    const nextFrame = clamp(
      rawFrame,
      sequenceStartFrame,
      sequenceEndFrame,
    );
    frameIndexRef.current = nextFrame;
    preloadFrameWindow(nextFrame, isMobile ? 8 : 16);

    if (!hasEntered && progress > 0.02) {
      setHasEntered(true);
    }
  });

  useEffect(() => {
    frameIndexRef.current = sequenceStartFrame;
  }, [sequenceStartFrame]);

  if (shouldUseStaticFallback) {
    return (
      <section className="static-hero" id="top" ref={sectionRef}>
        {/* prefers-reduced-motion: one representative frame, no scrub, on every
            viewport. The lightweight mobile asset is plenty for a still image. */}
        <img
          src={getCockpitMobileFrameSrc(MOBILE_STATIC_FRAME)}
          alt="Futuristic cockpit overlooking a cyber city"
        />
        <HeroOverlay acquireOpacity={1} hideScrollCue minimal={isMobile} />
      </section>
    );
  }

  return (
    <section className="cockpit-hero" id="top" ref={sectionRef}>
      <motion.div className="sticky-viewport">
        <CockpitCanvasSequence
          frameIndexRef={frameIndexRef}
          frameCount={frameCount}
          getNearestLoadedFrame={getNearestLoadedFrame}
          maxDevicePixelRatio={isMobile ? 1 : 1.5}
          minDevicePixelRatio={isMobile ? 1 : 0.65}
          maxCanvasPixels={isMobile ? 1_000_000 : 2_000_000}
          fitMode={fitMode}
        />
        <HeroOverlay
          acquireOpacity={acquireOpacity}
          cueOpacity={cueOpacity}
          hideScrollCue={isMobile || hasEntered}
          minimal={isMobile}
        />
      </motion.div>
    </section>
  );
}
