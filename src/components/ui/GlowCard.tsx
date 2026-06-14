import { useRef, type MouseEvent, type ReactNode } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

type GlowCardProps = {
  children: ReactNode;
  className?: string;
  /** rgba string of the glow color, e.g. "102, 231, 255" */
  glowColor?: string;
  /** how big the spotlight is, in px */
  glowSize?: number;
  /** max alpha of the spotlight */
  glowOpacity?: number;
};

export function GlowCard({
  children,
  className,
  glowColor = "119, 231, 255",
  glowSize = 380,
  glowOpacity = 0.22,
}: GlowCardProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    node.style.setProperty("--glow-x", `${x}px`);
    node.style.setProperty("--glow-y", `${y}px`);
    node.style.setProperty("--glow-opacity", String(glowOpacity));
  };

  const handleMouseLeave = () => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--glow-opacity", "0");
  };

  return (
    <div
      ref={ref}
      className={className ? `glow-card ${className}` : "glow-card"}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        // CSS custom props consumed by .glow-card::before in legacy.css
        ["--glow-color" as string]: glowColor,
        ["--glow-size" as string]: `${glowSize}px`,
        ["--glow-opacity" as string]: "0",
        transition: "--glow-opacity 220ms ease",
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
