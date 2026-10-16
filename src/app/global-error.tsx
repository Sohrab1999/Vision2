"use client";

// Root/global error boundary (last resort): even if the layout itself
// crashes the learner gets a styled recovery page instead of a blank screen.

import { useEffect } from "react";
import { BookX, RotateCcw } from "lucide-react";

export default function GlobalErrorPage({
  error,
}: {
  error: Error & { digest?: string };
  // Next's global-boundary API still hands us reset(); intentionally
  // unused — see the button comment below.
  reset?: () => void;
}) {
  useEffect(() => {
    console.error("Webbook fatal error:", error);
    try {
      // same contract as route error.tsx (regex kept literally in sync —
      // this last-resort boundary must stay dependency-free, so no shared
      // import): one loop-proof reload for chunk-load races and turbopack
      // HMR stale factories, otherwise forward to the server log
      const CHUNK_LOAD_ERR =
        /failed to (fetch|load)( dynamically)?( imported)? (module|chunk)|error loading dynamically imported module|loading chunk \d+ failed|importing a module script failed|module factory is not available|deleted in an HMR update/i;
      const key = "v2-chunk-reload";
      const isChunkErr = CHUNK_LOAD_ERR.test(error.message || "");
      if (isChunkErr) {
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          window.location.reload();
          return;
        }
      }
      fetch("/api/client-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          href: window.location.href,
          fatal: true,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* diagnostics must never become a crash source */
    }
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg,#faf9f5 0%,#f0fdf4 100%)",
          fontFamily: "Vazirmatn, system-ui, sans-serif",
          padding: 16,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            textAlign: "center",
            background: "#fff",
            border: "1px solid #e7e5e4",
            borderRadius: 16,
            padding: "40px 28px",
            boxShadow: "0 10px 30px rgba(0,0,0,.08)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              background: "#fef2f2",
            }}
          >
            <BookX size={26} color="#f43f5e" />
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: 18, color: "#1c1917" }}>
            کتاب موقتاً در دسترس نیست
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: 13, lineHeight: 2, color: "#78716c" }}>
            خطای غیرمنتظره‌ای رخ داد. نگران نباش، پیشرفت تو روی همین دستگاه
            ذخیره شده است — با یک بار بازخوانی برگردی.
          </p>
          <button
            onClick={() => {
              // parity with route error.tsx: whatever the error class, the
              // only real escape here is a full document reload — reset()
              // re-renders the same stale/broken module graph (the
              // 2026-10-17 "هنوزم همینه" follow-up). User-consented ⇒
              // cannot loop; clearing the guard key lets the fresh session
              // auto-heal once more.
              try {
                sessionStorage.removeItem("v2-chunk-reload");
              } catch {
                /* storage may be unavailable — reload still proceeds */
              }
              window.location.reload();
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              minHeight: 44,
              padding: "10px 22px",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              background: "#059669",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            <RotateCcw size={15} />
            بارگذاری دوباره
          </button>
          {error.message ? (
            // raw cause, truncated — a screenshot of this card carries the
            // diagnosis with it (same lesson as route error.tsx)
            <p
              dir="ltr"
              style={{
                margin: "12px 0 0",
                fontSize: 10,
                lineHeight: "16px",
                color: "#d6d3d1",
                wordBreak: "break-all",
                maxWidth: "100%",
              }}
            >
              {error.message.length > 160
                ? `${error.message.slice(0, 160)}…`
                : error.message}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
