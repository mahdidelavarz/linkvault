"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePwaInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled,   setIsInstalled]   = useState(false);
  const [isIos,         setIsIos]         = useState(false);
  const [isStandalone,  setIsStandalone]  = useState(false);

  useEffect(() => {
    // Detect if already running as installed PWA
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS (Safari on iPhone/iPad/iPod)
    setIsIos(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

    // Capture the browser's native install prompt (Android Chrome/Edge)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    // Track successful install
    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  /** Trigger the native Android install prompt. Returns true if accepted. */
  const install = async (): Promise<boolean> => {
    if (!installPrompt) return false;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setInstallPrompt(null);
    return outcome === "accepted";
  };

  return {
    /** Android Chrome: native install prompt is available */
    canInstall: !!installPrompt,
    /** The app was just installed in this session */
    isInstalled,
    /** Running on iOS Safari */
    isIos,
    /** Already running as installed PWA (standalone mode) */
    isStandalone,
    /** Trigger the Android install dialog */
    install,
  };
}
