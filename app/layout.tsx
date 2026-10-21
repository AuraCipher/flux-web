import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";

const urbanist = localFont({
  src: "./fonts/Urbanist-Variable.ttf",
  variable: "--font-urbanist",
  display: "swap",
});

const jakarta = localFont({
  src: "./fonts/PlusJakartaSans-Variable.ttf",
  variable: "--font-jakarta",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Flux — Real conversations, real people.",
    template: "%s | Flux",
  },
  description:
    "Flux is a real-time messaging app for the people who matter — direct messages, group chats, friends, and notifications in one clean, fast place.",
  keywords: ["Flux", "messaging", "chat", "real-time", "group chat"],
  openGraph: {
    type: "website",
    siteName: "Flux",
    title: "Flux — Real conversations, real people.",
    description:
      "Real-time messaging for the people who matter. Direct messages, group chats, friends, and notifications.",
    images: [{ url: "/flux-app-tilt.png", width: 420, height: 960 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flux — Real conversations, real people.",
    description:
      "Real-time messaging for the people who matter. Direct messages, group chats, friends, and notifications.",
    images: ["/flux-app-tilt.png"],
  },
  icons: {
    icon: "/flux-mark-white.png",
    apple: "/flux-mark-white.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${urbanist.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-bg text-text antialiased">{children}</body>
    </html>
  );
}
