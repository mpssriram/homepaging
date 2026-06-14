import { useEffect, useState } from "react";

const MOBILE_MAX_WIDTH_QUERY = "(max-width: 640px)";

export function useMobileViewport() {
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia(MOBILE_MAX_WIDTH_QUERY).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MAX_WIDTH_QUERY);
    const update = () => setIsMobileViewport(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isMobileViewport;
}
