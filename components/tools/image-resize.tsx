import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { ImageIcon, Download, Upload, X, Maximize2, Minimize2 } from 'lucide-react';
import { LoadingSpinner } from "@/components/animations/loading-spinner";

interface ProcessedImage {
  original: File;
  processed?: string;
  originalUrl: string;
  width: number;
  height: number;
  size: number;
}

export function ImageResizeTool() {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [images, setImages] = React.useState<ProcessedImage[]>([]);
  const [width, setWidth] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [quality, setQuality] = React.useState([80]);
  const [format, setFormat] = React.useState("original");
  const [maintainAspectRatio, setMaintainAspectRatio] = React.useState(true);

  const resizeImage = (file: File, targetWidth: number, targetHeight: number, targetQuality: number, targetFormat: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate dimensions
        let newWidth = targetWidth || img.width;
        let newHeight = targetHeight || img.height;

        if (maintainAspectRatio) {
          if (targetWidth && targetHeight) {
            const aspectRatio = img.width / img.height;
            if (newWidth / aspectRatio > newHeight) {
              newWidth = newHeight * aspectRatio;
            } else {
              newHeight = newWidth / aspectRatio;
            }
          } else if (targetWidth) {
            newHeight = img.height * (targetWidth / img.width);
          } else if (targetHeight) {
            newWidth = img.width * (targetHeight / img.height);
          }
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and resize
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert to target format
        const outputFormat = targetFormat === 'original' 
          ? file.type 
          : `image/${targetFormat}`;
        
        const result = canvas.toDataURL(outputFormat, targetQuality / 100);
        resolve(result);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const processImages = async () => {
    if (images.length === 0) return;

    setIsLoading(true);
    const targetWidth = width ? parseInt(width) : 0;
    const targetHeight = height ? parseInt(height) : 0;

    const processedImages = await Promise.all(
      images.map(async (imageData) => {
        const processed = await resizeImage(
          imageData.original,
          targetWidth,
          targetHeight,
          quality[0],
          format
        );
        return { ...imageData, processed };
      })
    );

    setImages(processedImages);
    setIsLoading(false);
  };

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    const newImages: Promise<ProcessedImage>[] = fileArray.map(file => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      
      return new Promise<ProcessedImage>((resolve) => {
        img.onload = () => {
          resolve({
            original: file,
            originalUrl: url,
            width: img.width,
            height: img.height,
            size: file.size
          });
        };
        img.src = url;
      });
    });

    Promise.all(newImages).then(results => {
      setImages(prev => [...prev, ...results]);
    });
  };

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
    handleFiles(e.dataTransfer.files);
  };

  const downloadImage = (imageData: ProcessedImage, index: number) => {
    if (!imageData.processed) return;

    const link = document.createElement('a');
    link.href = imageData.processed;
    const extension = format === 'original' 
      ? imageData.original.name.split('.').pop() 
      : format;
    link.download = `resized-${index + 1}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllImages = () => {
    images.forEach((imageData, index) => {
      if (imageData.processed) {
        setTimeout(() => downloadImage(imageData, index), index * 100);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].originalUrl);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.originalUrl));
    setImages([]);
    setWidth("");
    setHeight("");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <p className="text-sm text-secondary-gray">
        Resize images to specific dimensions or convert them to different formats with quality control.
      </p>

      <motion.div
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-all duration-300 ${
          isDragging
            ? "border-primary-blue bg-blue-50 shadow-lg"
            : "border-gray-300 bg-gray-50 hover:border-primary-blue hover:bg-blue-50"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ImageIcon className="mb-3 h-10 w-10 text-primary-blue" />
        <p className="text-lg font-semibold text-dark-gray">Drag & Drop Images Here</p>
        <p className="text-sm text-secondary-gray">or click to select files (JPG, PNG, WebP, GIF)</p>
        <Input
          type="file"
          multiple
          accept="image/*"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(e.target.files);
            }
          }}
        />
      </motion.div>

      {images.length > 0 && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label className="text-dark-gray font-medium text-lg">Resize Settings</Label>
          <p className="text-sm text-secondary-gray mb-2">
            Enter width/height to resize, or leave blank to only convert format/adjust quality
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="width" className="text-dark-gray mb-2 block">Width (px)</Label>
              <Input 
                id="width" 
                type="number" 
                placeholder="Auto" 
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="border-gray-200 bg-gray-50" 
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-dark-gray mb-2 block">Height (px)</Label>
              <Input 
                id="height" 
                type="number" 
                placeholder="Auto" 
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="border-gray-200 bg-gray-50" 
              />
            </div>
            <div>
              <Label htmlFor="format" className="text-dark-gray mb-2 block">Convert To</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="border-gray-200 bg-gray-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Keep Original</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-dark-gray mb-2 block">
                Quality: {quality[0]}%
              </Label>
              <Slider
                value={quality}
                onValueChange={setQuality}
                max={100}
                min={1}
                step={1}
                className="w-full mt-2"
              />
            </div>
          </div>

          {/* Preset Size Options */}
          <div className="space-y-2">
            <Label className="text-dark-gray font-medium">Quick Size Presets</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => { setWidth("1920"); setHeight("1080"); }}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                1920×1080 (HD)
              </Button>
              <Button
                onClick={() => { setWidth("1280"); setHeight("720"); }}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                1280×720 (HD)
              </Button>
              <Button
                onClick={() => { setWidth("800"); setHeight("600"); }}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                800×600
              </Button>
              <Button
                onClick={() => { setWidth("500"); setHeight("500"); }}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                500×500 (Square)
              </Button>
              <Button
                onClick={() => { setWidth("300"); setHeight("300"); }}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                300×300 (Thumbnail)
              </Button>
              <Button
                onClick={() => { setWidth(""); setHeight(""); }}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Original Size
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="aspect-ratio"
              checked={maintainAspectRatio}
              onCheckedChange={(checked) => setMaintainAspectRatio(!!checked)}
            />
            <Label htmlFor="aspect-ratio" className="text-dark-gray">Maintain aspect ratio</Label>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={processImages}
              className="bg-primary-blue hover:bg-blue-600 text-white"
              disabled={isLoading || images.length === 0}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size={16} />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  {(!width && !height) ? "Convert Format/Quality" : "Resize Images"}
                </>
              )}
            </Button>
            <Button
              onClick={clearAll}
              variant="outline"
              className="border-gray-200 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </motion.div>
      )}

      {images.length > 0 && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <Label className="text-dark-gray font-medium text-lg">
              Images ({images.length})
            </Label>
            {images.some(img => img.processed) && (
              <Button
                onClick={downloadAllImages}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((imageData, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-medium text-dark-gray truncate">
                    {imageData.original.name}
                  </h4>
                  <Button
                    onClick={() => removeImage(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="aspect-video relative mb-3 bg-gray-100 rounded overflow-hidden">
                  <img
                    src={imageData.processed || imageData.originalUrl}
                    alt={imageData.original.name}
                    className="w-full h-full object-contain"
                  />
                  {imageData.processed && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                      Processed
                    </div>
                  )}
                </div>

                <div className="text-xs text-secondary-gray space-y-1">
                  <div>Size: {imageData.width} × {imageData.height}</div>
                  <div>File size: {formatFileSize(imageData.size)}</div>
                </div>

                {imageData.processed && (
                  <Button
                    onClick={() => downloadImage(imageData, index)}
                    className="w-full mt-3 bg-primary-blue hover:bg-blue-600 text-white text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
