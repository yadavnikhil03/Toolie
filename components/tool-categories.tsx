"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  gradient: string;
  tools: string[];
  color: string;
}

interface ToolCategoriesProps {
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
  className?: string;
}

export function ToolCategories({
  selectedCategory,
  onCategorySelect,
  className,
}: ToolCategoriesProps) {
  const categories: ToolCategory[] = [
    {
      id: "all",
      name: "All Tools",
      description: "Browse all available tools",
      icon: Wrench,
      gradient: "from-gray-500 to-gray-600",
      tools: [],
      color: "gray"
    },
    {
      id: "file-processing",
      name: "File Processing",
      description: "PDF and document processing tools",
      icon: FileText,
      gradient: "from-green-500 to-teal-600",
      tools: ["pdf-merge"],
      color: "green"
    },
    {
      id: "text-tools",
      name: "Text Tools",
      description: "Text formatting and processing utilities",
      icon: Type,
      gradient: "from-purple-500 to-pink-600",
      tools: ["text-formatter", "json-formatter"],
      color: "purple"
    },
    {
      id: "media-images",
      name: "Media & Images",
      description: "Image and media processing tools",
      icon: Image,
      gradient: "from-blue-500 to-purple-600",
      tools: ["image-resize", "mp3-trim", "qr-code-gen"],
      color: "blue"
    },
    {
      id: "data-code",
      name: "Data & Code",
      description: "Developer tools and data utilities",
      icon: Code2,
      gradient: "from-orange-500 to-red-600",
      tools: ["base64-tool", "hash-generator", "timestamp-converter"],
      color: "orange"
    },
    {
      id: "utilities",
      name: "Utilities",
      description: "General purpose utility tools",
      icon: Zap,
      gradient: "from-teal-500 to-cyan-600",
      tools: ["password-generator", "unit-converter", "color-palette"],
      color: "teal"
    }
  ];

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category, index) => {
          const IconComponent = category.icon;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105",
                  selectedCategory === category.id
                    ? "ring-2 ring-primary shadow-lg"
                    : "hover:shadow-md"
                )}
                onClick={() => onCategorySelect?.(category.id)}
              >
                <CardContent className="p-4">
                  <div className={cn(
                    "w-full h-24 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3 relative overflow-hidden",
                    category.gradient
                  )}>
                    <div className="absolute inset-0 bg-black/10" />
                    <IconComponent className="h-8 w-8 text-white relative z-10" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-center">{category.name}</h3>
                    <p className="text-xs text-muted-foreground text-center line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                  
                  {category.tools.length > 0 && (
                    <div className="mt-2 flex justify-center">
                      <Badge variant="secondary" className="text-xs">
                        {category.tools.length} tools
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
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