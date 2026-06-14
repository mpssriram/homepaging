import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import LightRays from "../react-bits/LightRays/LightRays";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import "./site-background.css";

export type SiteBackgroundVariant =
  | "home"
  | "community"
  | "team"
  | "events"
  | "projects"
  | "challenges"
  | "join";

type SiteBackgroundProps = {
  afterCockpit?: boolean;
  variant: SiteBackgroundVariant;
};

const accentByVariant: Record<SiteBackgroundVariant, string> = {
  home: "#8beaff",
  community: "#ff3b6b",
  team: "#8beaff",
  events: "#a594ff",
  projects: "#f06bff",
  challenges: "#ffb547",
  join: "#8beaff",
};

const HOME_RAYS_SCROLL_START = 0.4;
const HOME_RAYS_SCROLL_END = 1;
const MAX_RAYS_OPACITY = 0.35;

export function SiteBackground({
  afterCockpit = false,
  variant,
}: SiteBackgroundProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const crewRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const accent = accentByVariant[variant];
  const [hudTime, setHudTime] = useState(() => getHudTime());

  const lightRaysProps = useMemo(
    () => ({
      fadeDistance: 1.1,
      followMouse: !reducedMotion,
      lightSpread: 1.2,
      mouseInfluence: 0.06,
      noiseAmount: 0,
      pulsating: false,
      rayLength: 1.9,
      raysColor: accent,
      raysOrigin: "top-center" as const,
      raysSpeed: reducedMotion ? 0 : 0.6,
      saturation: 1,
      distortion: 0,
    }),
    [accent, reducedMotion],
  );

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    let frame = 0;

    const handlePointerMove = (event: PointerEvent) => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const cursor = cursorRef.current;

        if (cursor) {
          cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
        }
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const interval = window.setInterval(() => setHudTime(getHudTime()), 30000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    let frame = 0;

    const handlePointerMove = (event: PointerEvent) => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const crew = crewRef.current;

        if (crew) {
          crew.style.setProperty("--crew-x", `${event.clientX}px`);
          crew.style.setProperty("--crew-y", `${event.clientY}px`);
        }
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || !afterCockpit) {
      return;
    }

    const updateOpacity = () => {
      const viewportHeight = Math.max(window.innerHeight, 1);
      const scrollDepth = window.scrollY / viewportHeight;
      const progress =
        (scrollDepth - HOME_RAYS_SCROLL_START) /
        (HOME_RAYS_SCROLL_END - HOME_RAYS_SCROLL_START);
      const opacity = Math.max(0, Math.min(progress, 1)) * MAX_RAYS_OPACITY;

      root.style.setProperty("--site-rays-opacity", opacity.toFixed(3));
    };

    updateOpacity();
    window.addEventListener("scroll", updateOpacity, { passive: true });
    window.addEventListener("resize", updateOpacity);

    return () => {
      window.removeEventListener("scroll", updateOpacity);
      window.removeEventListener("resize", updateOpacity);
    };
  }, [afterCockpit]);

  return (
    <div
      aria-hidden="true"
      className={`site-background site-background--${variant}${
        afterCockpit ? " site-background--after-cockpit" : ""
      }`}
      ref={rootRef}
    >
      <div className="site-background__base" />
      <div className="site-background__rays" data-home-layer="">
        <LightRays
          className="site-background__rays-canvas"
          {...lightRaysProps}
        />
      </div>
      <div className="site-background__grid" data-shared-layer="" />
      <div className="site-background__variant site-background__variant--community">
        <SignalCluster />
      </div>
      <div
        className="site-background__variant site-background__variant--team"
        ref={crewRef}
      >
        <CrewConsole />
      </div>
      <div className="site-background__variant site-background__variant--events">
        <TimeStream />
      </div>
      <div className="site-background__variant site-background__variant--projects">
        <SchematicLab />
      </div>
      <HudOverlay hudTime={hudTime} variant={variant} />
      <div className="site-background__cursor" ref={cursorRef} />
      <div className="site-background__grain" />
      <div className="site-background__vignette" />
    </div>
  );
}

