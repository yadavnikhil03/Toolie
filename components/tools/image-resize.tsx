import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { ImageIcon } from 'lucide-react';
import { LoadingSpinner } from "@/components/animations/loading-spinner";

export function ImageResizeTool() {
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
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000); // Simulate loading
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Resize images to specific dimensions or convert them to different formats (JPG, PNG, WebP).
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
        <ImageIcon className="mb-3 h-10 w-10 text-neon-blue" />
        <p className="text-lg font-semibold text-neon-blue">Drag & Drop Images Here</p>
        <p className="text-sm text-muted-foreground">or click to select files</p>
        <Input
          type="file"
          multiple
          accept="image/*"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="width" className="text-mint-green">Width (px)</Label>
          <Input id="width" type="number" placeholder="e.g., 1920" className="mt-1 bg-card/50 border-neon-blue/30 text-neon-blue" />
        </div>
        <div>
          <Label htmlFor="height" className="text-mint-green">Height (px)</Label>
          <Input id="height" type="number" placeholder="e.g., 1080" className="mt-1 bg-card/50 border-neon-blue/30 text-neon-blue" />
        </div>
        <div>
          <Label htmlFor="format" className="text-mint-green">Convert To</Label>
          <Select>
            <SelectTrigger className="mt-1 bg-card/50 border-neon-blue/30 text-neon-blue">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent className="bg-card border-neon-blue/50 text-neon-blue">
              <SelectItem value="jpg">JPG</SelectItem>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="webp">WebP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="quality" className="text-mint-green">Quality (1-100)</Label>
          <Input id="quality" type="number" min="1" max="100" defaultValue="80" className="mt-1 bg-card/50 border-neon-blue/30 text-neon-blue" />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="glass-neon" onClick={() => console.log("Resize/Convert Image")}>
          {isLoading ? <LoadingSpinner size={20} /> : "Process Image"}
        </Button>
      </div>

      {isLoading && (
        <div className="mt-4 text-center text-mint-green">
          Processing image...
        </div>
      )}
    </div>
  );
}
