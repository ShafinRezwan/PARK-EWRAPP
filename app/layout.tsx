import type { Metadata } from "next";
import { Cal_Sans, Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("h-full", "antialiased", geistMono.variable, "font-sans", geist.variable)}>
      <body className={`${calSans.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
