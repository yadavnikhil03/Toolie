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
    id: "favorite",
    name: "Favorite Tools",
    description: "Your most used tools",
    icon: Heart,
    tools: []
  },
  {
    id: "text-tools",
    name: "Text Tools",
    description: "Text formatting and processing utilities",
    icon: Type,
    tools: ["case-converter", "letter-counter", "text-formatter", "json-formatter", "base64-tool"]
  },
  {
    id: "image-tools",
    name: "Image Tools", 
    description: "Image processing and generation tools",
    icon: Image,
    tools: ["image-resize", "qr-code-gen"]
  },
  {
    id: "css-tools",
    name: "CSS Tools",
    description: "CSS and styling utilities",
    icon: Code2,
    tools: []
  },
  {
    id: "coding-tools",
    name: "Coding Tools",
    description: "Developer tools and utilities",
    icon: Code2,
    tools: ["hash-generator", "timestamp-converter"]
  },
  {
    id: "color-tools",
    name: "Color Tools",
    description: "Color palettes and utilities",
    icon: Palette,
    tools: ["color-palette"]
  },
  {
    id: "social-media-tools",
    name: "Social Media Tools",
    description: "Social media content tools",
    icon: Share2,
    tools: []
  },
  {
    id: "miscellaneous-tools",
    name: "Miscellaneous Tools",
    description: "Various utility tools",
    icon: Wrench,
    tools: ["password-generator", "unit-converter", "pdf-merge", "mp3-trim"]
  }
];

export function ToolCategories({
  selectedCategory = "favorite",
  onCategorySelect,
  className,
}: ToolCategoriesProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect?.(category.id)}
            className={cn(
              "group relative rounded-lg border p-6 text-left transition-all duration-200 hover:shadow-lg",
              selectedCategory === category.id
                ? "border-blue-300 bg-blue-50 shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
                selectedCategory === category.id
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-50 text-gray-600 group-hover:bg-gray-100"
              )}>
                <category.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className={cn(
                  "font-medium transition-colors",
                  selectedCategory === category.id
                    ? "text-blue-900"
                    : "text-gray-900 group-hover:text-gray-700"
                )}>
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {category.tools.length > 0 ? `${category.tools.length} tools` : 'All tools'}
                </p>
              </div>
            </div>
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
    id: "favorite",
    name: "Favorite Tools",
    tools: []
  },
  {
    id: "text-tools",
    name: "Text Tools",
    tools: ["case-converter", "letter-counter", "text-formatter", "json-formatter", "base64-tool"]
  },
  {
    id: "image-tools", 
    name: "Image Tools",
    tools: ["image-resize", "qr-code-gen"]
  },
  {
    id: "css-tools",
    name: "CSS Tools",
    tools: []
  },
  {
    id: "coding-tools",
    name: "Coding Tools",
    tools: ["hash-generator", "timestamp-converter"]
  },
  {
    id: "color-tools",
    name: "Color Tools",
    tools: ["color-palette"]
  },
  {
    id: "social-media-tools",
    name: "Social Media Tools",
    tools: []
  },
  {
    id: "miscellaneous-tools",
    name: "Miscellaneous Tools",
    tools: ["password-generator", "unit-converter", "pdf-merge", "mp3-trim"]
  }
];