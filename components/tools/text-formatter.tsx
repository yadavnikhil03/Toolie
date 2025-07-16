import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Type, Tally1Icon as Count, CaseSensitive, Copy, RotateCcw } from 'lucide-react';

export function TextFormatterTool() {
  const [text, setText] = React.useState("");
  const [copied, setCopied] = React.useState("");
  
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const sentenceCount = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  const paragraphCount = text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;
  const lineCount = text.split('\n').length;

  const toUpperCase = () => setText(text.toUpperCase());
  const toLowerCase = () => setText(text.toLowerCase());
  const toTitleCase = () => {
    setText(text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()));
  };
  const toSentenceCase = () => {
    setText(text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (match) => match.toUpperCase()));
  };
  const toAlternatingCase = () => {
    setText(text.split('').map((char, index) => 
      index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
    ).join(''));
  };
  const toInverseCase = () => {
    setText(text.split('').map(char => 
      char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
    ).join(''));
  };
  const removeExtraSpaces = () => {
    setText(text.replace(/\s+/g, ' ').trim());
  };
  const removeDuplicateLines = () => {
    const lines = text.split('\n');
    const uniqueLines = [...new Set(lines)];
    setText(uniqueLines.join('\n'));
  };
  const sortLines = () => {
    const lines = text.split('\n');
    const sortedLines = lines.sort();
    setText(sortedLines.join('\n'));
  };
  const reverseText = () => {
    setText(text.split('').reverse().join(''));
  };
  const clearText = () => {
    setText("");
    setCopied("");
  };

  const copyToClipboard = async (textToCopy: string, type: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(type);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <p className="text-sm text-secondary-gray">
        Convert text case (uppercase, lowercase, title case) and get character/word counts.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Label htmlFor="text-input" className="text-dark-gray flex items-center mb-2 font-medium">
          <Type className="h-4 w-4 mr-2" /> Enter your text
        </Label>
        <Textarea
          id="text-input"
          placeholder="Type or paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[150px] bg-white border-gray-200 text-dark-gray placeholder:text-secondary-gray focus:border-primary-blue transition-colors duration-200"
        />
      </motion.div>

      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button 
          onClick={toUpperCase}
          disabled={!text}
          className="bg-primary-blue hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105 text-sm"
        >
          <CaseSensitive className="h-4 w-4 mr-1" /> UPPERCASE
        </Button>
        <Button 
          onClick={toLowerCase}
          disabled={!text}
          className="bg-primary-blue hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105 text-sm"
        >
          <CaseSensitive className="h-4 w-4 mr-1" /> lowercase
        </Button>
        <Button 
          onClick={toTitleCase}
          disabled={!text}
          className="bg-primary-blue hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105 text-sm"
        >
          <CaseSensitive className="h-4 w-4 mr-1" /> Title Case
        </Button>
        <Button 
          onClick={toSentenceCase}
          disabled={!text}
          className="bg-primary-blue hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105 text-sm"
        >
          <CaseSensitive className="h-4 w-4 mr-1" /> Sentence case
        </Button>
        <Button 
          onClick={toAlternatingCase}
          disabled={!text}
          className="bg-primary-blue hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105 text-sm"
        >
          <CaseSensitive className="h-4 w-4 mr-1" /> aLtErNaTiNg
        </Button>
        <Button 
          onClick={toInverseCase}
          disabled={!text}
          className="bg-primary-blue hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105 text-sm"
        >
          <CaseSensitive className="h-4 w-4 mr-1" /> iNVERSE
        </Button>
      </motion.div>

      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          onClick={removeExtraSpaces}
          disabled={!text}
          variant="outline"
          className="border-gray-200 hover:bg-gray-50 text-sm"
        >
          Remove Extra Spaces
        </Button>
        <Button 
          onClick={removeDuplicateLines}
          disabled={!text}
          variant="outline"
          className="border-gray-200 hover:bg-gray-50 text-sm"
        >
          Remove Duplicates
        </Button>
        <Button 
          onClick={sortLines}
          disabled={!text}
          variant="outline"
          className="border-gray-200 hover:bg-gray-50 text-sm"
        >
          Sort Lines
        </Button>
        <Button 
          onClick={reverseText}
          disabled={!text}
          variant="outline"
          className="border-gray-200 hover:bg-gray-50 text-sm"
        >
          Reverse Text
        </Button>
      </motion.div>

      <motion.div 
        className="flex gap-3 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button 
          onClick={() => copyToClipboard(text, "text")}
          disabled={!text}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {copied === "text" ? "Copied!" : <><Copy className="h-4 w-4 mr-2" />Copy Text</>}
        </Button>
        <Button 
          onClick={clearText}
          disabled={!text}
          variant="outline"
          className="border-red-200 hover:bg-red-50 text-red-600"
        >
          <RotateCcw className="h-4 w-4 mr-2" />Clear
        </Button>
      </motion.div>

      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="rounded-xl bg-gray-50 border-2 border-gray-100 p-4 hover:border-primary-blue/30 transition-all duration-300 hover:shadow-lg text-center">
          <div className="flex items-center justify-center text-primary-blue text-sm font-semibold mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
            <Count className="h-4 w-4 mr-1" /> Characters
          </div>
          <p className="text-2xl font-bold text-dark-gray" style={{ fontFamily: 'Poppins, sans-serif' }}>{charCount}</p>
        </div>
        <div className="rounded-xl bg-gray-50 border-2 border-gray-100 p-4 hover:border-primary-blue/30 transition-all duration-300 hover:shadow-lg text-center">
          <div className="flex items-center justify-center text-primary-blue text-sm font-semibold mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
            <Count className="h-4 w-4 mr-1" /> No Spaces
          </div>
          <p className="text-2xl font-bold text-dark-gray" style={{ fontFamily: 'Poppins, sans-serif' }}>{charCountNoSpaces}</p>
        </div>
        <div className="rounded-xl bg-gray-50 border-2 border-gray-100 p-4 hover:border-primary-blue/30 transition-all duration-300 hover:shadow-lg text-center">
          <div className="flex items-center justify-center text-primary-blue text-sm font-semibold mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
            <Count className="h-4 w-4 mr-1" /> Words
          </div>
          <p className="text-2xl font-bold text-dark-gray" style={{ fontFamily: 'Poppins, sans-serif' }}>{wordCount}</p>
        </div>
        <div className="rounded-xl bg-gray-50 border-2 border-gray-100 p-4 hover:border-primary-blue/30 transition-all duration-300 hover:shadow-lg text-center">
          <div className="flex items-center justify-center text-primary-blue text-sm font-semibold mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
            <Count className="h-4 w-4 mr-1" /> Sentences
          </div>
          <p className="text-2xl font-bold text-dark-gray" style={{ fontFamily: 'Poppins, sans-serif' }}>{sentenceCount}</p>
        </div>
        <div className="rounded-xl bg-gray-50 border-2 border-gray-100 p-4 hover:border-primary-blue/30 transition-all duration-300 hover:shadow-lg text-center">
          <div className="flex items-center justify-center text-primary-blue text-sm font-semibold mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
            <Count className="h-4 w-4 mr-1" /> Paragraphs
          </div>
          <p className="text-2xl font-bold text-dark-gray" style={{ fontFamily: 'Poppins, sans-serif' }}>{paragraphCount}</p>
        </div>
        <div className="rounded-xl bg-gray-50 border-2 border-gray-100 p-4 hover:border-primary-blue/30 transition-all duration-300 hover:shadow-lg text-center">
          <div className="flex items-center justify-center text-primary-blue text-sm font-semibold mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
            <Count className="h-4 w-4 mr-1" /> Lines
          </div>
          <p className="text-2xl font-bold text-dark-gray" style={{ fontFamily: 'Poppins, sans-serif' }}>{lineCount}</p>
        </div>
      </motion.div>
    </div>
  );
}
