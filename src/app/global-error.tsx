"use client";

// Root/global error boundary (last resort): even if the layout itself
// crashes the learner gets a styled recovery page instead of a blank screen.

import { useEffect } from "react";
import { BookX, RotateCcw } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Webbook fatal error:", error);
    try {
      // same contract as route error.tsx: one loop-proof reload for
      // chunk-load races, otherwise forward to the server log
      const CHUNK_LOAD_ERR =
        /failed to (fetch|load)( dynamically)?( imported)? (module|chunk)|error loading dynamically imported module|loading chunk \d+ failed|importing a module script failed/i;
      const key = "v2-chunk-reload";
      if (CHUNK_LOAD_ERR.test(error.message || "")) {
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
            onClick={reset}
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
        </div>
      </body>
    </html>
  );
}
