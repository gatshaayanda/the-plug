"use client";

// Keep embedded-browser install enforcement explicit at the top-level PWA boundary.

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

export default function PwaRegister({ initialEmbedded = false, initialAndroid = false }: { initialEmbedded?: boolean; initialAndroid?: boolean }) {
  const [offline, setOffline] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<InstallState>(initialEmbedded ? "embedded" : "hidden");
  const [updateReady, setUpdateReady] = useState<ServiceWorker | null>(null);
  const [embeddedAndroid, setEmbeddedAndroid] = useState(initialEmbedded && initialAndroid);
  const [installHelpOpen, setInstallHelpOpen] = useState(false);
  const [installHelpAvailable, setInstallHelpAvailable] = useState(false);
  const [installPlatform, setInstallPlatform] = useState<"android" | "ios" | "other">("other");
  const embeddedActionRef = useRef<HTMLButtonElement | null>(null);
  const reloadForUpdate = useRef(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const env = environment();
    const embedded = initialEmbedded || env.embedded;
    setEmbeddedAndroid((initialEmbedded && initialAndroid) || (env.embedded && env.android));
    setInstallPlatform(env.ios ? "ios" : env.android ? "android" : "other");

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
      if (!env.standalone && !env.embedded && !env.ios) {
        setInstallState("native");
        setInstallHelpAvailable(true);
      }
    };

    window.addEventListener("online", online);
    window.addEventListener("offline", off);
    window.addEventListener("beforeinstallprompt", install);

    if (env.standalone && !embedded) {
      setInstallState("hidden");
    } else if (embedded) {
      setInstallState("embedded");
    } else if (env.ios) {
      setInstallState("ios");
    }

    const installTimer = window.setTimeout(() => {
      if (env.standalone) return;
      setInstallHelpAvailable(true);
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
  }, [initialEmbedded, initialAndroid]);

  useEffect(() => {
    if (installState !== "embedded") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    embeddedActionRef.current?.focus();

    const keepDialogFocused = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
      }
      if (event.key === "Tab") {
        event.preventDefault();
        embeddedActionRef.current?.focus();
      }
    };

    window.addEventListener("keydown", keepDialogFocused, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", keepDialogFocused, true);
    };
  }, [installState]);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setInstallState("hidden");
    if (choice.outcome === "accepted") setInstallHelpAvailable(false);
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
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function applyUpdate() {
    if (!updateReady) return;
    reloadForUpdate.current = true;
    updateReady.postMessage({ type: "SKIP_WAITING" });
  }

  const installShellStyle: CSSProperties = { position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 1000, maxWidth: 720, margin: "0 auto", padding: 16, borderRadius: 18, background: "#FFFFFF", color: "#111318", boxShadow: "0 12px 40px rgba(0,0,0,.18)", border: "1px solid rgba(17,19,24,.12)" };
  const embeddedInstallStyle: CSSProperties = { position: "fixed", inset: 0, zIndex: 2147483647, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(0,0,0,.82)", backdropFilter: "blur(4px)", overscrollBehavior: "contain" };
  const installCard = installState === "native" && installPrompt ? (
    <div className="pwaInstallInfo" style={installShellStyle} role="dialog" aria-label={`Install ${APP_NAME}`}>
      <div><strong>Install {APP_NAME}</strong><span>Get the app on this device for faster access.</span></div>
      <div className="pwaInstallActions" style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}><button type="button" onClick={() => setInstallHelpOpen(true)}>How to install</button><button type="button" onClick={dismissInstall}>Not now</button><button type="button" style={{background:"#0866FF",color:"#fff"}} onClick={() => void install()}>Install app</button></div>
    </div>
  ) : installState === "embedded" ? (
    <div style={embeddedInstallStyle} role="alertdialog" aria-modal="true" aria-labelledby="plug-embedded-title" aria-describedby="plug-embedded-message">
      <div className="pwaInstallInfo" style={{...installShellStyle, position: "relative", left: "auto", right: "auto", bottom: "auto", width: "100%", maxWidth: 520, margin: 0}}>
        <div>
          <strong id="plug-embedded-title"><span aria-hidden="true">🌐 </span>OPEN THE PLUG IN YOUR BROWSER</strong>
          <span id="plug-embedded-message">{embeddedAndroid ? <>Tap below to open The Plug in Chrome. Then open the <b>⋮ menu</b> and choose <b>Install app</b>.</> : <>The Plug opened inside another app. Use that app’s menu to open this page in your browser, then look for <b>Install app</b> in the browser menu.</>}</span>
        </div>
        <div className="pwaInstallActions" style={{display:"flex",justifyContent:"flex-end"}}>
          <button ref={embeddedActionRef} type="button" style={{background:"#0866FF",color:"#fff"}} onClick={openBrowser}>{embeddedAndroid ? "OPEN IN CHROME" : "OPEN IN BROWSER"}</button>
        </div>
      </div>
    </div>
  ) : installState === "ios" ? (
    <div className="pwaInstallInfo" style={installShellStyle} role="dialog" aria-label={`Add ${APP_NAME} to your Home Screen`}>
      <div><strong>Add {APP_NAME} to your Home Screen</strong><span>In Safari, tap Share, choose <b>Add to Home Screen</b>, then tap Add.</span></div>
      <div className="pwaInstallActions" style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}><button type="button" onClick={() => setInstallHelpOpen(true)}>How to install</button><button type="button" onClick={dismissInstall}>Not now</button></div>
    </div>
  ) : installState === "browser-menu" ? (
    <div className="pwaInstallInfo" style={installShellStyle} role="dialog" aria-label={`Install ${APP_NAME}`}>
      <div><strong>Install {APP_NAME}</strong><span>Open your browser menu and look for <b>Install app</b>.</span></div>
      <div className="pwaInstallActions" style={{display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}><button type="button" style={{background:"#0866FF",color:"#fff"}} onClick={() => setInstallHelpOpen(true)}>How to install</button><button type="button" onClick={dismissInstall}>Not now</button></div>
    </div>
  ) : null;

  return <>
    {offline && <div className="offlineBanner" role="status" aria-live="polite"><span aria-hidden="true">⚡</span> Offline · The Plug is still being built, but this device can keep the app shell available. Requests may wait for reconnection.</div>}
    {!offline && reconnecting && <div className="offlineBanner reconnectingBanner" role="status" aria-live="polite"><span aria-hidden="true">↻</span> Reconnected · The Plug is syncing and checking for the latest information.</div>}
    {installCard}
    {installHelpAvailable && installState === "hidden" && <button type="button" onClick={() => setInstallHelpOpen(true)} style={{position:"fixed",right:16,bottom:16,zIndex:1000,border:0,borderRadius:999,padding:"11px 15px",background:"#0866FF",color:"#fff",fontWeight:900,boxShadow:"0 8px 24px rgba(0,0,0,.25)"}}>🌐 How to install</button>}
    {installHelpOpen && <div style={{...embeddedInstallStyle, zIndex: 10001}} role="presentation" onClick={() => setInstallHelpOpen(false)}>
      <section role="dialog" aria-modal="true" aria-labelledby="plug-install-help-title" aria-describedby="plug-install-help-message" onClick={event => event.stopPropagation()} style={{width: "100%", maxWidth: 360, borderRadius: 12, padding: "22px 20px 16px", background: "#fff", color: "#202124", boxShadow: "0 8px 32px rgba(0,0,0,.28)"}}>
        <h2 id="plug-install-help-title" style={{fontSize: 18, fontWeight: 700, margin: "0 0 12px"}}>🌐 How to install The Plug</h2>
        <p id="plug-install-help-message" style={{fontSize: 14, lineHeight: 1.5, margin: "0 0 22px"}}>{installPlatform === "ios" ? <>📲 In Safari, tap <b>Share</b>, choose <b>Add to Home Screen</b>, then tap <b>Add</b>.</> : installPlatform === "android" ? <>📲 In Chrome, open the <b>⋮ menu</b> and choose <b>Install app</b>.</> : <>📲 Open your browser menu and choose <b>Install app</b> or <b>Install The Plug</b>.</>}</p>
        <div style={{display: "flex", justifyContent: "flex-end"}}><button type="button" style={{background: "#0866FF", color: "#fff", minWidth: 72}} onClick={() => setInstallHelpOpen(false)}>Done</button></div>
      </section>
    </div>}
    {updateReady && <div className="pwaUpdate" role="status" aria-live="polite"><div><strong>The Plug update is ready</strong><span>Refresh when you are ready.</span></div><button type="button" className="button buttonPrimary" onClick={applyUpdate}>Refresh</button></div>}
  </>;
}
