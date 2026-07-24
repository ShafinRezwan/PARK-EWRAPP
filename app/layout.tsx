import type { Metadata } from "next";
import { Cal_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const calSans = Cal_Sans({
  weight: "400",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ParK Paving EWR App",
  description: "Extra Work Report App Prototype 01 July 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={` ${geistMono.variable} h-full antialiased`}>
      <body className={`${calSans.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
