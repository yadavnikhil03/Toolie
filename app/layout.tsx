import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Toolie - Modern Utility Suite",
  description: "A modern, clean web utility suite for all your everyday tools.",
  generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* ClientLayout handles ThemeProvider and SmokeyCursor as a client component */}
        {/** @ts-ignore-next-line */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
