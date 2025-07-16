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
    <motion.div
      className={cn(
        "relative cursor-pointer rounded-xl transition-all duration-300 ease-in-out group",
        className
      )}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full w-full border-2 border-gray-100 bg-white shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:border-primary-blue/50 group-hover:bg-gray-50/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-xl font-semibold text-dark-gray group-hover:text-primary-blue transition-colors duration-300" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0"
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
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.3 }}
            >
              <Icon className="h-7 w-7 text-primary-blue group-hover:text-blue-600 transition-colors duration-300" />
            </motion.div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary-gray group-hover:text-gray-600 transition-colors duration-300 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>{description}</p>
          
          {usageCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              Used {usageCount} time{usageCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardContent>
        
        {/* Animated Border Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-blue/20 via-transparent to-primary-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </Card>
    </motion.div>
  );
}
