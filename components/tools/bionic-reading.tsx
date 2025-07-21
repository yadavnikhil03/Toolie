"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, RotateCcw, Download, Copy, FileText, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BionicReadingConverter: React.FC = () => {
  const [inputText, setInputText] = useState(`Bionic Reading is a new method of reading that makes it easier to read faster and with better focus. The first few letters of each word are highlighted to guide your eyes through the text.

This tool converts your regular text into Bionic Reading format by making the initial letters of words bold. Your brain can process these highlighted letters faster, allowing you to read with improved speed and comprehension.

Try pasting any article or text below to see how Bionic Reading can help you read more efficiently!`);
  
  const [fixation, setFixation] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);
  const { toast } = useToast();

  const fixationOptions = [
    { value: 'low', label: 'Low - 25%', percentage: 0.25 },
    { value: 'medium', label: 'Medium - 50%', percentage: 0.5 },
    { value: 'high', label: 'High - 75%', percentage: 0.75 }
  ];

  const convertToBionicReading = (text: string, fixationLevel: number): string => {
    return text.replace(/\b\w+\b/g, (word) => {
      if (word.length <= 1) return word;
      
      const fixationLength = Math.max(1, Math.ceil(word.length * fixationLevel));
      const boldPart = word.slice(0, fixationLength);
      const normalPart = word.slice(fixationLength);
      
      return `<strong>${boldPart}</strong>${normalPart}`;
    });
  };

  const bionicText = useMemo(() => {
    const selectedFixation = fixationOptions.find(f => f.value === fixation);
    if (!selectedFixation || !inputText.trim()) return '';
    
    return convertToBionicReading(inputText, selectedFixation.percentage);
  }, [inputText, fixation]);

  const handleReset = () => {
    setInputText('');
    toast({
      title: "Text cleared",
      description: "Input text has been reset.",
    });
  };

  const handleCopy = async (type: 'text' | 'html' | 'markdown') => {
    if (!bionicText) {
      toast({
        title: "Nothing to copy",
        description: "Please enter some text first.",
        variant: "destructive",
      });
      return;
    }

    let textToCopy = '';
    
    switch (type) {
      case 'text':
        // Remove HTML tags for plain text
        textToCopy = bionicText.replace(/<[^>]*>/g, '');
        break;
      case 'html':
        textToCopy = `<div style="${highContrast ? 'filter: contrast(150%);' : ''}">${bionicText}</div>`;
        break;
      case 'markdown':
        // Convert HTML bold to Markdown bold
        textToCopy = bionicText.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
        break;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copied!",
        description: `${type.toUpperCase()} has been copied to your clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    toast({
      title: "PDF Download",
      description: "PDF generation feature will be implemented with jsPDF library",
    });
  };

  const openBionicReadingInfo = () => {
    window.open('https://bionic-reading.com/', '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-6 w-6 text-blue-600" />
            Bionic Reading Converter
            <Button
              onClick={openBionicReadingInfo}
              variant="ghost"
              size="sm"
              className="ml-auto flex items-center gap-1 text-blue-600"
            >
              <HelpCircle className="h-4 w-4" />
              What is Bionic Reading?
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Input Text</Label>
                <Button onClick={handleReset} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your text here..."
                className="min-h-[300px] resize-none text-base"
              />
              
              {/* Settings */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label>Fixation Amount</Label>
                  <Select value={fixation} onValueChange={setFixation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fixationOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>High Contrast</Label>
                  <Switch
                    checked={highContrast}
                    onCheckedChange={setHighContrast}
                  />
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Bionic Reading Mode</Label>
              </div>
              <div 
                className={`min-h-[300px] p-4 border rounded-lg bg-white text-base leading-relaxed overflow-auto ${
                  highContrast ? 'contrast-150' : ''
                }`}
                style={{ lineHeight: '1.7' }}
                dangerouslySetInnerHTML={{ __html: bionicText || '<p class="text-gray-400">Your converted text will appear here...</p>' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center pt-4 border-t">
            <Button onClick={handleDownloadPDF} variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Download PDF
            </Button>
            
            <Button onClick={() => handleCopy('text')} variant="outline">
              <Copy className="h-4 w-4 mr-1" />
              Copy Text
            </Button>
            
            <Button onClick={() => handleCopy('html')} variant="outline">
              <FileText className="h-4 w-4 mr-1" />
              Copy HTML
            </Button>
            
            <Button onClick={() => handleCopy('markdown')} variant="outline">
              <Copy className="h-4 w-4 mr-1" />
              Copy Markdown
            </Button>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">💡 How Bionic Reading Works</h3>
            <p className="text-blue-700 text-sm leading-relaxed">
              Bionic Reading highlights the initial letters of words to guide your eyes through text. 
              Your brain processes these highlighted letters faster, allowing you to read with improved 
              speed and comprehension. The fixation percentage controls how many letters are highlighted 
              in each word.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BionicReadingConverter;
