import { useRef, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

type TiltedCardProps = {
  children: ReactNode;
  className?: string;
  /** max rotation in degrees */
  maxTilt?: number;
  /** spotlight glow opacity 0-1 */
  glowOpacity?: number;
  /** 0-1 — higher = follows cursor faster */
  springStiffness?: number;
};

const DEFAULT_GLOW_COLOR = "102, 231, 255"; // cyan rgba

export function TiltedCard({
  children,
  className,
  maxTilt = 10,
  glowOpacity = 0.18,
  springStiffness = 220,
}: TiltedCardProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rotateX = useSpring(0, { stiffness: springStiffness, damping: 18 });
  const rotateY = useSpring(0, { stiffness: springStiffness, damping: 18 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowXPercent = useSpring(glowX, { stiffness: springStiffness, damping: 18 });
  const glowYPercent = useSpring(glowY, { stiffness: springStiffness, damping: 18 });
  const background = useMotionTemplate`radial-gradient(circle at ${glowXPercent}% ${glowYPercent}%, rgba(${DEFAULT_GLOW_COLOR}, ${glowOpacity}), transparent 60%)`;

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const node = containerRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width; // 0..1
    const y = (event.clientY - rect.top) / rect.height; // 0..1

    rotateX.set((0.5 - y) * maxTilt);
    rotateY.set((x - 0.5) * maxTilt);
    glowX.set(x * 100);
    glowY.set(y * 100);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glowX.set(50);
    glowY.set(50);
  };

  return (
    <motion.div
      ref={containerRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
        position: "relative",
        willChange: "transform",
      }}
    >
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background,
          pointerEvents: "none",
          opacity: 0.9,
          mixBlendMode: "screen",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </motion.div>
  );
}
