"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from 'lucide-react';

interface ToolSearchProps {
  value: string;
  onChange: (query: string) => void;
}

export function ToolSearch({ value, onChange }: ToolSearchProps) {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <Input
        placeholder="Search tools..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-12 pr-12 py-3 text-lg border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white shadow-sm"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
