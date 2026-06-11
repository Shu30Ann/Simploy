import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simploy — The Career OS for Modern Teams",
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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
