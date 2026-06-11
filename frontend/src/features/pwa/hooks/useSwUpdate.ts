"use client";

import { useEffect, useState } from "react";

export function useSwUpdate() {
  const [waitingSw, setWaitingSw] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((registration) => {
      // Check for an update that was found but is waiting to activate
      if (registration.waiting) {
        setWaitingSw(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;

        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            // A new SW installed and the page is still controlled by the old one
            setWaitingSw(installing);
          }
        });
      });
    });

    // When the new SW takes control, reload to get the fresh assets
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!reloading) {
        reloading = true;
        window.location.reload();
      }
    });
  }, []);

  /** Activate the waiting service worker and reload the page. */
  const applyUpdate = () => {
    if (!waitingSw) return;
    waitingSw.postMessage({ type: "SKIP_WAITING" });
    setWaitingSw(null);
  };

  return {
    /** A new version of the app is ready and waiting to be activated */
    updateAvailable: !!waitingSw,
    applyUpdate,
  };
}
