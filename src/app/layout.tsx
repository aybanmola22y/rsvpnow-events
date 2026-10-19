import type { Metadata } from "next";
import { Caprasimo, Geist_Mono, Outfit } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

/** Caprasimo stands in for Kaftus — warm display serif for main headings. */
const display = Caprasimo({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-face",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RSVPNow",
    template: "%s · RSVPNow",
  },
  description:
    "RSVPNow is a Singapore-based events company. You bring the people. We'll take care of the rest.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${display.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
