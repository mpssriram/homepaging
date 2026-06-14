import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";

type ScrollCueProps = {
  opacity?: MotionValue<number>;
};

export function ScrollCue({ opacity }: ScrollCueProps) {
  return (
    <motion.div className="scroll-cue" style={{ opacity }} aria-hidden="true">
      <span>Scroll to enter</span>
      <i>
        <motion.b
          animate={{ y: [0, 33, 0] }}
          transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
        />
      </i>
    </motion.div>
  );
}
