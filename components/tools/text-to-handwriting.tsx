"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, ExternalLink, Github } from 'lucide-react';

const TextToHandwriting: React.FC = () => {
  const openOriginalTool = () => {
    window.open('https://yadavnikhil03.github.io/text-to-handwriting/', '_blank');
  };

  const openGithubRepo = () => {
    window.open('https://github.com/yadavnikhil03/text-to-handwriting', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="text-center">
        <CardHeader className="pb-8">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <PenTool className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold mb-2">
            Text to Handwriting Converter
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Transform your digital text into beautiful handwritten notes
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-4">🌟 Premium Experience Available</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              For the complete Text to Handwriting experience with advanced features, 
              real-time preview, and multiple customization options, visit our dedicated tool.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-blue-600 mb-2">✨ Features Include:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Multiple handwriting styles</li>
                  <li>• Custom pen colors</li>
                  <li>• Adjustable font sizes</li>
                  <li>• Paper line options</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-green-600 mb-2">🚀 Advanced Options:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Multi-page support</li>
                  <li>• PNG & PDF export</li>
                  <li>• Real-time preview</li>
                  <li>• Mobile responsive</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={openOriginalTool}
                size="lg"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-8 py-3"
              >
                <ExternalLink className="h-5 w-5" />
                Open Text to Handwriting Tool
              </Button>
              
              <Button 
                onClick={openGithubRepo}
                variant="outline"
                size="lg"
                className="flex items-center gap-2 px-8 py-3"
              >
                <Github className="h-5 w-5" />
                View Source Code
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold mb-3">💡 Why Use the Dedicated Tool?</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">⚡</span>
                </div>
                <p className="font-medium">Optimized Performance</p>
                <p className="text-gray-600">Dedicated resources for smooth rendering</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold">🎨</span>
                </div>
                <p className="font-medium">Full Customization</p>
                <p className="text-gray-600">Complete control over styling options</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 font-bold">📱</span>
                </div>
                <p className="font-medium">Better Mobile Experience</p>
                <p className="text-gray-600">Optimized for all device sizes</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>
              Made with ❤️ by{' '}
              <a 
                href="https://github.com/yadavnikhil03" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Nikhil Yadav
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextToHandwriting;
