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
      // Capture the browser's one-shot prompt, but never interrupt a route automatically.
      // The customer opens the branded install journey from an explicit install action.
      setInstallPrompt(event as InstallPromptEvent);
    };

    window.addEventListener("online", online);
    window.addEventListener("offline", off);
    window.addEventListener("beforeinstallprompt", install);

    if (env.standalone && !embedded) {
      setInstallState("hidden");
    } else if (embedded) {
      // Embedded browsers are a compatibility gate, not an install promotion.
      setInstallState("embedded");
    }

    const requestInstall = () => {
      const current = environment();
      if (current.standalone) return;
      setInstallHelpOpen(false);
      setInstallState(current.embedded ? "embedded" : "native");
    };
    const appInstalled = () => {
      setInstallPrompt(null);
      setInstallState("hidden");
    };
    window.addEventListener("theplug-open-install", requestInstall);
    window.addEventListener("appinstalled", appInstalled);

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
      window.removeEventListener("theplug-open-install", requestInstall);
      window.removeEventListener("appinstalled", appInstalled);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", off);
      window.removeEventListener("beforeinstallprompt", install);
      navigator.serviceWorker?.removeEventListener("controllerchange", controllerChange);
      stopPendingAuth();
    };
  }, [initialEmbedded, initialAndroid]);

  useEffect(() => {
    if (installState !== "embedded" && installState !== "native") return;

    const isEmbeddedGate = installState === "embedded";
    const previousOverflow = document.body.style.overflow;
    if (isEmbeddedGate) document.body.style.overflow = "hidden";
    if (installState === "embedded") embeddedActionRef.current?.focus();
    else document.querySelector<HTMLButtonElement>(".plugInstallPrimary")?.focus();

    const keepDialogFocused = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isEmbeddedGate) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          dismissInstall();
        }
      }
      if (event.key === "Tab" && isEmbeddedGate) {
        event.preventDefault();
        embeddedActionRef.current?.focus();
      }
    };

    window.addEventListener("keydown", keepDialogFocused, true);
    return () => {
      if (isEmbeddedGate) document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", keepDialogFocused, true);
    };
  }, [installState, installHelpOpen]);

  async function install() {
    if (!installPrompt) {
      // Keep guidance in the same branded dialog; never stack a second modal.
      setInstallHelpOpen(true);
      return;
    }
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setInstallHelpOpen(false);
    setInstallState("hidden");
  }

  function dismissInstall() {
    sessionStorage.setItem("theplug-install-dismissed-v2", "1");
    setInstallHelpOpen(false);
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
  const installCard = installState === "native" ? (
    <div style={installShellStyle} role="presentation">
      <section className="plugInstallModal" role="dialog" aria-modal="false" aria-labelledby="plug-install-title" aria-describedby="plug-install-message">
        <div className="plugInstallTop"><span className="plugInstallMark">P</span><span className="plugInstallTag">THE PLUG · BOTSWANA</span><button type="button" className="plugInstallClose" aria-label="Continue in browser" onClick={dismissInstall}>×</button></div>
        <div className="plugInstallKicker">YOUR SOURCING APP</div>
        <h2 id="plug-install-title">The Plug.<br/><em>One tap away.</em></h2>
        <p id="plug-install-message">Install The Plug on your device for a direct home-screen shortcut to your sourcing requests, account and private conversations with Frank.</p>
        {installHelpOpen ? (
          <div className="plugInstallSteps" role="status" aria-live="polite">
            <strong>{installPlatform === "ios" ? "Add The Plug from Safari" : "Finish installing The Plug"}</strong>
            <p>{installPlatform === "ios"
              ? <>Open this page in <b>Safari</b>, tap <b>Share</b>, choose <b>Add to Home Screen</b>, then tap <b>Add</b>.</>
              : installPlatform === "android"
                ? <>In <b>Chrome</b>, open the <b>⋮ menu</b> and choose <b>Install app</b> or <b>Add to Home screen</b>.</>
                : <>Open your browser menu and choose <b>Install app</b> or <b>Install The Plug</b>, if offered.</>}</p>
            <button type="button" className="plugInstallPrimary" onClick={dismissInstall}>Got it</button>
          </div>
        ) : (
          <>
            <div className="plugInstallModalBenefits"><span><b>01</b><strong>Quick access</strong><small>Open The Plug from your home screen.</small></span><span><b>02</b><strong>Your requests</strong><small>Return to your sourcing journey and account.</small></span><span><b>03</b><strong>Private by account</strong><small>Keep your conversations in your member space.</small></span></div>
            <button type="button" className="plugInstallPrimary" onClick={() => void install()}>{installPrompt ? "Install The Plug →" : installPlatform === "ios" ? "Show iPhone install steps →" : "Show install steps →"}</button>
            <button type="button" className="plugInstallSecondary" onClick={dismissInstall}>Continue in browser</button>
          </>
        )}
        <p className="plugInstallFootnote">No app-store search needed. Your browser will guide the installation.</p>
      </section>
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

    {updateReady && <div className="pwaUpdate" role="status" aria-live="polite"><div><strong>The Plug update is ready</strong><span>Refresh when you are ready.</span></div><button type="button" className="button buttonPrimary" onClick={applyUpdate}>Refresh</button></div>}
  </>;
}
