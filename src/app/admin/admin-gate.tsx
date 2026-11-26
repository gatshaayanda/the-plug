"use client";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/client";

function friendlyAuthError(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (code === "auth/popup-closed-by-user") return "The Google sign-in window was closed before completion.";
  if (code === "auth/popup-blocked") return "Your browser blocked the Google sign-in window. Allow pop-ups and try again.";
  if (code === "auth/cancelled-popup-request") return "Another Google sign-in request is already open.";
  if (code === "auth/network-request-failed") return "We could not reach Firebase. Check your internet connection and try again.";
  if (code === "auth/unauthorized-domain") return "This domain is not authorised for Google sign-in in the Firebase project.";
  if (code === "auth/operation-not-allowed") return "Google sign-in is not enabled in the Firebase Authentication settings.";
  return error instanceof Error ? error.message : "We could not complete Google sign-in. Please try again.";
}

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let revision = 0;

    const stopAuth = onAuthStateChanged(auth, async (nextUser) => {
      const currentRevision = ++revision;
      if (!active) return;
      setUser(nextUser);
      setAuthorized(false);
      setChecking(Boolean(nextUser));
      if (!nextUser) {
        setChecking(false);
        return;
      }

      try {
        const idToken = await nextUser.getIdToken();
        const response = await fetch("/api/admin-auth", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ idToken }),
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) throw new Error(payload.error || "This Google account is not approved for Operations access.");

        if (!active || currentRevision !== revision) return;
        setAuthorized(true);
        setError("");
      } catch (authError) {
        if (!active || currentRevision !== revision) return;
        setError(friendlyAuthError(authError));
        await signOut(auth);
      } finally {
        if (active && currentRevision === revision) setChecking(false);
      }
    });

    return () => {
      active = false;
      revision++;
      stopAuth();
    };
  }, []);

  async function signIn() {
    setBusy(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      // onAuthStateChanged verifies the Google identity with the trusted server
      // before the Operations dashboard is rendered.
    } catch (authError) {
      setError(friendlyAuthError(authError));
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <main className="adminPage">
        <div className="adminShell">
          <div className="emptyState">
            <div>🔐</div>
            <h1>Opening The Plug Admin</h1>
            <p>Verifying your Google account and Operations permissions…</p>
          </div>
        </div>
      </main>
    );
  }

  if (user && authorized) return <div className="adminAuthorized">{children}</div>;

  return (
    <main className="adminPage">
      <div className="adminShell">
        <section className="adminPanel" style={{ maxWidth: 520, margin: "80px auto" }}>
          <span className="kicker">The Plug · Operations</span>
          <h1>Operations sign in</h1>
          <p>Use an approved Google account to securely access sourcing requests, catalogue and customer conversations.</p>
          <button className="button buttonPrimary" type="button" onClick={signIn} disabled={busy}>
            {busy ? "Opening Google sign-in…" : "Continue with Google"}
          </button>
          {error && <p role="alert" className="notice">{error}</p>}
        </section>
      </div>
    </main>
  );
}
