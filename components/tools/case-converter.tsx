"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, RotateCcw, Type, ArrowRight, LetterText, Hash, Zap, Shuffle, ToggleLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const languages = [
  { value: 'en-US', label: 'English (United States)' },
  { value: 'en-GB', label: 'English (United Kingdom)' },
  { value: 'es-ES', label: 'Spanish (Spain)' },
  { value: 'es-MX', label: 'Spanish (Mexico)' },
  { value: 'fr-FR', label: 'French (France)' },
  { value: 'de-DE', label: 'German (Germany)' },
  { value: 'it-IT', label: 'Italian (Italy)' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'pt-PT', label: 'Portuguese (Portugal)' },
  { value: 'nl-NL', label: 'Dutch (Netherlands)' },
  { value: 'ru-RU', label: 'Russian (Russia)' },
  { value: 'tr-TR', label: 'Turkish (Turkey)' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
  { value: 'ja-JP', label: 'Japanese (Japan)' },
  { value: 'ko-KR', label: 'Korean (South Korea)' },
  { value: 'ar-SA', label: 'Arabic (Saudi Arabia)' },
  { value: 'hi-IN', label: 'Hindi (India)' },
];

const CaseConverter: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const { toast } = useToast();

  const convertToSentenceCase = (text: string): string => {
    return text.toLowerCase().replace(/(^\w{1}|[.!?]\s*\w{1})/g, (match) => 
      match.toUpperCase()
    );
  };

  const convertToUpperCase = (text: string): string => {
    return text.toUpperCase();
  };

  const convertToLowerCase = (text: string): string => {
    return text.toLowerCase();
  };

  const convertToTitleCase = (text: string): string => {
    return text.toLowerCase().replace(/\b\w/g, (match) => match.toUpperCase());
  };

  const convertToMixedCase = (text: string): string => {
    return text.split('').map((char, index) => 
      index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
    ).join('');
  };

  const convertToInverseCase = (text: string): string => {
    return text.split('').map(char => 
      char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
    ).join('');
  };

  const handleConversion = (conversionType: string) => {
    if (!text.trim()) {
      toast({
        title: "No text to convert",
        description: "Please enter some text first.",
        variant: "destructive",
      });
      return;
    }

    let result = '';
    switch (conversionType) {
      case 'sentence':
        result = convertToSentenceCase(text);
        break;
      case 'upper':
        result = convertToUpperCase(text);
        break;
      case 'lower':
        result = convertToLowerCase(text);
        break;
      case 'title':
        result = convertToTitleCase(text);
        break;
      case 'mixed':
        result = convertToMixedCase(text);
        break;
      case 'inverse':
        result = convertToInverseCase(text);
        break;
      default:
        result = text;
    }
    
    setText(result);
    
    toast({
      title: "Text converted!",
      description: `Applied ${conversionType} case conversion.`,
    });
  };

  const handleReset = () => {
    setText('');
    toast({
      title: "Text cleared",
      description: "Text area has been reset.",
    });
  };

  const handleCopy = async () => {
    if (!text) {
      toast({
        title: "Nothing to copy",
        description: "Please enter some text first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Text has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-6 w-6 text-blue-600" />
            Case Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Language / Locale
            </label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Text Area */}
          <div className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text..."
              className="min-h-[200px] resize-none text-base"
            />
            
            {/* Conversion Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button
                onClick={() => handleConversion('sentence')}
                variant="outline"
                className="h-16 flex flex-col items-start justify-center p-4 hover:bg-blue-50 hover:border-blue-300 transition-all"
                disabled={!text.trim()}
              >
                <div className="flex items-center gap-2 w-full">
                  <LetterText className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Sentence case</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">First letter capitalized</span>
              </Button>
              
              <Button
                onClick={() => handleConversion('upper')}
                variant="outline"
                className="h-16 flex flex-col items-start justify-center p-4 hover:bg-red-50 hover:border-red-300 transition-all"
                disabled={!text.trim()}
              >
                <div className="flex items-center gap-2 w-full">
                  <Hash className="h-4 w-4 text-red-600" />
                  <span className="font-medium">UPPER CASE</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">All letters uppercase</span>
              </Button>
              
              <Button
                onClick={() => handleConversion('lower')}
                variant="outline"
                className="h-16 flex flex-col items-start justify-center p-4 hover:bg-green-50 hover:border-green-300 transition-all"
                disabled={!text.trim()}
              >
                <div className="flex items-center gap-2 w-full">
                  <ArrowRight className="h-4 w-4 text-green-600 rotate-90" />
                  <span className="font-medium">lower case</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">All letters lowercase</span>
              </Button>
              
              <Button
                onClick={() => handleConversion('title')}
                variant="outline"
                className="h-16 flex flex-col items-start justify-center p-4 hover:bg-purple-50 hover:border-purple-300 transition-all"
                disabled={!text.trim()}
              >
                <div className="flex items-center gap-2 w-full">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Title Case</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">Each word capitalized</span>
              </Button>
              
              <Button
                onClick={() => handleConversion('mixed')}
                variant="outline"
                className="h-16 flex flex-col items-start justify-center p-4 hover:bg-orange-50 hover:border-orange-300 transition-all"
                disabled={!text.trim()}
              >
                <div className="flex items-center gap-2 w-full">
                  <Shuffle className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">MiXeD CaSe</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">Alternating upper/lower</span>
              </Button>
              
              <Button
                onClick={() => handleConversion('inverse')}
                variant="outline"
                className="h-16 flex flex-col items-start justify-center p-4 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                disabled={!text.trim()}
              >
                <div className="flex items-center gap-2 w-full">
                  <ToggleLeft className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium">iNvErSe cAsE</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">Opposite of current case</span>
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={handleCopy}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
                disabled={!text}
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseConverter;
