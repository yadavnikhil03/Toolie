import { cn } from "@/lib/utils";
import React from "react";

interface HudLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function HudLayout({ children, className }: HudLayoutProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full bg-white text-foreground",
        className
      )}
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <svg className="h-full w-full animate-pulse-soft" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="#64748b" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotGrid)" />
        </svg>
      </div>

      {/* Floating Accent Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-4 h-4 bg-primary-blue/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-primary-blue/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-primary-blue/15 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-5 h-5 bg-primary-blue/10 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10 animate-fade-in">{children}</div>
    </div>
  );
}
