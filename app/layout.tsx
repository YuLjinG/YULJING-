import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YuLjinG — Visual Designer & Photographer",
  description: "YuLjinG Website visual prototype.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
