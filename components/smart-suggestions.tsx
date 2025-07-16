"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, Clock, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ToolSuggestion {
  id: string;
  name: string;
  description: string;
  category: string;
  reason: string;
  popularity: number;
  estimatedTime: string;
  icon: string;
}

interface SmartSuggestionsProps {
  currentTool?: string;
  recentTools?: string[];
  className?: string;
  onToolSelect?: (toolId: string) => void;
}

export function SmartSuggestions({
  currentTool,
  recentTools = [],
  className,
  onToolSelect,
}: SmartSuggestionsProps) {
  const suggestions = generateSuggestions(currentTool, recentTools);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-dark-gray" style={{ fontFamily: 'Caveat, cursive' }}>
          <Lightbulb className="h-5 w-5 text-primary-blue" />
          Smart Suggestions
        </CardTitle>
        <CardDescription>
          Tools that might be useful for your workflow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SuggestionCard
              suggestion={suggestion}
              onSelect={() => onToolSelect?.(suggestion.id)}
            />
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

function SuggestionCard({
  suggestion,
  onSelect,
}: {
  suggestion: ToolSuggestion;
  onSelect: () => void;
}) {
  const getReasonIcon = (reason: string) => {
    if (reason.includes("popular")) return <TrendingUp className="h-4 w-4" />;
    if (reason.includes("recent")) return <Clock className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  const getReasonColor = (reason: string) => {
    if (reason.includes("popular")) return "text-green-600 bg-green-50";
    if (reason.includes("recent")) return "text-blue-600 bg-blue-50";
    return "text-purple-600 bg-purple-50";
  };

  return (
    <div className="group p-4 rounded-lg border border-gray-200 hover:border-primary-blue hover:shadow-md transition-all duration-200 cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{suggestion.icon}</span>
            <h4 className="font-semibold text-dark-gray group-hover:text-primary-blue transition-colors">
              {suggestion.name}
            </h4>
            <Badge variant="outline" className="text-xs">
              {suggestion.category}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
          
          <div className="flex items-center gap-3 mb-3">
            <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs", getReasonColor(suggestion.reason))}>
              {getReasonIcon(suggestion.reason)}
              {suggestion.reason}
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {suggestion.estimatedTime}
            </div>
            
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 w-1 rounded-full mr-1",
                      i < suggestion.popularity ? "bg-primary-blue" : "bg-gray-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">popularity</span>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onSelect}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Try it
        </Button>
      </div>
    </div>
  );
}

function generateSuggestions(currentTool?: string, recentTools: string[] = []): ToolSuggestion[] {
  const allSuggestions: ToolSuggestion[] = [
    {
      id: "image-resize",
      name: "Image Resize",
      description: "Resize and optimize your images for web or print",
      category: "Image",
      reason: "Commonly used with other image tools",
      popularity: 5,
      estimatedTime: "30 seconds",
      icon: "🖼️"
    },
    {
      id: "pdf-merge",
      name: "PDF Merge",
      description: "Combine multiple PDF files into one document",
      category: "Document",
      reason: "Popular this week",
      popularity: 4,
      estimatedTime: "1 minute",
      icon: "📄"
    },
    {
      id: "qr-code-gen",
      name: "QR Code Generator",
      description: "Generate QR codes for URLs, text, or contact info",
      category: "Generator",
      reason: "Quick and easy",
      popularity: 4,
      estimatedTime: "15 seconds",
      icon: "📱"
    },
    {
      id: "password-generator",
      name: "Password Generator",
      description: "Create secure passwords with custom criteria",
      category: "Security",
      reason: "Essential for security",
      popularity: 5,
      estimatedTime: "10 seconds",
      icon: "🔐"
    },
    {
      id: "json-formatter",
      name: "JSON Formatter",
      description: "Format, validate, and beautify JSON data",
      category: "Developer",
      reason: "Popular among developers",
      popularity: 4,
      estimatedTime: "20 seconds",
      icon: "💾"
    },
    {
      id: "hash-generator",
      name: "Hash Generator",
      description: "Generate MD5, SHA-1, SHA-256 hashes",
      category: "Security",
      reason: "Used with password tools",
      popularity: 3,
      estimatedTime: "5 seconds",
      icon: "🔗"
    }
  ];

  // Filter out current tool and recently used tools
  let suggestions = allSuggestions.filter(
    s => s.id !== currentTool && !recentTools.includes(s.id)
  );

  // Add contextual reasoning based on current tool
  if (currentTool) {
    suggestions = suggestions.map(suggestion => {
      if (currentTool === "image-resize" && suggestion.category === "Image") {
        return { ...suggestion, reason: "Works well with image tools" };
      }
      if (currentTool === "password-generator" && suggestion.id === "hash-generator") {
        return { ...suggestion, reason: "Perfect complement to passwords" };
      }
      if (currentTool === "pdf-merge" && suggestion.category === "Document") {
        return { ...suggestion, reason: "Popular document workflow" };
      }
      return suggestion;
    });
  }

  // Sort by popularity and return top 3
  return suggestions
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 3);
}
