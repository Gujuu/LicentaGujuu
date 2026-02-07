import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // If navigating with a hash (e.g. /#contact), scroll to that element.
    if (location.hash) {
      const id = decodeURIComponent(location.hash.replace(/^#/, ""));
      // Wait a tick so the next route has rendered.
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 0);
      return;
    }

    // Otherwise, always reset scroll position on route changes.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search, location.hash]);

  return null;
};

export default ScrollToTop;
