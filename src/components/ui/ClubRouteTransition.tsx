import type { CSSProperties } from "react";
import "./club-route-transition.css";

export type RouteTransitionCue = {
  id: number;
  pathname: string;
};

type ClubRouteTransitionProps = {
  cue: RouteTransitionCue | null;
};

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/about": "Community",
  "/community": "Community",
  "/team": "Team",
  "/events": "Events",
  "/projects": "Projects",
};

export function ClubRouteTransition({ cue }: ClubRouteTransitionProps) {
  const label = cue ? routeLabels[cue.pathname] ?? "Dev Cell" : "";

  if (!cue) {
    return null;
  }

  return (
    <div aria-hidden="true" className="club-route-transition" key={cue.id}>
      <div className="club-route-transition__veil" />
      <div className="club-route-transition__matrix" />
      <div className="club-route-transition__desktop" data-route={label}>
        <span className="club-route-transition__shutter club-route-transition__shutter--left" />
        <span className="club-route-transition__shutter club-route-transition__shutter--right" />
        <span className="club-route-transition__blade club-route-transition__blade--red" />
        <span className="club-route-transition__blade club-route-transition__blade--cyan" />
        <span className="club-route-transition__aperture" />
      </div>
      <div className="club-route-transition__mobile" data-route={label}>
        {Array.from({ length: 6 }, (_, index) => (
          <span
            className="club-route-transition__mobile-shutter"
            key={index}
            style={{ "--shutter-index": index } as CSSProperties}
          />
        ))}
      </div>
      <div className="club-route-transition__capsule">
        <span className="club-route-transition__scan" />
        <span className="club-route-transition__kicker">Dev Cell Club</span>
        <strong>{label}</strong>
        <span className="club-route-transition__hint">portal route swap</span>
      </div>
    </div>
  );
}
