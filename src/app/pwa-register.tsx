"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};
type InstallState = "hidden" | "native" | "embedded" | "ios" | "browser-menu";

const APP_NAME = "The Plug";

function environment() {
  if (typeof window === "undefined") return { standalone: true, ios: false, android: false, embedded: false };
  const ua = navigator.userAgent || "";
  const standalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(ua);
  const embedded = /WhatsApp|Instagram|FBAN|FBAV|Messenger|Line\/|Twitter|TikTok|Snapchat/i.test(ua) ||
    (/Android/i.test(ua) && /; wv\)/i.test(ua));
  return { standalone, ios, android, embedded };
}

export default function PwaRegister() {
  const [offline, setOffline] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<InstallState>("hidden");
  const [updateReady, setUpdateReady] = useState<ServiceWorker | null>(null);
  const [embeddedAndroid, setEmbeddedAndroid] = useState(false);
  const reloadForUpdate = useRef(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const env = environment();
    setEmbeddedAndroid(env.embedded && env.android);

    const retryPendingOrderNotifications = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const idToken = await getIdToken(user).catch(() => null);
      if (!idToken) return;
      const pendingKeys = Object.keys(localStorage).filter(key => key.startsWith("plug-pending-order-notification-"));
      for (const key of pendingKeys) {
        const orderId = key.replace("plug-pending-order-notification-", "");
        try {
          const response = await fetch("/api/notifications/order-created", {
            method: "POST",
            headers: { Authorization: "Bearer " + idToken, "Content-Type": "application/json" },
            body: JSON.stringify({ orderId })
          });
          if (response.ok) localStorage.removeItem(key);
        } catch {}
      }
    };

    const online = () => {
      setOffline(false);
      setReconnecting(true);
      window.setTimeout(() => {
        setReconnecting(false);
        void retryPendingOrderNotifications();
      }, 1200);
    };
    const off = () => {
      setReconnecting(false);
      setOffline(true);
    };

    const install = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
      if (!env.standalone && !env.embedded && !env.ios) setInstallState("native");
    };

    window.addEventListener("online", online);
    window.addEventListener("offline", off);
    window.addEventListener("beforeinstallprompt", install);

    if (env.standalone) {
      setInstallState("hidden");
    } else if (env.embedded) {
      setInstallState("embedded");
    } else if (env.ios) {
      setInstallState("ios");
    }

    const installTimer = window.setTimeout(() => {
      if (env.standalone) return;
      if (sessionStorage.getItem("theplug-install-dismissed") === "1") return;
      setInstallState(current => current === "native" || current === "embedded" || current === "ios" ? current : "browser-menu");
    }, 1800);

    let registration: ServiceWorkerRegistration | null = null;
    const inspect = () => {
      if (registration?.waiting && navigator.serviceWorker.controller) setUpdateReady(registration.waiting);
    };
    const register = async () => {
      if (!("serviceWorker" in navigator)) return;
      try {
        registration = await navigator.serviceWorker.register("/sw.js");
        inspect();
        registration.addEventListener("updatefound", () => {
          const worker = registration?.installing;
          if (!worker) return;
          worker.addEventListener("statechange", inspect);
        });
        await registration.update();
        inspect();
      } catch {}
    };

    void register();
    void retryPendingOrderNotifications();
    const stopPendingAuth = onAuthStateChanged(auth, () => { void retryPendingOrderNotifications(); });
    const controllerChange = () => { if (reloadForUpdate.current) window.location.reload(); };
    navigator.serviceWorker?.addEventListener("controllerchange", controllerChange);

    return () => {
      window.clearTimeout(installTimer);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", off);
      window.removeEventListener("beforeinstallprompt", install);
      navigator.serviceWorker?.removeEventListener("controllerchange", controllerChange);
      stopPendingAuth();
    };
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setInstallState("hidden");
  }

  function dismissInstall() {
    sessionStorage.setItem("theplug-install-dismissed", "1");
    setInstallState("hidden");
  }

  function openBrowser() {
    const url = window.location.href;
    const env = environment();
    if (env.android) {
      window.location.href = "intent://" + url.replace(/^https?:\/\//, "") + "#Intent;scheme=https;package=com.android.chrome;end";
      window.setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), 700);
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function applyUpdate() {
    if (!updateReady) return;
    reloadForUpdate.current = true;
    updateReady.postMessage({ type: "SKIP_WAITING" });
  }

  const installShellStyle: CSSProperties = { position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 1000, maxWidth: 720, margin: "0 auto", padding: 16, borderRadius: 18, background: "#FFFFFF", color: "#111318", boxShadow: "0 12px 40px rgba(0,0,0,.18)", border: "1px solid rgba(17,19,24,.12)" };\n  const installCard = installState === "native" && installPrompt ? (
    <div className="pwaInstallInfo" style={installShellStyle} role="dialog" aria-label={`Install ${APP_NAME}`}>
      <div><strong>Install {APP_NAME}</strong><span>Get the app on this device for faster access.</span></div>
      <div className="pwaInstallActions" style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}><button type="button" style={{background:"#0866FF",color:"#fff"}} onClick={() => void install()}>Install app</button><button type="button" onClick={dismissInstall}>Not now</button></div>
    </div>
  ) : installState === "embedded" ? (
    <div className="pwaInstallInfo" style={installShellStyle} role="dialog" aria-label="Open The Plug in your browser">
      <div><strong>Open {APP_NAME} in your browser</strong><span>You&apos;re viewing The Plug inside another app. Open it in Chrome to get the full app experience and install it.</span></div>
      <div className="pwaInstallActions" style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}><button type="button" style={{background:"#0866FF",color:"#fff"}} onClick={openBrowser}>{embeddedAndroid ? "Open in Chrome" : "Open in browser"}</button><button type="button" onClick={dismissInstall}>Continue here</button></div>
    </div>
  ) : installState === "ios" ? (
    <div className="pwaInstallInfo" style={installShellStyle} role="dialog" aria-label={`Add ${APP_NAME} to your Home Screen`}>
      <div><strong>Add {APP_NAME} to your Home Screen</strong><span>In Safari, tap Share, choose <b>Add to Home Screen</b>, then tap Add.</span></div>
      <div className="pwaInstallActions" style={{display:"flex",justifyContent:"flex-end"}}><button type="button" onClick={dismissInstall}>Got it</button></div>
    </div>
  ) : installState === "browser-menu" ? (
    <div className="pwaInstallInfo" style={installShellStyle} role="dialog" aria-label={`Install ${APP_NAME}`}>
      <div><strong>Install {APP_NAME}</strong><span>Your browser has not given the site a one-tap install prompt. Open your browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.</span></div>
      <div className="pwaInstallActions" style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}><button type="button" style={{background:"#0866FF",color:"#fff"}} onClick={() => window.alert("Open your browser menu (⋮) and choose Install app or Add to Home screen.")}>How to install</button><button type="button" onClick={dismissInstall}>Not now</button></div>
    </div>
  ) : null;

  return <>
    {offline && <div className="offlineBanner" role="status" aria-live="polite"><span aria-hidden="true">⚡</span> Offline · The Plug is still being built, but this device can keep the app shell available. Requests may wait for reconnection.</div>}
    {!offline && reconnecting && <div className="offlineBanner reconnectingBanner" role="status" aria-live="polite"><span aria-hidden="true">↻</span> Reconnected · The Plug is syncing and checking for the latest information.</div>}
    {installCard}
    {updateReady && <div className="pwaUpdate" role="status" aria-live="polite"><div><strong>The Plug update is ready</strong><span>Refresh when you are ready.</span></div><button type="button" className="button buttonPrimary" onClick={applyUpdate}>Refresh</button></div>}
  </>;
}
