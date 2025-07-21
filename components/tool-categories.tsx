"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  Wrench, 
  FileText, 
  Type, 
  Image, 
  Code2, 
  Zap,
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
    id: "all",
    name: "All Tools",
    description: "Browse all available tools",
    icon: Wrench,
    tools: []
  },
  {
    id: "file-processing",
    name: "File Processing",
    description: "PDF and document processing tools",
    icon: FileText,
    tools: ["pdf-merge"]
  },
  {
    id: "text-tools",
    name: "Text Tools",
    description: "Text formatting and processing utilities",
    icon: Type,
    tools: ["text-formatter", "json-formatter"]
  },
  {
    id: "media-images",
    name: "Media & Images",
    description: "Image and media processing tools",
    icon: Image,
    tools: ["image-resize", "mp3-trim", "qr-code-gen"]
  },
  {
    id: "data-code",
    name: "Data & Code",
    description: "Developer tools and data utilities",
    icon: Code2,
    tools: ["base64-tool", "hash-generator", "timestamp-converter"]
  },
  {
    id: "utilities",
    name: "Utilities",
    description: "General purpose utility tools",
    icon: Zap,
    tools: ["password-generator", "unit-converter", "color-palette"]
  }
];

export function ToolCategories({
  selectedCategory = "all",
  onCategorySelect,
  className,
}: ToolCategoriesProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
    id: "all",
    name: "All Tools",
    tools: []
  },
  {
    id: "file-processing",
    name: "File Processing", 
    tools: ["pdf-merge"]
  },
  {
    id: "text-tools",
    name: "Text Tools",
    tools: ["text-formatter", "json-formatter"]
  },
  {
    id: "media-images",
    name: "Media & Images",
    tools: ["image-resize", "mp3-trim", "qr-code-gen"]
  },
  {
    id: "data-code",
    name: "Data & Code",
    tools: ["base64-tool", "hash-generator", "timestamp-converter"]
  },
  {
    id: "utilities",
    name: "Utilities",
    tools: ["password-generator", "unit-converter", "color-palette"]
  }
];