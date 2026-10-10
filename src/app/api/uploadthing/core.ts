import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTFiles } from "uploadthing/server";

const f = createUploadthing();
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

function firebaseAdminApp() {
  const existing = getApps().find((app) => app.name === "the-plug-uploadthing-auth");
  if (existing) return existing;
  const raw = process.env.FIREBASE_ADMIN_KEY;
  if (!raw) throw new UploadThingError("Private uploads are not configured yet.");
  let serviceAccount: Record<string, unknown>;
  try { serviceAccount = JSON.parse(raw) as Record<string, unknown>; }
  catch { throw new UploadThingError("Private uploads are not configured yet."); }
  return initializeApp({ credential: cert(serviceAccount as Parameters<typeof cert>[0]) }, "the-plug-uploadthing-auth");
}

export const ourFileRouter = {
  fileUploader: f({
    image: { maxFileSize: "16MB", maxFileCount: 1 },
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async ({ req, files }) => {
      const authorization = req.headers.get("authorization") || "";
      const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
      if (!token) throw new UploadThingError("Your private session expired. Retry the upload.");
      let uid: string;
      try { uid = (await getAuth(firebaseAdminApp()).verifyIdToken(token)).uid; }
      catch { throw new UploadThingError("The Plug could not verify your session. Retry the upload."); }
      if (files.some((file) => file.size > MAX_ATTACHMENT_BYTES)) {
        throw new UploadThingError("Attachments must be 10 MB or smaller.");
      }
      const overrides = files.map((file) => ({
        ...file,
        name: file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 180) || "reference",
      }));
      return { userId: uid, [UTFiles]: overrides };
    })
    .onUploadComplete(async ({ metadata, file }) => ({
      uploadedBy: metadata.userId,
      url: file.ufsUrl || file.url,
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
