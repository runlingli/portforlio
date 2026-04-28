import { useEffect, useState } from "react";
import App from "./App";
import LinkedInPostGenerator from "./LinkedInPostGenerator";

export function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  // Store navigate in window for global access if needed
  useEffect(() => {
    (window as any).navigate = navigate;
  }, []);

  // Normalize path by removing trailing slash for comparison
  const normalizedPath = currentPath.replace(/\/$/, "") || "/";

  // Determine which component to render based on path
  if (normalizedPath === "/linkedin-post") {
    return <LinkedInPostGenerator />;
  }

  return <App />;
}

export default Router;
