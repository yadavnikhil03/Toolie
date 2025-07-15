"use client";

import { motion } from "framer-motion";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
}

export function ToolCard({
  title,
  description,
  icon: Icon,
  onClick,
  className,
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
          <motion.div
            whileHover={{ rotate: 360, scale: 1.2 }}
            transition={{ duration: 0.3 }}
          >
            <Icon className="h-7 w-7 text-primary-blue group-hover:text-blue-600 transition-colors duration-300" />
          </motion.div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary-gray group-hover:text-gray-600 transition-colors duration-300" style={{ fontFamily: 'Poppins, sans-serif' }}>{description}</p>
        </CardContent>
        
        {/* Animated Border Effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-blue/20 via-transparent to-primary-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </Card>
    </motion.div>
  );
}
