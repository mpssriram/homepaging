import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import "./loading-system.css";

type Accent = "cyan" | "red";

type LoaderMarkProps = {
  variant?: Accent;
  size?: "sm" | "md" | "lg";
};

export function LoaderMark({ variant = "cyan", size = "md" }: LoaderMarkProps) {
  return (
    <div
      className={`loader-mark loader-mark--${variant} loader-mark--${size}`}
      aria-hidden="true"
    >
      <span className="loader-mark__orb" />
      <span className="loader-mark__step loader-mark__step--one" />
      <span className="loader-mark__step loader-mark__step--two" />
      <span className="loader-mark__step loader-mark__step--three" />
      <span className="loader-mark__step loader-mark__step--four" />
    </div>
  );
}

type ScanLineProps = {
  variant?: Accent;
  direction?: "horizontal" | "vertical";
};

export function ScanLine({
  variant = "cyan",
  direction = "horizontal",
}: ScanLineProps) {
  return (
    <span
      className={`scan-line scan-line--${variant} scan-line--${direction}`}
      aria-hidden="true"
    />
  );
}

type HudFrameProps = {
  children: ReactNode;
  variant?: Accent;
  className?: string;
};

export function HudFrame({
  children,
  variant = "cyan",
  className = "",
}: HudFrameProps) {
  return (
    <div className={`hud-frame hud-frame--${variant} ${className}`}>
      <span className="hud-frame__corner hud-frame__corner--tl" />
      <span className="hud-frame__corner hud-frame__corner--tr" />
      <span className="hud-frame__corner hud-frame__corner--bl" />
      <span className="hud-frame__corner hud-frame__corner--br" />
      {children}
    </div>
  );
}

type BootStatusPanelProps = {
  label?: string;
  detail?: string;
  variant?: Accent;
  compact?: boolean;
};

export function BootStatusPanel({
  label = "Initializing Dev Cell",
  detail = "Loading cockpit sequence",
  variant = "cyan",
  compact = false,
}: BootStatusPanelProps) {
  return (
    <div
      className={`boot-status-panel boot-status-panel--${variant}${
        compact ? " boot-status-panel--compact" : ""
      }`}
      role="status"
      aria-live="polite"
    >
      <ScanLine variant={variant} />
      <div className="boot-status-panel__grid" aria-hidden="true" />
      <HudFrame variant={variant} className="boot-status-panel__frame">
        <div className="boot-status-panel__chrome">
          <span>Dev Cell</span>
          <span>Boot sequence</span>
        </div>
        <div className="boot-status-panel__body">
          <LoaderMark variant={variant} size={compact ? "md" : "lg"} />
          <div className="boot-status-panel__copy">
            <p className="boot-status-panel__eyebrow">System online</p>
            <p className="boot-status-panel__label">{label}</p>
            <p className="boot-status-panel__detail">{detail}</p>
          </div>
        </div>
        <div className="boot-status-panel__meter" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </HudFrame>
    </div>
  );
}

type RouteTransitionOverlayProps = {
  transition: {
    id: number;
    pathname: string;
  } | null;
};

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/about": "Community",
  "/community": "Community",
  "/team": "Team",
  "/events": "Events",
  "/projects": "Projects",
};

export function RouteTransitionOverlay({
  transition,
}: RouteTransitionOverlayProps) {
  const reducedMotion = useReducedMotion();
  const [dismissedTransitionId, setDismissedTransitionId] =
    useState<number | null>(null);

  useEffect(() => {
    if (!transition) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => setDismissedTransitionId(transition.id),
      reducedMotion ? 220 : 520,
    );

    return () => window.clearTimeout(timeoutId);
  }, [transition, reducedMotion]);

  const isVisible =
    transition !== null && dismissedTransitionId !== transition.id;
  const routeLabel = transition
    ? routeLabels[transition.pathname] ?? "Page"
    : null;

  return (
    <AnimatePresence>
      {isVisible && routeLabel ? (
        <motion.div
          key={transition.id}
          className="route-transition-overlay"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.08 : 0.16 }}
        >
          <RouteSweep
            label={routeLabel}
            reducedMotion={reducedMotion}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type RouteSweepProps = {
  label: string;
  reducedMotion: boolean;
};

function RouteSweep({ label, reducedMotion }: RouteSweepProps) {
  return (
    <motion.div
      className="route-sweep"
      initial={
        reducedMotion
          ? { opacity: 0.82 }
          : { clipPath: "inset(0 100% 0 0)", opacity: 1 }
      }
      animate={
        reducedMotion
          ? { opacity: [0.72, 0.42, 0] }
          : { clipPath: "inset(0 0% 0 0)", opacity: [1, 1, 0] }
      }
      transition={{
        duration: reducedMotion ? 0.2 : 0.48,
        ease: [0.16, 1, 0.3, 1],
        times: reducedMotion ? undefined : [0, 0.7, 1],
      }}
    >
      <ScanLine variant="red" />
      <div className="route-sweep__band">
        <span className="route-sweep__kicker">Routing</span>
        <span className="route-sweep__label">{label}</span>
      </div>
      <span className="route-sweep__pulse route-sweep__pulse--cyan" />
      <span className="route-sweep__pulse route-sweep__pulse--red" />
    </motion.div>
  );
}
