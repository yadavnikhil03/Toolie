import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { FileInput } from 'lucide-react';
import { LoadingSpinner } from "@/components/animations/loading-spinner";

export function PdfMergeTool() {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    console.log("Dropped files:", files);
    // Here you would process the files, e.g., upload to backend
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000); // Simulate loading
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Merge multiple PDF files into one, or split a single PDF into multiple documents.
      </p>

      <motion.div
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-all duration-300 ${
          isDragging
            ? "border-mint-green bg-mint-green/10 shadow-lg shadow-mint-green/30 animate-border-pulse"
            : "border-neon-blue/50 bg-neon-blue/10"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <FileInput className="mb-3 h-10 w-10 text-neon-blue" />
        <p className="text-lg font-semibold text-neon-blue">Drag & Drop PDFs Here</p>
        <p className="text-sm text-muted-foreground">or click to select files</p>
        <Input
          type="file"
          multiple
          accept=".pdf"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            console.log("Selected files:", files);
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 2000); // Simulate loading
          }}
        />
        {isDragging && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 border-4 border-mint-green rounded-lg animate-border-pulse"></div>
          </div>
        )}
      </motion.div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="merge-options" className="text-mint-green">Merge Options</Label>
          <Input id="merge-options" placeholder="e.g., 'pages 1-5, 10-12'" className="mt-1 bg-card/50 border-neon-blue/30 text-neon-blue" />
        </div>
        <div>
          <Label htmlFor="split-page" className="text-mint-green">Split Page Number</Label>
          <Input id="split-page" type="number" placeholder="e.g., 5" className="mt-1 bg-card/50 border-neon-blue/30 text-neon-blue" />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="glass-neon" onClick={() => console.log("Merge PDF")}>
          {isLoading ? <LoadingSpinner size={20} /> : "Merge PDFs"}
        </Button>
        <Button variant="glass-neon" onClick={() => console.log("Split PDF")}>
          {isLoading ? <LoadingSpinner size={20} /> : "Split PDF"}
        </Button>
      </div>

      {isLoading && (
        <div className="mt-4 text-center text-mint-green">
          Processing files...
        </div>
      )}
    </div>
  );
}
