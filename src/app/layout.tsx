import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Živić elektro materijal",
  description: "Prodaja elektro materijala i opreme",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         {/* BackgroundGradientAnimation kao pozadina */}
      <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
        <BackgroundGradientAnimation /> 
      </div>
      {/* Sadržaj aplikacije */}
      <Providers>
      <div className="relative z-10">
        {children}
      </div>
      </Providers>
      </body>
    </html>
  );
}
