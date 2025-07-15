import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Type, Tally1Icon as Count, CaseSensitive } from 'lucide-react';

export function TextFormatterTool() {
  const [text, setText] = React.useState("");
  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

  const toUpperCase = () => setText(text.toUpperCase());
  const toLowerCase = () => setText(text.toLowerCase());
  const toTitleCase = () => {
    setText(text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()));
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
        className="flex flex-wrap gap-3 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button 
          variant="default" 
          onClick={toUpperCase}
          className="bg-primary-blue hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105"
        >
          <CaseSensitive className="h-4 w-4 mr-2" /> UPPERCASE
        </Button>
        <Button 
          variant="default" 
          onClick={toLowerCase}
          className="bg-primary-blue hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105"
        >
          <CaseSensitive className="h-4 w-4 mr-2" /> lowercase
        </Button>
        <Button 
          variant="default" 
          onClick={toTitleCase}
          className="bg-primary-blue hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105"
        >
          <CaseSensitive className="h-4 w-4 mr-2" /> Title Case
        </Button>
      </motion.div>

      <motion.div 
        className="grid grid-cols-2 gap-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="rounded-xl bg-gray-50 border-2 border-gray-100 p-6 hover:border-primary-blue/30 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-center text-primary-blue text-lg font-semibold mb-3" style={{ fontFamily: 'Caveat, cursive' }}>
            <Count className="h-5 w-5 mr-2" /> Characters
          </div>
          <p className="text-4xl font-bold text-dark-gray" style={{ fontFamily: 'Poppins, sans-serif' }}>{charCount}</p>
        </div>
        <div className="rounded-xl bg-gray-50 border-2 border-gray-100 p-6 hover:border-primary-blue/30 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-center text-primary-blue text-lg font-semibold mb-3" style={{ fontFamily: 'Caveat, cursive' }}>
            <Count className="h-5 w-5 mr-2" /> Words
          </div>
          <p className="text-4xl font-bold text-dark-gray" style={{ fontFamily: 'Poppins, sans-serif' }}>{wordCount}</p>
        </div>
      </motion.div>
    </div>
  );
}
