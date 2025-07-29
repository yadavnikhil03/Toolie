"use client";
import { ThemeProvider } from "@/components/theme-provider";
import SmokeyCursor from "@/components/SmokeyCursor";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <SmokeyCursor />
      {children}
    </ThemeProvider>
  );
}
