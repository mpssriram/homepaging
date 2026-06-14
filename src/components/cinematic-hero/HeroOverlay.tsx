import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { CockpitAcquireCallout } from "./CockpitAcquireCallout";
import { Navbar } from "./Navbar";
import { ScrollCue } from "./ScrollCue";

type HeroOverlayProps = {
  acquireOpacity?: MotionValue<number> | number;
  cueOpacity?: MotionValue<number>;
  overlayOpacity?: MotionValue<number>;
  hideScrollCue?: boolean;
};

export function HeroOverlay({
  acquireOpacity,
  cueOpacity,
  overlayOpacity,
  hideScrollCue = false,
}: HeroOverlayProps) {
  return (
    <motion.div className="hero-overlay" style={{ opacity: overlayOpacity }}>
      <Navbar />
      <div className="hero-vignette" aria-hidden="true" />
      <div className="hero-top-fade" aria-hidden="true" />
      <div className="hero-bottom-fade" aria-hidden="true" />
      <div className="hud-line hud-line-left" aria-hidden="true" />
      <div className="hud-line hud-line-right" aria-hidden="true" />
      <CockpitAcquireCallout opacity={acquireOpacity} />
      {!hideScrollCue && <ScrollCue opacity={cueOpacity} />}
    </motion.div>
  );
}
