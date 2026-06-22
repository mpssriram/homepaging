import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
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
  const reducedMotion = useReducedMotion();
  const label = cue ? routeLabels[cue.pathname] ?? "Dev Cell" : "";

  return (
    <AnimatePresence>
      {cue ? (
        <motion.div
          key={cue.id}
          aria-hidden="true"
          className="club-route-transition"
          initial={{ opacity: 0 }}
          animate={
            reducedMotion
              ? { opacity: [0, 0.34, 0] }
              : { opacity: [0, 1, 1, 0] }
          }
          exit={{ opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0.22 : 0.72,
            ease: [0.16, 1, 0.3, 1],
            times: reducedMotion ? [0, 0.45, 1] : [0, 0.12, 0.76, 1],
          }}
        >
          <div className="club-route-transition__wash" />
          <div className="club-route-transition__grid" />
          <div className="club-route-transition__desktop">
            <span className="club-route-transition__beam club-route-transition__beam--one" />
            <span className="club-route-transition__beam club-route-transition__beam--two" />
            <span className="club-route-transition__beam club-route-transition__beam--three" />
            <span className="club-route-transition__axis" />
          </div>
          <div className="club-route-transition__mobile">
            <span className="club-route-transition__mobile-strip club-route-transition__mobile-strip--one" />
            <span className="club-route-transition__mobile-strip club-route-transition__mobile-strip--two" />
            <span className="club-route-transition__mobile-strip club-route-transition__mobile-strip--three" />
            <span className="club-route-transition__mobile-strip club-route-transition__mobile-strip--four" />
            <span className="club-route-transition__mobile-strip club-route-transition__mobile-strip--five" />
          </div>
          <div className="club-route-transition__label">
            <span>Dev Cell Club</span>
            <strong>{label}</strong>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
