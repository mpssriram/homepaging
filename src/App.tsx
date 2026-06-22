import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiteBackground, type SiteBackgroundVariant } from "./components/backgrounds/SiteBackground";
import { ClubRouteTransition, type RouteTransitionCue } from "./components/ui/ClubRouteTransition";
import { ScrollProgress } from "./components/ui/ScrollProgress";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { CommunityPage } from "./pages/CommunityPage";
import { EventsPage } from "./pages/EventsPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { TeamPage } from "./pages/TeamPage";

const pageTitles: Record<string, string> = {
  "/": "Dev Cell Club",
  "/about": "About | Dev Cell Club",
  "/community": "Community | Dev Cell Club",
  "/team": "Team | Dev Cell Club",
  "/events": "Events | Dev Cell Club",
  "/projects": "Projects | Dev Cell Club",
};

type RouteState = {
  pathname: string;
  hash: string;
};

function readRoute(): RouteState {
  return {
    pathname: window.location.pathname.replace(/\/+$/, "") || "/",
    hash: window.location.hash,
  };
}

function readSameOriginReferrerPathname() {
  if (!document.referrer) {
    return null;
  }

  try {
    const referrerUrl = new URL(document.referrer);

    if (referrerUrl.origin !== window.location.origin) {
      return null;
    }

    return referrerUrl.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return null;
  }
}

export function App() {
  const reducedMotion = useReducedMotion();
  const [route, setRoute] = useState(readRoute);
  const [routeTransition, setRouteTransition] =
    useState<RouteTransitionCue | null>(null);
  const previousPathnameRef = useRef(route.pathname);
  const routeTransitionIdRef = useRef(0);

  const completeRouteTransition = useCallback((id: number) => {
    setRouteTransition((current) => (current?.id === id ? null : current));
  }, []);

  const beginRouteTransition = useCallback(
    (pathname: string) => {
      if (previousPathnameRef.current === pathname) {
        return;
      }

      previousPathnameRef.current = pathname;
      const transitionId = routeTransitionIdRef.current + 1;
      routeTransitionIdRef.current = transitionId;
      setRouteTransition({
        id: transitionId,
        pathname,
      });
    },
    [],
  );

  const syncRoute = useCallback(() => {
    const nextRoute = readRoute();

    beginRouteTransition(nextRoute.pathname);
    setRoute(nextRoute);
  }, [beginRouteTransition]);

  const handleNavigationClick = useCallback(
    (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target =
        event.target instanceof Element
          ? event.target
          : event.target instanceof Node
            ? event.target.parentElement
            : null;

      if (!target) {
        return;
      }

      const anchor = target.closest("a");

      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const href = anchor.getAttribute("href");

      if (
        !href ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("http://") ||
        href.startsWith("https://")
      ) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.origin);

      if (nextUrl.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();

      const nextPathname =
        nextUrl.pathname.replace(/\/+$/, "") || "/";
      const nextHash = nextUrl.hash;
      const nextRoute = `${nextPathname}${nextHash}`;
      const currentPathname =
        window.location.pathname.replace(/\/+$/, "") || "/";
      const currentRoute = `${currentPathname}${window.location.hash}`;

      if (nextRoute !== currentRoute) {
        if (nextPathname !== currentPathname) {
          beginRouteTransition(nextPathname);
        }

        window.history.pushState({}, "", nextRoute);
      }

      syncRoute();
    },
    [beginRouteTransition, syncRoute],
  );

  useEffect(() => {
    const syncScrollbarCompensation = () => {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty(
        "--scrollbar-compensation",
        `${Math.max(scrollbarWidth, 0)}px`,
      );
    };

    window.history.scrollRestoration = "manual";
    syncRoute();
    syncScrollbarCompensation();
    window.addEventListener("popstate", syncRoute);
    window.addEventListener("resize", syncScrollbarCompensation);
    window.addEventListener("click", handleNavigationClick, true);
    document.addEventListener("click", handleNavigationClick, true);

    return () => {
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener("resize", syncScrollbarCompensation);
      window.removeEventListener("click", handleNavigationClick, true);
      document.removeEventListener("click", handleNavigationClick, true);
    };
  }, [handleNavigationClick, syncRoute]);

  useEffect(() => {
    if (!routeTransition) {
      return;
    }

    const timeout = window.setTimeout(
      () => {
        completeRouteTransition(routeTransition.id);
      },
      reducedMotion ? 320 : 940,
    );

    return () => window.clearTimeout(timeout);
  }, [completeRouteTransition, reducedMotion, routeTransition]);

  useEffect(() => {
    const referrerPathname = readSameOriginReferrerPathname();
    const currentPathname = readRoute().pathname;

    if (!referrerPathname || referrerPathname === currentPathname) {
      return;
    }

    previousPathnameRef.current = referrerPathname;
    beginRouteTransition(currentPathname);
  }, [beginRouteTransition]);

  useEffect(() => {
    document.title =
      pageTitles[route.pathname] ?? "Page not found | Dev Cell Club";
  }, [route.pathname]);

  useEffect(() => {
    if (route.hash) {
      window.requestAnimationFrame(() => {
        const targetId = route.hash.slice(1);
        const element = document.getElementById(targetId);

        if (element) {
          element.scrollIntoView({ block: "start" });
        } else {
          window.scrollTo(0, 0);
        }
      });

      return;
    }

    window.scrollTo(0, 0);
  }, [route.hash, route.pathname]);

  return (
    <div>
      <SiteBackground
        afterCockpit={route.pathname === "/"}
        variant={getBackgroundVariant(route.pathname)}
      />
      <ScrollProgress />
      <ClubRouteTransition cue={routeTransition} />
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "brightness(1) saturate(1)",
          }}
          className="relative z-[1]"
          exit={{
            opacity: reducedMotion ? 1 : 0,
            y: reducedMotion ? 0 : -14,
            scale: reducedMotion ? 1 : 1.012,
            filter: reducedMotion
              ? "brightness(1) saturate(1)"
              : "brightness(0.74) saturate(0.82)",
          }}
          initial={{
            opacity: reducedMotion ? 1 : 0,
            y: reducedMotion ? 0 : 18,
            scale: reducedMotion ? 1 : 0.985,
            filter: reducedMotion
              ? "brightness(1) saturate(1)"
              : "brightness(0.82) saturate(0.88)",
          }}
          key={route.pathname}
          style={{ transformOrigin: "50% 38%" }}
          transition={{
            duration: reducedMotion ? 0 : 0.34,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {renderPage(route.pathname)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function renderPage(pathname: string) {
  switch (pathname) {
    case "/":
      return <HomePage />;
    case "/about":
    case "/community":
      return <CommunityPage />;
    case "/team":
      return <TeamPage />;
    case "/events":
      return <EventsPage />;
    case "/projects":
      return <ProjectsPage />;
    default:
      return <NotFoundPage />;
  }
}

function getBackgroundVariant(pathname: string): SiteBackgroundVariant {
  switch (pathname) {
    case "/about":
    case "/community":
      return "community";
    case "/team":
      return "team";
    case "/events":
      return "events";
    case "/projects":
      return "projects";
    default:
      return "home";
  }
}
