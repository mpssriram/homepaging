import type { ReactNode } from "react";
import { useRef, useState } from "react";
import "./magnet.css";

type MagnetProps = {
  children: ReactNode;
  className?: string;
  padding?: number;
  magnetStrength?: number;
};

export function Magnet({
  children,
  className,
  padding = 80,
  magnetStrength = 2.2,
}: MagnetProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState("translate3d(0, 0, 0)");

  const reset = () => setTransform("translate3d(0, 0, 0)");

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const expanded = {
      left: rect.left - padding,
      top: rect.top - padding,
      right: rect.right + padding,
      bottom: rect.bottom + padding,
    };

    if (
      event.clientX < expanded.left ||
      event.clientX > expanded.right ||
      event.clientY < expanded.top ||
      event.clientY > expanded.bottom
    ) {
      reset();
      return;
    }

    const offsetX = (event.clientX - (rect.left + rect.width / 2)) / magnetStrength;
    const offsetY = (event.clientY - (rect.top + rect.height / 2)) / magnetStrength;

    setTransform(`translate3d(${offsetX}px, ${offsetY}px, 0)`);
  };

  return (
    <div
      className={`dev-magnet${className ? ` ${className}` : ""}`}
      onPointerLeave={reset}
      onPointerMove={handlePointerMove}
      ref={ref}
    >
      <div className="dev-magnet__inner" style={{ transform }}>
        {children}
      </div>
    </div>
  );
}
