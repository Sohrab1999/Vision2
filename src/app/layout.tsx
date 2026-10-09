import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/study/theme-provider";

const vazir = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
});

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
