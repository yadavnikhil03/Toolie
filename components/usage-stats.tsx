"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Zap, Award } from 'lucide-react';
import { motion } from "framer-motion";

interface UsageStatsProps {
  totalTools: number;
  toolsUsed: number;
  totalUsage: number;
  favoriteCount: number;
}

export function UsageStats({ totalTools, toolsUsed, totalUsage, favoriteCount }: UsageStatsProps) {
  const achievements = [
    { id: 'first-use', name: 'First Steps', description: 'Used your first tool', unlocked: totalUsage > 0 },
    { id: 'power-user', name: 'Power User', description: 'Used 5 different tools', unlocked: toolsUsed >= 5 },
    { id: 'tool-master', name: 'Tool Master', description: 'Used all 12 tools', unlocked: toolsUsed >= 12 },
    { id: 'productive', name: 'Productive', description: 'Completed 50 operations', unlocked: totalUsage >= 50 },
    { id: 'streak', name: 'On Fire!', description: '7-day usage streak', unlocked: favoriteCount >= 3 },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Total Operations */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{totalUsage}</div>
          <p className="text-xs text-blue-600">Total tasks completed</p>
        </CardContent>
      </Card>

      {/* Tools Explored */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tools Explored
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {toolsUsed}/{totalTools}
          </div>
          <Progress 
            value={(toolsUsed / totalTools) * 100} 
            className="mt-2 h-2"
          />
        </CardContent>
      </Card>

      {/* Usage Streak */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">{favoriteCount}</div>
          <p className="text-xs text-orange-600">Days in a row</p>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">
            {unlockedCount}/{achievements.length}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {achievements.slice(0, 3).map((achievement) => (
              <Badge
                key={achievement.id}
                variant={achievement.unlocked ? "default" : "outline"}
                className={`text-xs ${
                  achievement.unlocked 
                    ? 'bg-purple-600 text-white' 
                    : 'text-purple-400 border-purple-200'
                }`}
              >
                {achievement.unlocked ? '🏆' : '🔒'}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
