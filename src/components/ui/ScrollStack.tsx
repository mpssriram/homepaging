import type { CSSProperties, ReactNode } from "react";
import "./scroll-stack.css";

type ScrollStackProps = {
  children: ReactNode;
  className?: string;
};

type ScrollStackItemProps = {
  children: ReactNode;
  index: number;
};

export function ScrollStack({
  children,
  className,
}: ScrollStackProps) {
  return (
    <div className={`dev-scroll-stack${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}

export function ScrollStackItem({
  children,
  index,
}: ScrollStackItemProps) {
  return (
    <div
      className="dev-scroll-stack__item"
      style={
        {
          "--stack-index": index,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
