import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import "./features.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/study/shell/theme-provider";

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
  authors: [{ name: "بر اساس جزوهٔ جمال احمدی" }],
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
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
