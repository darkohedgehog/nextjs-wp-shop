import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { Providers } from "./providers";
import { NavbarWithChildren } from "@/components/navigation/Nav";
import { siteMetaData } from "@/utils/siteMetaData";

const CookiesToast = dynamic(() => import("@/components/cookies/CookiesToast"),);
const Footer = dynamic(() => import("@/components/footer/Footer"));

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const ogImageAbs = new URL(siteMetaData.defaultOg, siteMetaData.siteUrl).toString();

export const metadata: Metadata = {
  metadataBase: new URL(siteMetaData.siteUrl),

  title: {
    default: siteMetaData.title,
    template: `%s | ${siteMetaData.brand}`,
  },
  description: siteMetaData.description,

  alternates: {
    canonical: siteMetaData.siteUrl, // global fallback (per-page buildMetadata override-uje canonical)
  },

  openGraph: {
    type: "website",
    locale: siteMetaData.locale,
    url: siteMetaData.siteUrl,
    siteName: siteMetaData.brand,
    title: siteMetaData.title,
    description: siteMetaData.description,
    images: [
      {
        url: ogImageAbs,
        width: 1200,
        height: 630,
        alt: siteMetaData.title,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: siteMetaData.title,
    description: siteMetaData.description,
    images: [ogImageAbs],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  applicationName: siteMetaData.brand,
  authors: [{ name: siteMetaData.brand }],

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {/* Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <BackgroundGradientAnimation />
        </div>

        {/* App */}
        <Providers>
          <div className="relative z-10 min-h-screen flex flex-col">
            <NavbarWithChildren />

            <main className="flex-1">{children}</main>

            {/* client-only */}
            <CookiesToast />

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}