import React from "react";
import { Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2
        className="animate-spin text-mint-green drop-shadow-[0_0_5px_#00FFC0]"
        size={size}
      />
    </div>
  );
}
