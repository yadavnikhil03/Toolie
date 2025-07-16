"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Heart } from 'lucide-react';
import { motion } from "framer-motion";

interface RecentToolsProps {
  recentTools: Array<{
    id: string;
    name: string;
    category: string;
    lastUsed: Date;
  }>;
  favoriteTools: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  onToolSelect: (toolId: string) => void;
  onToggleFavorite: (toolId: string) => void;
}

export function RecentTools({ recentTools, favoriteTools, onToolSelect, onToggleFavorite }: RecentToolsProps) {
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Favorites Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-dark-gray" style={{ fontFamily: 'Caveat, cursive' }}>
            <Star className="h-5 w-5 text-yellow-500" />
            Favorites
          </CardTitle>
          <CardDescription>
            Your bookmarked tools for quick access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {favoriteTools.length > 0 ? (
            favoriteTools.slice(0, 3).map((tool) => (
              <div key={tool.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex-1 cursor-pointer" onClick={() => onToolSelect(tool.id)}>
                  <p className="font-medium text-sm text-gray-900">{tool.name}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {tool.category}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onToggleFavorite(tool.id)}
                >
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No favorite tools yet. Star tools to save them here!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Tools Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-dark-gray" style={{ fontFamily: 'Caveat, cursive' }}>
            <Clock className="h-5 w-5 text-blue-500" />
            Recent Tools
          </CardTitle>
          <CardDescription>
            Tools you've used recently
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentTools.length > 0 ? (
            recentTools.slice(0, 5).map((tool) => (
              <motion.div
                key={tool.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => onToolSelect(tool.id)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{tool.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {tool.category}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(tool.lastUsed)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No recent tools. Start using tools to see them here!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
