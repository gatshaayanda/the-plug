import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APPROVED_ADMIN_EMAILS = new Set([
  "frankchiwanga@yahoo.com",
  "gatshaayanda@gmail.com",
]);

function firebaseAdminApp() {
  const existing = getApps()[0];
  if (existing) return existing;
  const raw = process.env.FIREBASE_ADMIN_KEY;
  if (!raw) throw new Error("Firebase Admin authentication is not configured.");
  const serviceAccount = JSON.parse(raw) as Record<string, unknown>;
  return initializeApp({ credential: cert(serviceAccount as Parameters<typeof cert>[0]) });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { idToken?: unknown } | null;
    if (typeof body?.idToken !== "string" || body.idToken.length < 100 || body.idToken.length > 10000) {
      return NextResponse.json({ error: "A valid Google sign-in session is required." }, { status: 401 });
    }

    const app = firebaseAdminApp();
    const decoded = await getAuth(app).verifyIdToken(body.idToken, true);
    const email = typeof decoded.email === "string" ? decoded.email.trim().toLowerCase() : "";

    if (decoded.firebase?.sign_in_provider !== "google.com" || decoded.email_verified !== true || !APPROVED_ADMIN_EMAILS.has(email)) {
      return NextResponse.json({ error: "This Google account is not on the approved Operations administrator list." }, { status: 403 });
    }

    const db = getFirestore(app);
    const auth = getAuth(app);

    // Retire the legacy shared one-word Operations identity. Its Firestore
    // role record is removed and any existing refresh tokens are revoked.
    const legacyOperationsUid = "the-plug-temporary-operations";
    try {
      await auth.revokeRefreshTokens(legacyOperationsUid);
    } catch (legacyAuthError) {
      const code = typeof legacyAuthError === "object" && legacyAuthError !== null && "code" in legacyAuthError
        ? String((legacyAuthError as { code?: unknown }).code)
        : "";
      if (code !== "auth/user-not-found") throw legacyAuthError;
    }
    await db.collection("admins").doc(legacyOperationsUid).delete();

    const adminRef = db.collection("admins").doc(decoded.uid);
    const existing = await adminRef.get();
    const now = FieldValue.serverTimestamp();

    await adminRef.set({
      role: "owner",
      email,
      authProvider: "google.com",
      approvedAdministrator: true,
      ...(existing.exists ? {} : { createdAt: now }),
      updatedAt: now,
      lastAuthenticatedAt: now,
    }, { merge: true });

    await db.collection("adminSecurityEvents").add({
      type: "approved_google_admin_sign_in",
      uid: decoded.uid,
      email,
      provider: "google.com",
      createdAt: now,
    });

    return NextResponse.json(
      { ok: true, protocol: "Google OAuth 2.0 + Firebase ID token verification + email allowlist + Firestore role record" },
      { headers: { "Cache-Control": "no-store", "Pragma": "no-cache" } },
    );
  } catch (error) {
    console.error("Admin authentication failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Secure Operations sign-in is temporarily unavailable. Please try again." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
