"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

interface ToolSearchProps {
  value: string;
  onChange: (query: string) => void;
}

export function ToolSearch({ value, onChange }: ToolSearchProps) {
  return (
    <motion.div 
      className="space-y-4 mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search tools..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-10 border-gray-200 bg-white/80 backdrop-blur-sm"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
