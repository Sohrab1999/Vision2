import type { MetadataRoute } from "next";

// F4 — PWA installable (نقشهٔ راه فیچرها، اسپرینت ۳)
// Next App Router serves this at /manifest.webmanifest automatically.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "ویژن ۲ — وب‌کتاب تعاملی زبان یازدهم",
    short_name: "ویژن ۲",
    description:
      "وب‌کتاب تعاملی Vision Two: واژگان، فلش‌کارت هوشمند، مکالمه و ریدینگ با روخوانی، گرامر، دیکته و آزمون جامع.",
    lang: "fa",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fafaf9",
    theme_color: "#047857",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "مرور هوشمند واژه‌ها",
        short_name: "مرور",
        description: "فلش‌کارت واژه‌های سررسید امروز",
        url: "/?goto=review",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "آزمون جامع",
        short_name: "آزمون",
        description: "بانک تست‌های کنکوری Vision Two",
        url: "/?goto=exam",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
