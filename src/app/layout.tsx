import type { Metadata } from "next";
import { Caprasimo, Geist_Mono, Outfit } from "next/font/google";
import { Providers } from "@/components/providers";
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
  title: {
    default: "RSVPNow",
    template: "%s · RSVPNow",
  },
  description:
    "RSVPNow is a Singapore-based events company. You bring the people. We'll take care of the rest.",
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
