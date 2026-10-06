import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Backend — Web Desa Pringgodani",
  description: "Layanan REST API backend Website Resmi Pemerintah Desa Pringgodani.",
  verification: {
    google: "googlea9c207ee32eba86b",
    other: {
      "google-site-verification": ["googlea9c207ee32eba86b", "googlea9c207ee32eba86b.html"],
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased font-sans">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="google-site-verification" content="googlea9c207ee32eba86b" />
        <meta name="google-site-verification" content="googlea9c207ee32eba86b.html" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f9f9ff] text-[#151c27] font-sans">
        {children}
      </body>
    </html>
  );
}
