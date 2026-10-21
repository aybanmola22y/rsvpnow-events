import type { Metadata } from "next";
import { Caprasimo, Geist_Mono, Outfit } from "next/font/google";
import { Providers } from "@/components/providers";
import {
  absoluteUrl,
  defaultDescription,
  getSiteUrl,
  siteKeywords,
  siteName,
} from "@/lib/seo";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

/** Caprasimo stands in for Kaftus — warm display serif for main headings. */
const display = Caprasimo({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-face",
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${siteName} · Event Planner Singapore`,
    template: `%s · ${siteName}`,
  },
  description: defaultDescription,
  keywords: siteKeywords,
  applicationName: siteName,
  authors: [{ name: siteName, url: getSiteUrl() }],
  creator: siteName,
  publisher: siteName,
  category: "events",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_SG",
    url: getSiteUrl(),
    siteName,
    title: `${siteName} · Event Planner Singapore`,
    description: defaultDescription,
    images: [
      {
        url: absoluteUrl("/brand/hero.jpg"),
        width: 1600,
        height: 900,
        alt: `${siteName} — Singapore event planning`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} · Event Planner Singapore`,
    description: defaultDescription,
    images: [absoluteUrl("/brand/hero.jpg")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "dns-prefetch": "https://images.unsplash.com",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${display.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="preconnect" href="https://challenges.cloudflare.com" />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
