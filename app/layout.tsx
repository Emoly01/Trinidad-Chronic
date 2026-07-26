import type { Metadata } from "next";
import { Yeseva_One, Spectral, Archivo } from "next/font/google";
import "./globals.css";

const display = Yeseva_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Spectral({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-body",
});

const label = Archivo({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-label",
});

export const metadata: Metadata = {
  title: "The Trinidad Diaries",
  description: "Kampagnen-Chronik · Gemeinsame Erinnerungen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${display.variable} ${body.variable} ${label.variable}`}>
      <body>{children}</body>
    </html>
  );
}
