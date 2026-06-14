import { motion, useScroll, useSpring } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

type ScrollProgressProps = {
  /** color of the progress bar */
  color?: string;
  /** height in px */
  height?: number;
  /** z-index */
  zIndex?: number;
};

/**
 * Thin progress bar fixed to the top of the viewport that fills
 * as the user scrolls the entire page. Uses framer-motion's
 * useScroll + useSpring for a smoothed scaleX transform.
 */
export function ScrollProgress({
  color = "#66e7ff",
  height = 2,
  zIndex = 100,
}: ScrollProgressProps) {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 30,
    restDelta: 0.001,
  });

  if (reducedMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        scaleX,
        transformOrigin: "0% 50%",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: `${height}px`,
        background: `linear-gradient(90deg, ${color}, #ff637c)`,
        boxShadow: `0 0 12px ${color}66`,
        zIndex,
        pointerEvents: "none",
      }}
    />
  );
}
