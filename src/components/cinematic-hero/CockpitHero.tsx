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
  getCockpitFrameSrc,
  getCockpitMobileFrameSrc,
} from "../../lib/cinematicSequence";
import { CockpitCanvasSequence } from "./CockpitCanvasSequence";
import { HeroOverlay } from "./HeroOverlay";

const MOBILE_SEQUENCE_START_FRAME = 160;
const MOBILE_SEQUENCE_END_FRAME = 200;

// Mobile uses art-directed cover instead of letterboxed "contain": the wide
// 16:9 frame fills the portrait stage, cropping the outer struts while the
// centered avenue/horizon/dashboard survive. focalX centered keeps the scene
// symmetrical; tune zoom (1.05-1.20) to push into the city and focalY (~0.42)
// to favor the horizon. Desktop keeps a plain centered cover (no override).
const MOBILE_FRAMING = { focalX: 0.5, focalY: 0.5, zoom: 1.0 };

export function CockpitHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isMobileViewport = useMobileViewport();
  const shouldUseStaticFallback = reducedMotion;
  const sequenceStartFrame = isMobileViewport ? MOBILE_SEQUENCE_START_FRAME : 1;
  const sequenceEndFrame = isMobileViewport
    ? MOBILE_SEQUENCE_END_FRAME
    : COCKPIT_FRAME_COUNT;
  const frameStep = isMobileViewport ? 6 : 2;
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
    frameCount: COCKPIT_FRAME_COUNT,
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
          src={getCockpitMobileFrameSrc(MOBILE_SEQUENCE_START_FRAME)}
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
          frameCount={COCKPIT_FRAME_COUNT}
          getNearestLoadedFrame={getNearestLoadedFrame}
          maxDevicePixelRatio={isMobileViewport ? 1 : 1.5}
          fitMode="cover"
          framing={isMobileViewport ? MOBILE_FRAMING : undefined}
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
