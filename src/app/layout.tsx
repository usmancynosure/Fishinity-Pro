import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Fishinity Pro — Build fishing tools with AI",
  description:
    "The Fishinity Pro Feature Builder turns a plain-English description into a working, no-code fishing tool. Customise it visually, then publish it to the marketplace — free or paid.",
  openGraph: {
    title: "Fishinity Pro — Build fishing tools with AI",
    description:
      "Describe a fishing tool, let AI build it, customise it visually, and publish it to the marketplace.",
    images: ["/images/og-image.jpg"],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
