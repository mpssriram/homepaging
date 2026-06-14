import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useImagePreloader } from "../../hooks/useImagePreloader";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { DevLoader } from "../ui/DevLoader";
import {
  clamp,
  COCKPIT_FRAME_COUNT,
  getCockpitFrameSrc,
} from "../../lib/cinematicSequence";
import { CockpitCanvasSequence } from "./CockpitCanvasSequence";
import { HeroOverlay } from "./HeroOverlay";

const MOBILE_MAX_WIDTH_QUERY = "(max-width: 640px)";
const MOBILE_SEQUENCE_START_FRAME = 160;
const MOBILE_SEQUENCE_END_FRAME = 200;

function useMobileViewport() {
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia(MOBILE_MAX_WIDTH_QUERY).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MAX_WIDTH_QUERY);
    const update = () => setIsMobileViewport(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isMobileViewport;
}

export function CockpitHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [frameIndex, setFrameIndex] = useState(1);
  const reducedMotion = useReducedMotion();
  const isMobileViewport = useMobileViewport();
  const shouldUseStaticFallback = reducedMotion;
  const sequenceStartFrame = isMobileViewport ? MOBILE_SEQUENCE_START_FRAME : 1;
  const sequenceEndFrame = isMobileViewport
    ? MOBILE_SEQUENCE_END_FRAME
    : COCKPIT_FRAME_COUNT;
  const frameStep = isMobileViewport ? 6 : 2;
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
  const overlayOpacity = useTransform(
    scrollYProgress,
    [0, 1],
    [1, 1],
  );
  const { isInitialFrameReady, getNearestLoadedFrame } =
    useImagePreloader({
      frameCount: COCKPIT_FRAME_COUNT,
      getFrameSrc: getCockpitFrameSrc,
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
    const nextFrame = clamp(rawFrame, sequenceStartFrame, sequenceEndFrame);

    setFrameIndex((currentFrame) =>
      currentFrame === nextFrame ? currentFrame : nextFrame,
    );
  });

  useEffect(() => {
    setFrameIndex(sequenceStartFrame);
  }, [sequenceStartFrame]);

  if (shouldUseStaticFallback) {
    return (
      <section className="static-hero" id="top" ref={sectionRef}>
        <img
          src={getCockpitFrameSrc(MOBILE_SEQUENCE_START_FRAME)}
          alt="Futuristic cockpit overlooking a cyber city"
        />
        <HeroOverlay acquireOpacity={1} hideScrollCue />
      </section>
    );
  }

  return (
    <section className="cockpit-hero" id="top" ref={sectionRef}>
      <motion.div className="sticky-viewport">
        <CockpitCanvasSequence
          frameIndex={frameIndex}
          frameCount={COCKPIT_FRAME_COUNT}
          getNearestLoadedFrame={getNearestLoadedFrame}
          maxDevicePixelRatio={isMobileViewport ? 1 : 1.5}
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
          overlayOpacity={overlayOpacity}
          hideScrollCue={frameIndex > 4}
        />
      </motion.div>
    </section>
  );
}
