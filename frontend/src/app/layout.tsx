import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "LinkVault",
  description: "Developer knowledge vault",
  manifest: "/manifest.webmanifest",

  // iOS PWA — these generate the required <meta> and <link> tags that Safari reads.
  // iOS ignores the web manifest for icons/splash; these explicit entries are mandatory.
  appleWebApp: {
    capable: true,
    title: "LinkVault",
    statusBarStyle: "black-translucent",
    startupImage: [
      // iPhone 14 Pro Max  (430×932  @3×)
      {
        url: "/splash/splash-1290x2796.png",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 14 / 13 / 12  (390×844  @3×)
      {
        url: "/splash/splash-1170x2532.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 11 / XR  (414×896  @2×)
      {
        url: "/splash/splash-828x1792.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
      // iPhone SE 3rd gen  (375×667  @2×)
      {
        url: "/splash/splash-750x1334.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      // iPad Pro 12.9″  (1024×1366  @2×)
      {
        url: "/splash/splash-2048x2732.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },

  icons: {
    // Apple touch icon — shown on iOS home screen and bookmarks.
    // iOS does not use the manifest icons; this <link> tag is the only way.
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
