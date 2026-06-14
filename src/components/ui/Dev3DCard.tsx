import type { CSSProperties, MouseEvent, PointerEvent } from "react";
import { useRef } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import "./dev-3d-card.css";

export type Dev3DCardVariant = "cyan" | "red" | "blue";

export type Dev3DCardProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  badgeTop?: string;
  badgeMain?: string;
  href?: string;
  variant?: Dev3DCardVariant;
};

type InteractiveTarget = HTMLAnchorElement | HTMLDivElement;

export function Dev3DCard({
  title,
  description,
  ctaLabel,
  badgeTop,
  badgeMain,
  href,
  variant = "cyan",
}: Dev3DCardProps) {
  const reducedMotion = useReducedMotion();
  const interactiveRef = useRef<InteractiveTarget | null>(null);

  const setCardVars = (target: InteractiveTarget, x: number, y: number) => {
    target.style.setProperty("--dev-3d-pointer-x", `${x}%`);
    target.style.setProperty("--dev-3d-pointer-y", `${y}%`);
  };

  const resetCard = (target: InteractiveTarget) => {
    target.style.setProperty("--dev-3d-rotate-x", "0deg");
    target.style.setProperty("--dev-3d-rotate-y", "0deg");
    target.style.setProperty("--dev-3d-lift", "0px");
    setCardVars(target, 50, 50);
  };

  const handlePointerMove = (event: PointerEvent<InteractiveTarget>) => {
    if (reducedMotion) return;

    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const normalizedX = offsetX / rect.width;
    const normalizedY = offsetY / rect.height;
    const rotateY = (normalizedX - 0.5) * 18;
    const rotateX = (0.5 - normalizedY) * 16;

    target.style.setProperty("--dev-3d-rotate-x", `${rotateX.toFixed(2)}deg`);
    target.style.setProperty("--dev-3d-rotate-y", `${rotateY.toFixed(2)}deg`);
    target.style.setProperty("--dev-3d-lift", "-10px");
    setCardVars(target, normalizedX * 100, normalizedY * 100);
  };

  const handlePointerLeave = (event: MouseEvent<InteractiveTarget>) => {
    if (reducedMotion) return;
    resetCard(event.currentTarget);
  };

  const interactiveProps = reducedMotion
    ? {}
    : {
        onPointerMove: handlePointerMove,
        onMouseLeave: handlePointerLeave,
      };

  const interactiveClassName = "dev-3d-card-link";
  const content = (
    <>
      <article className={`dev-3d-card dev-3d-card--${variant}`}>
        <span aria-hidden="true" className="dev-3d-card-rim" />
        <span aria-hidden="true" className="dev-3d-card-grid" />
        <span aria-hidden="true" className="dev-3d-card-sheen" />
        <div className="dev-3d-card-content">
          <h3 className="dev-3d-card-title">{title}</h3>
          <p className="dev-3d-card-description">{description}</p>
          {ctaLabel ? <span className="dev-3d-card-cta">{ctaLabel}</span> : null}
        </div>
        {(badgeTop || badgeMain) && (
          <div
            aria-label={`${badgeTop ?? ""} ${badgeMain ?? ""}`}
            className="dev-3d-card-badge"
          >
            <span className="dev-3d-card-badge-top">{badgeTop}</span>
            <span className="dev-3d-card-badge-main">{badgeMain}</span>
          </div>
        )}
      </article>
      <span aria-hidden="true" className="dev-3d-card-floor" />
    </>
  );

  return (
    <div className="dev-3d-card-parent">
      {href ? (
        <a
          {...interactiveProps}
          className={interactiveClassName}
          href={href}
          ref={interactiveRef as React.RefObject<HTMLAnchorElement>}
          style={{ "--dev-3d-pointer-x": "50%", "--dev-3d-pointer-y": "50%" } as CSSProperties}
        >
          {content}
        </a>
      ) : (
        <div
          {...interactiveProps}
          className={interactiveClassName}
          ref={interactiveRef as React.RefObject<HTMLDivElement>}
          role="group"
          style={{ "--dev-3d-pointer-x": "50%", "--dev-3d-pointer-y": "50%" } as CSSProperties}
          tabIndex={0}
        >
          {content}
        </div>
      )}
    </div>
  );
}
