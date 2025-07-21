"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  Heart,
  FileText, 
  Type, 
  Image, 
  Code2, 
  Palette,
  Share2,
  Wrench,
  type LucideIcon 
} from 'lucide-react';

interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  tools: string[];
}

interface ToolCategoriesProps {
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
  className?: string;
}

const categories: ToolCategory[] = [
  {
    id: "text-tools",
    name: "Text Tools",
    description: "Text formatting and processing utilities",
    icon: Type,
    tools: ["caseConverter", "letterCounter", "textToHandwriting", "bionicReading", "googleFontsPairFinder", "textFormatter", "jsonFormatter", "base64Tool"]
  },
  {
    id: "image-tools",
    name: "Image Tools", 
    description: "Image processing and generation tools",
    icon: Image,
    tools: ["imageResize", "imageCropper", "qrCodeGen", "svgBlobGenerator", "svgPatternGenerator", "svgToPngConverter", "documentScannerEffect"]
  },
  {
    id: "coding-tools",
    name: "Coding Tools",
    description: "Developer tools and utilities",
    icon: Code2,
    tools: ["hashGenerator", "timestampConverter"]
  },
  {
    id: "color-tools",
    name: "Color Tools",
    description: "Color palettes and utilities",
    icon: Palette,
    tools: ["colorPalette"]
  },
  {
    id: "miscellaneous-tools",
    name: "Miscellaneous Tools",
    description: "Various utility tools",
    icon: Wrench,
    tools: ["passwordGenerator", "unitConverter", "pdfMerge", "mp3Trim"]
  }
];

export function ToolCategories({
  selectedCategory = "text-tools",
  onCategorySelect,
  className,
}: ToolCategoriesProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Option 1: Modern Horizontal Pills */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect?.(category.id)}
            className={cn(
              "group flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 hover:shadow-sm",
              selectedCategory === category.id
                ? "border-blue-500 bg-blue-500 text-white shadow-md"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            <category.icon className="h-4 w-4" />
            <span className="text-sm font-medium whitespace-nowrap">
              {category.name}
            </span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              selectedCategory === category.id
                ? "bg-blue-400 text-blue-50"
                : "bg-gray-100 text-gray-500"
            )}>
              {category.tools.length}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Export the categories data for use in other components
export const toolCategories: Array<{
  id: string;
  name: string;
  tools: string[];
}> = [
  {
    id: "text-tools",
    name: "Text Tools",
    tools: ["caseConverter", "letterCounter", "textToHandwriting", "bionicReading", "googleFontsPairFinder", "textFormatter", "jsonFormatter", "base64Tool"]
  },
  {
    id: "image-tools", 
    name: "Image Tools",
    tools: ["imageResize", "imageCropper", "qrCodeGen", "svgBlobGenerator", "svgPatternGenerator", "svgToPngConverter", "documentScannerEffect"]
  },
  {
    id: "coding-tools",
    name: "Coding Tools",
    tools: ["hashGenerator", "timestampConverter"]
  },
  {
    id: "color-tools",
    name: "Color Tools",
    tools: ["colorPalette"]
  },
  {
    id: "miscellaneous-tools",
    name: "Miscellaneous Tools",
    tools: ["passwordGenerator", "unitConverter", "pdfMerge", "mp3Trim"]
  }
];