import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import "./features.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/study/shell/theme-provider";
import LiveAnnouncer from "@/components/study/shell/live-announcer";

// Pre-React boot guard (r269): a turbopack HMR stale-factory error that
// fires BEFORE the first React mount reaches no error boundary at all —
// the learner sees a blank iframe (the platform then shows its own
// "page won't open" card, the 2026-10-17 user-visible incident). This
// tiny inline script owns that window: it listens for the same chunk /
// stale-factory wording as error.tsx + global-error.tsx (three copies
// MUST stay literally in sync — the last-resort boundary stays
// dependency-free, so no shared import) and performs the same ONE
// loop-proof reload per session (shared sessionStorage key). Listeners
// retire after 30s so post-mount errors flow through the boundaries,
// keeping the /api/client-error telemetry that made this diagnosis
// possible in the first place.
const BOOT_GUARD_SNIPPET = String.raw`(function(){
  try{
    var KEY="v2-chunk-reload";
    var RX=/failed to (fetch|load)( dynamically)?( imported)? (module|chunk)|error loading dynamically imported module|loading chunk \d+ failed|importing a module script failed|module factory is not available|deleted in an HMR update/i;
    function heal(msg){
      try{
        if(!RX.test(msg||"")) return;
        if(sessionStorage.getItem(KEY)) return;
        sessionStorage.setItem(KEY,"1");
        window.location.reload();
      }catch(e){}
    }
    function onErr(e){ heal(e && (e.message || (e.error && e.error.message))); }
    function onRej(e){ heal(e && e.reason && (e.reason.message || String(e.reason))); }
    window.addEventListener("error", onErr, true);
    window.addEventListener("unhandledrejection", onRej, true);
    setTimeout(function(){
      window.removeEventListener("error", onErr, true);
      window.removeEventListener("unhandledrejection", onRej, true);
    }, 30000);
  }catch(e){}
})();`;

const vazir = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
});

// F4 — PWA: mobile chrome + standalone iOS web-app
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#047857" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f0d" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "ویژن ۲ | وب‌کتاب تعاملی زبان انگلیسی پایهٔ یازدهم",
  description:
    "تبدیل جزوهٔ جامع «Vision Two» به وب‌کتاب تعاملی: واژگان، فلش‌کارت، مکالمه با روخوانی، ریدینگ، گرامر، تست‌های کنکوری و آزمون جامع.",
  keywords: [
    "زبان انگلیسی",
    "پایه یازدهم",
    "Vision Two",
    "کنکور",
    "وب‌کتاب",
    "آموزش تعاملی",
  ],
  authors: [{ name: "تیم ویژن ۲" }],
  applicationName: "ویژن ۲",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ویژن ۲",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  // Phase-1 «پایداری» — link previews (Telegram / WhatsApp / Twitter)
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "ویژن ۲",
    title: "ویژن ۲ | وب‌کتاب تعاملی زبان انگلیسی پایهٔ یازدهم",
    description:
      "واژگان، فلش‌کارت، مکالمه با روخوانی، گرامر، ۳۶۰ تست کنکوری و آزمون جامع — همه در یک وب‌کتاب تعاملی.",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "لوگوی وب‌کتاب ویژن ۲",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ویژن ۲ | وب‌کتاب تعاملی زبان انگلیسی پایهٔ یازدهم",
    description:
      "واژگان، فلش‌کارت، مکالمه با روخوانی، گرامر، ۳۶۰ تست کنکوری و آزمون جامع — همه در یک وب‌کتاب تعاملی.",
    images: ["/icons/icon-512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazir.variable} antialiased bg-background text-foreground`}>
        {/* r269 pre-React boot guard — see comment above the snippet */}
        <Script
          id="boot-guard"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: BOOT_GUARD_SNIPPET }}
        />
        <ThemeProvider>{children}</ThemeProvider>
        {/* Task 171 — the screen-reader announcement layer: two sr-only live
            regions (polite + assertive) fed by lib/announcer via the toaster.
            Must sit beside <Toaster /> and live for the app's whole lifetime. */}
        <LiveAnnouncer />
        <Toaster />
      </body>
    </html>
  );
}
