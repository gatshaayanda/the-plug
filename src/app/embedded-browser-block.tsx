import { headers } from "next/headers";

const EMBEDDED_BROWSER_PATTERN = /WhatsApp|Instagram|FBAN|FBAV|Messenger|Line\/|Twitter|TikTok|Snapchat/i;

export default async function EmbeddedBrowserBlock() {
  const userAgent = (await headers()).get("user-agent") || "";
  const isEmbedded = EMBEDDED_BROWSER_PATTERN.test(userAgent) ||
    (/Android/i.test(userAgent) && /; wv\)/i.test(userAgent));

  if (!isEmbedded) return null;

  return (
    <div
      id="embedded-browser-block"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(0,0,0,.82)",
        color: "#111318",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Open The Plug in your browser"
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          display: "grid",
          gap: 16,
          padding: 22,
          borderRadius: 20,
          background: "#fff",
          boxShadow: "0 24px 80px rgba(0,0,0,.35)",
        }}
      >
        <div style={{ display: "grid", gap: 8 }}>
          <strong style={{ fontSize: 18, lineHeight: 1.2 }}>🌐 OPEN THE PLUG IN YOUR BROWSER</strong>
          <span style={{ fontSize: 15, lineHeight: 1.5, color: "#555" }}>
            You&apos;re viewing The Plug inside another app. The first step is to tap the <b>⋮ three-dot menu</b>, then choose <b>Open in browser</b> or <b>Open in Chrome</b>.
          </span>
        </div>
        <button
          type="button"
          onClick={() => document.getElementById("embedded-browser-block")?.remove()}
          style={{
            justifySelf: "end",
            border: 0,
            borderRadius: 10,
            padding: "10px 14px",
            background: "#0866FF",
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          GOT IT
        </button>
      </div>
    </div>
  );
}
