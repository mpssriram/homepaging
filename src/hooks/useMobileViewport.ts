import { useEffect, useState } from "react";

const DEFAULT_MOBILE_MAX_WIDTH = 640;

// Optional maxWidth lets callers opt into a different breakpoint without
// affecting others (e.g. the cockpit hero uses 768px for its frame selection,
// while the navbar keeps the default 640px).
export function useMobileViewport(maxWidth: number = DEFAULT_MOBILE_MAX_WIDTH) {
  const query = `(max-width: ${maxWidth}px)`;
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const update = () => setIsMobileViewport(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, [query]);

  return isMobileViewport;
}
