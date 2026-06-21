import { useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { RefObject } from "react";
import { useReducedMotion } from "./useReducedMotion";

// Subtle scroll-linked drift for purely decorative layers. Attach `ref` to the
// section the layer lives in; `y` drifts a few px slower/faster than the
// content as that section crosses the viewport, then no-ops under
// prefers-reduced-motion.
export function useParallax(distance = 32) {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref as RefObject<HTMLElement>,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [-distance, distance],
  );

  return { ref, y };
}

// Same idea, but for the common case of two decorative layers in one section
// (e.g. a grid-line strip + a border frame) drifting at two different speeds
// off a single shared scroll range.
export function useParallaxPair(distanceA = 24, distanceB = 44) {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref as RefObject<HTMLElement>,
    offset: ["start end", "end start"],
  });
  const yA = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [-distanceA, distanceA],
  );
  const yB = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [-distanceB, distanceB],
  );

  return { ref, yA, yB };
}
