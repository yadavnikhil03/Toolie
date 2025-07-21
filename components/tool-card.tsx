"use client";

import { motion } from "framer-motion";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  usageCount?: number;
}

export function ToolCard({
  title,
  description,
  icon: Icon,
  onClick,
  className,
  isFavorite = false,
  onToggleFavorite,
  usageCount = 0,
}: ToolCardProps) {
  return (
    <div
      className={cn(
        "group cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-blue-300 hover:shadow-lg",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
                )}
              />
            </Button>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
      
      {usageCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Used {usageCount} time{usageCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
