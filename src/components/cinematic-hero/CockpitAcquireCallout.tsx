import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";

type CockpitAcquireCalloutProps = {
  opacity?: MotionValue<number> | number;
};

export function CockpitAcquireCallout({
  opacity,
}: CockpitAcquireCalloutProps) {
  return (
    <motion.div
      aria-hidden="true"
      className="cockpit-acquire-callout"
      style={{ opacity }}
    >
      <span>DC-01 / ACQUIRED / TRACKING</span>
    </motion.div>
  );
}
