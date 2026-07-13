import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Simploy — Where the world's most admired companies hire",
  description:
    "Simploy maps your live talent graph, simulates future workforce gaps, and recommends the exact actions to close them — before they become crises.",
  openGraph: {
    title: "Simploy — The Career OS",
    description: "Know your workforce gaps before they become crises.",
    url: "https://simploy.io",
    siteName: "Simploy",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${geistMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
