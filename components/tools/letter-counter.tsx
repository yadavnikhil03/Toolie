"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calculator, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface LimitRule {
  name: string;
  type: 'letter' | 'word';
  limitType: 'max' | 'min';
  value: number;
  category: string;
}

const limits: LimitRule[] = [
  // SEO & Web
  { name: 'Meta Title', type: 'letter', limitType: 'max', value: 55, category: 'SEO & Web' },
  { name: 'Meta Description', type: 'letter', limitType: 'max', value: 160, category: 'SEO & Web' },
  { name: 'Google Ideal Post Content', type: 'word', limitType: 'min', value: 300, category: 'SEO & Web' },
  
  // Social Media
  { name: 'Instagram Captions/Comments', type: 'letter', limitType: 'max', value: 2200, category: 'Instagram' },
  { name: 'Twitter Post', type: 'letter', limitType: 'max', value: 280, category: 'Twitter' },
  { name: 'Twitter Username', type: 'letter', limitType: 'max', value: 20, category: 'Twitter' },
  { name: 'Facebook Wall Post (Truncation)', type: 'letter', limitType: 'max', value: 477, category: 'Facebook' },
  { name: 'Facebook Wall Post (All)', type: 'letter', limitType: 'max', value: 63206, category: 'Facebook' },
  { name: 'Facebook Comment', type: 'letter', limitType: 'max', value: 8000, category: 'Facebook' },
  { name: 'Facebook Page Description', type: 'letter', limitType: 'max', value: 255, category: 'Facebook' },
  { name: 'Facebook Username', type: 'letter', limitType: 'max', value: 50, category: 'Facebook' },
  { name: 'Facebook Messenger Message', type: 'letter', limitType: 'max', value: 20000, category: 'Facebook' },
  { name: 'YouTube Video Title', type: 'letter', limitType: 'max', value: 70, category: 'YouTube' },
  { name: 'YouTube Video Description', type: 'letter', limitType: 'max', value: 5000, category: 'YouTube' },
  { name: 'Snapchat Caption', type: 'letter', limitType: 'max', value: 250, category: 'Snapchat' },
  { name: 'Pinterest Pin Description', type: 'letter', limitType: 'max', value: 500, category: 'Pinterest' },
];

const LetterCounter: React.FC = () => {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const letters = text.length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    return { letters, words, sentences };
  }, [text]);

  const getStatusIcon = (rule: LimitRule, value: number) => {
    const isWithinLimit = rule.limitType === 'max' ? value <= rule.value : value >= rule.value;
    
    if (isWithinLimit) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (rule.limitType === 'max' && value > rule.value * 0.9) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (rule: LimitRule, value: number) => {
    const isWithinLimit = rule.limitType === 'max' ? value <= rule.value : value >= rule.value;
    
    if (isWithinLimit) {
      return 'bg-green-50 text-green-700 border-green-200';
    } else if (rule.limitType === 'max' && value > rule.value * 0.9) {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    } else {
      return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const groupedLimits = limits.reduce((acc, limit) => {
    if (!acc[limit.category]) {
      acc[limit.category] = [];
    }
    acc[limit.category].push(limit);
    return acc;
  }, {} as Record<string, LimitRule[]>);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600" />
            Letter Counter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Area */}
          <div className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text..."
              className="min-h-[200px] resize-none text-base"
            />
            
            {/* Stats Display */}
            <div className="flex justify-center gap-8 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.sentences}</div>
                <div className="text-sm text-gray-600">sentence{stats.sentences !== 1 ? 's' : ''}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.words}</div>
                <div className="text-sm text-gray-600">word{stats.words !== 1 ? 's' : ''}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.letters}</div>
                <div className="text-sm text-gray-600">letter{stats.letters !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Web and Social Media Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Web and Social Media Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(groupedLimits).map(([category, rules]) => (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold text-gray-800 border-b pb-2">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rules.map((rule) => {
                    const currentValue = rule.type === 'letter' ? stats.letters : stats.words;
                    const isWithinLimit = rule.limitType === 'max' ? currentValue <= rule.value : currentValue >= rule.value;
                    
                    return (
                      <div
                        key={rule.name}
                        className={`p-3 rounded-lg border transition-all ${getStatusColor(rule, currentValue)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{rule.name}</span>
                          {getStatusIcon(rule, currentValue)}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span>
                            {rule.limitType === 'max' ? 'Max' : 'Min'} {rule.value} {rule.type === 'letter' ? 'chars' : 'words'}
                          </span>
                          <Badge 
                            variant={isWithinLimit ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {currentValue}/{rule.value}
                          </Badge>
                        </div>
                        {rule.limitType === 'max' && currentValue > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  currentValue <= rule.value 
                                    ? 'bg-green-500' 
                                    : currentValue <= rule.value * 1.1 
                                    ? 'bg-yellow-500' 
                                    : 'bg-red-500'
                                }`}
                                style={{
                                  width: `${Math.min((currentValue / rule.value) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LetterCounter;
