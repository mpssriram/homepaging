import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useImagePreloader } from "../../hooks/useImagePreloader";
import { useMobileViewport } from "../../hooks/useMobileViewport";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { DevLoader } from "../ui/DevLoader";
import {
  clamp,
  COCKPIT_FRAME_COUNT,
  COCKPIT_MOBILE_FRAME_COUNT,
  getCockpitFrameSrc,
  getCockpitMobileFrameSrc,
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
  const shouldUseStaticFallback = reducedMotion;
  // Mobile and desktop are independent sequences with their own frame counts;
  // both play full-length, mapped across the same scroll progress.
  const frameCount = isMobileViewport
    ? COCKPIT_MOBILE_FRAME_COUNT
    : COCKPIT_FRAME_COUNT;
  const sequenceStartFrame = 1;
  const sequenceEndFrame = frameCount;
  const frameStep = 2;
  const getFrameSrc = isMobileViewport
    ? getCockpitMobileFrameSrc
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
  const { isInitialFrameReady, getNearestLoadedFrame } = useImagePreloader({
    frameCount,
    getFrameSrc,
    enabled: !shouldUseStaticFallback,
    batchSize: isMobileViewport ? 2 : 4,
    frameStep,
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
    frameIndexRef.current = clamp(
      rawFrame,
      sequenceStartFrame,
      sequenceEndFrame,
    );

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
        <HeroOverlay acquireOpacity={1} hideScrollCue minimal={isMobileViewport} />
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
          maxDevicePixelRatio={isMobileViewport ? 1 : 1.5}
          fitMode={isMobileViewport ? "contain" : "cover"}
        />
        <motion.div
          className="canvas-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: isInitialFrameReady ? 0 : 1 }}
          transition={{ duration: 0.35 }}
        >
          <DevLoader label="Loading cockpit sequence..." />
        </motion.div>
        <HeroOverlay
          acquireOpacity={acquireOpacity}
          cueOpacity={cueOpacity}
          hideScrollCue={isMobileViewport || hasEntered}
          minimal={isMobileViewport}
        />
      </motion.div>
    </section>
  );
}
