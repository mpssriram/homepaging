import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SiteBackground, type SiteBackgroundVariant } from "./components/backgrounds/SiteBackground";
import { ScrollProgress } from "./components/ui/ScrollProgress";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { CommunityPage } from "./pages/CommunityPage";
import { EventsPage } from "./pages/EventsPage";
import { HomePage } from "./pages/HomePage";
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

export function App() {
  const reducedMotion = useReducedMotion();
  const [route, setRoute] = useState(() => ({
    pathname: window.location.pathname.replace(/\/+$/, "") || "/",
    hash: window.location.hash,
  }));

  useEffect(() => {
    const syncRoute = () =>
      setRoute({
        pathname: window.location.pathname.replace(/\/+$/, "") || "/",
        hash: window.location.hash,
      });

    const syncScrollbarCompensation = () => {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty(
        "--scrollbar-compensation",
        `${Math.max(scrollbarWidth, 0)}px`,
      );
    };

    const handleNavigationClick = (event: MouseEvent) => {
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

      const target = event.target;

      if (!(target instanceof Element)) {
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
      const currentRoute = `${window.location.pathname.replace(/\/+$/, "") || "/"}${window.location.hash}`;

      if (nextRoute !== currentRoute) {
        window.history.pushState({}, "", nextRoute);
      }

      syncRoute();
    };

    window.history.scrollRestoration = "manual";
    syncRoute();
    syncScrollbarCompensation();
    window.addEventListener("popstate", syncRoute);
    window.addEventListener("resize", syncScrollbarCompensation);
    document.addEventListener("click", handleNavigationClick);

    return () => {
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener("resize", syncScrollbarCompensation);
      document.removeEventListener("click", handleNavigationClick);
    };
  }, []);

  useEffect(() => {
    document.title = pageTitles[route.pathname] ?? "Dev Cell Club";
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
    <>
      <SiteBackground
        afterCockpit={route.pathname === "/"}
        variant={getBackgroundVariant(route.pathname)}
      />
      <ScrollProgress />
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          className="relative z-[1]"
          exit={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 18, filter: reducedMotion ? "blur(0px)" : "blur(6px)" }}
          initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 18, filter: reducedMotion ? "blur(0px)" : "blur(6px)" }}
          key={route.pathname}
          transition={{
            duration: reducedMotion ? 0 : 0.34,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {renderPage(route.pathname)}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function renderPage(pathname: string) {
  switch (pathname) {
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
      return <HomePage />;
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
