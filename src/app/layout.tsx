import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/study/theme-provider";

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