function SignalCluster() {
  const links = [
    ["14%", "32%", "9%", "18deg"],
    ["22%", "40%", "7%", "-22deg"],
    ["60%", "28%", "11%", "8deg"],
    ["68%", "60%", "8%", "-32deg"],
  ];
  const nodes = [
    ["14%", "32%", "0s"],
    ["60%", "28%", "1.5s"],
    ["82%", "48%", "2.8s"],
    ["28%", "78%", "0.4s"],
    ["68%", "60%", "0.7s"],
  ];
  const satellites = [
    ["23%", "40%"],
    ["31%", "35%"],
    ["71%", "32%"],
    ["76%", "55%"],
    ["50%", "48%"],
    ["42%", "70%"],
    ["64%", "78%"],
  ];

  return (
    <div className="site-background__signal-cluster">
      {links.map(([left, top, width, rotate]) => (
        <span
          className="site-background__signal-link"
          key={`${left}-${top}`}
          style={{ left, top, width, transform: `rotate(${rotate})` }}
        />
      ))}
      {nodes.map(([left, top, delay]) => (
        <span
          className="site-background__signal-node"
          key={`${left}-${top}`}
          style={{ left, top, "--pulse-delay": delay } as CSSProperties}
        />
      ))}
      {satellites.map(([left, top]) => (
        <span
          className="site-background__signal-satellite"
          key={`${left}-${top}`}
          style={{ left, top }}
        />
      ))}
      <span className="site-background__scan" />
    </div>
  );
}

function CrewConsole() {
  return (
    <div className="site-background__crew-console">
      <div className="site-background__crew-drift-grid" />
      <div className="site-background__crew-glow" />
      <div className="site-background__crew-ring" />
      <div className="site-background__crew-reticule" />
      <div className="site-background__crew-data-strip" />
      <span className="site-background__scan" />
    </div>
  );
}

function TimeStream() {
  const columns = ["12%", "22%", "32%", "42%", "52%", "62%", "72%", "82%"];

  return (
    <div className="site-background__time-stream">
      {columns.map((left, index) => (
        <span
          className="site-background__time-column"
          key={left}
          style={
            {
              left,
              "--pulse-delay": `${(index * 0.55).toFixed(2)}s`,
            } as CSSProperties
          }
        />
      ))}
      <span className="site-background__now-line" />
      <div className="site-background__day-marks">
        <span>MON</span>
        <span>TUE</span>
        <span>WED</span>
        <span>THU</span>
        <span>FRI</span>
        <span>SAT</span>
      </div>
    </div>
  );
}

function SchematicLab() {
  const junctions = [
    ["22%", "46%"],
    ["38%", "46%"],
    ["60%", "46%"],
    ["78%", "46%"],
  ];

  return (
    <div className="site-background__schematic">
      <div className="site-background__perspective-grid" />
      <div className="site-background__schematic-glow" />
      <span className="site-background__axis site-background__axis--h" />
      <span className="site-background__blueprint-strip" />
      {junctions.map(([left, top]) => (
        <span
          className="site-background__junction"
          key={`${left}-${top}`}
          style={{ left, top }}
        />
      ))}
    </div>
  );
}

function HudOverlay({
  hudTime,
  variant,
}: {
  hudTime: string;
  variant: SiteBackgroundVariant;
}) {
  const label = variant === "home" ? "HOME" : variant.toUpperCase();

  return (
    <div className="site-background__hud" data-shared-layer="">
      <span className="site-background__hud-corner site-background__hud-corner--tl" />
      <span className="site-background__hud-corner site-background__hud-corner--tr" />
      <span className="site-background__hud-corner site-background__hud-corner--bl" />
      <span className="site-background__hud-corner site-background__hud-corner--br" />
      <span className="site-background__coords site-background__coords--tl">
        <span>IIT MANDI / KAMAND</span>
        <span>NODE / ACTIVE</span>
      </span>
      <span className="site-background__coords site-background__coords--tr">
        <span>T / {hudTime}</span>
        <span>SIGNAL / OK</span>
      </span>
      <span className="site-background__coords site-background__coords--bl">
        <span>31.78 N</span>
        <span>76.99 E</span>
      </span>
      <span className="site-background__coords site-background__coords--br">
        <span>VAR / {label}</span>
        <span>FRAME / 01</span>
      </span>
    </div>
  );
}

function getHudTime() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  });
}
