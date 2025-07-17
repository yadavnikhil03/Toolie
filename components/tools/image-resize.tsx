import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { ImageIcon, Download, Upload, X, Maximize2, Minimize2, Target } from 'lucide-react';
import { LoadingSpinner } from "@/components/animations/loading-spinner";

interface ProcessedImage {
  original: File;
  processed?: string;
  originalUrl: string;
  width: number;
  height: number;
  size: number;
  finalQuality?: number;
  finalSize?: number;
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
  const [targetSize, setTargetSize] = React.useState("");
  const [targetSizeUnit, setTargetSizeUnit] = React.useState("KB");
  const [useTargetSize, setUseTargetSize] = React.useState(false);

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

  const compressToTargetSize = async (file: File, targetWidth: number, targetHeight: number, targetFormat: string, targetSizeBytes: number): Promise<{ dataUrl: string, finalQuality: number, finalSize: number }> => {
    // If no specific dimensions, start with original and scale down if needed
    const img = new Image();
    const originalUrl = URL.createObjectURL(file);
    
    return new Promise((resolve) => {
      img.onload = async () => {
        let currentWidth = targetWidth || img.width;
        let currentHeight = targetHeight || img.height;
        
        // If maintaining aspect ratio and only one dimension specified
        if (maintainAspectRatio) {
          if (targetWidth && !targetHeight) {
            currentHeight = img.height * (targetWidth / img.width);
          } else if (targetHeight && !targetWidth) {
            currentWidth = img.width * (targetHeight / img.height);
          }
        }
        
        let bestResult = "";
        let finalQuality = 80;
        let finalSize = 0;
        let scaleFactor = 1;

        // First try with original dimensions and binary search quality
        for (let attempt = 0; attempt < 3; attempt++) {
          const testWidth = Math.floor(currentWidth * scaleFactor);
          const testHeight = Math.floor(currentHeight * scaleFactor);
          
          let minQuality = 1;
          let maxQuality = 100;
          let bestQualityResult = "";
          let bestQuality = 1;
          
          // Binary search for optimal quality at current dimensions
          for (let i = 0; i < 12; i++) {
            const currentQuality = Math.floor((minQuality + maxQuality) / 2);
            const result = await resizeImage(file, testWidth, testHeight, currentQuality, targetFormat);
            
            // Convert data URL to blob to get accurate file size
            const response = await fetch(result);
            const blob = await response.blob();
            const actualSize = blob.size;
            
            if (actualSize <= targetSizeBytes) {
              bestQualityResult = result;
              bestQuality = currentQuality;
              finalSize = actualSize;
              minQuality = currentQuality + 1;
            } else {
              maxQuality = currentQuality - 1;
            }

            if (minQuality > maxQuality) break;
          }
          
          if (bestQualityResult && finalSize <= targetSizeBytes) {
            bestResult = bestQualityResult;
            finalQuality = bestQuality;
            break;
          }
          
          // If still too large, reduce dimensions by 20%
          scaleFactor *= 0.8;
          
          // Don't go below 100px width
          if (currentWidth * scaleFactor < 100) break;
        }
        
        // If still no result, use minimum quality with heavily reduced dimensions
        if (!bestResult) {
          const minWidth = Math.max(100, Math.floor(currentWidth * 0.5));
          const minHeight = Math.floor(minWidth * (currentHeight / currentWidth));
          bestResult = await resizeImage(file, minWidth, minHeight, 1, targetFormat);
          finalQuality = 1;
          
          const response = await fetch(bestResult);
          const blob = await response.blob();
          finalSize = blob.size;
        }
        
        URL.revokeObjectURL(originalUrl);
        resolve({ dataUrl: bestResult, finalQuality, finalSize });
      };
      
      img.src = originalUrl;
    });
  };

  const getTargetSizeInBytes = () => {
    const size = parseFloat(targetSize);
    if (isNaN(size)) return 0;
    
    switch (targetSizeUnit) {
      case "KB": return size * 1024;
      case "MB": return size * 1024 * 1024;
      case "Bytes": return size;
      default: return 0;
    }
  };

  const processImages = async () => {
    if (images.length === 0) return;

    setIsLoading(true);
    const targetWidth = width ? parseInt(width) : 0;
    const targetHeight = height ? parseInt(height) : 0;
    const targetSizeBytes = useTargetSize ? getTargetSizeInBytes() : 0;

    const processedImages = await Promise.all(
      images.map(async (imageData) => {
        let processed: string;
        let finalQuality = quality[0];
        let finalSize = 0;

        if (useTargetSize && targetSizeBytes > 0) {
          // For target size, prefer JPEG for better compression unless PNG specified
          const compressionFormat = format === 'original' ? 'jpeg' : format;
          const result = await compressToTargetSize(
            imageData.original,
            targetWidth,
            targetHeight,
            compressionFormat,
            targetSizeBytes
          );
          processed = result.dataUrl;
          finalQuality = result.finalQuality;
          finalSize = result.finalSize;
        } else {
          processed = await resizeImage(
            imageData.original,
            targetWidth,
            targetHeight,
            quality[0],
            format
          );
          // Calculate final size for regular processing using blob
          const response = await fetch(processed);
          const blob = await response.blob();
          finalSize = blob.size;
        }

        return { ...imageData, processed, finalQuality, finalSize };
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
    setTargetSize("");
    setUseTargetSize(false);
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
        Resize images to specific dimensions, target file sizes, or convert them to different formats with quality control.
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
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label className="text-dark-gray font-medium text-lg">Resize Settings</Label>
          <p className="text-sm text-secondary-gray mb-2">
            Enter dimensions to resize, target file size, or adjust quality/format
          </p>
          
          {/* Target Size Options */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="target-size"
                checked={useTargetSize}
                onCheckedChange={(checked) => setUseTargetSize(!!checked)}
              />
              <Label htmlFor="target-size" className="text-dark-gray font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Target File Size
              </Label>
            </div>
            
            {useTargetSize && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="target-size-value" className="text-dark-gray mb-2 block text-sm">Size</Label>
                  <Input 
                    id="target-size-value"
                    type="number" 
                    placeholder="e.g., 99" 
                    value={targetSize}
                    onChange={(e) => setTargetSize(e.target.value)}
                    className="border-gray-200 bg-white" 
                  />
                </div>
                <div>
                  <Label htmlFor="target-size-unit" className="text-dark-gray mb-2 block text-sm">Unit</Label>
                  <Select value={targetSizeUnit} onValueChange={setTargetSizeUnit}>
                    <SelectTrigger className="border-gray-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KB">KB</SelectItem>
                      <SelectItem value="MB">MB</SelectItem>
                      <SelectItem value="Bytes">Bytes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {useTargetSize && (
              <div className="text-xs text-gray-600 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="font-medium mb-1">🎯 Smart Compression Mode:</p>
                <p>• Automatically adjusts quality AND dimensions if needed</p>
                <p>• Prefers JPEG format for better compression</p>
                <p>• May reduce image size to reach target file size</p>
              </div>
            )}
          </div>

          {/* Dimension Settings */}
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
                disabled={useTargetSize && !width && !height}
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
                disabled={useTargetSize && !width && !height}
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
                disabled={useTargetSize}
              />
              {useTargetSize && (
                <p className="text-xs text-gray-500 mt-1">Auto-adjusted for target size</p>
              )}
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

          {/* Target Size Presets */}
          {useTargetSize && (
            <div className="space-y-2">
              <Label className="text-dark-gray font-medium">Quick Size Targets</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => { setTargetSize("100"); setTargetSizeUnit("KB"); }}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  100 KB
                </Button>
                <Button
                  onClick={() => { setTargetSize("200"); setTargetSizeUnit("KB"); }}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  200 KB
                </Button>
                <Button
                  onClick={() => { setTargetSize("500"); setTargetSizeUnit("KB"); }}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  500 KB
                </Button>
                <Button
                  onClick={() => { setTargetSize("1"); setTargetSizeUnit("MB"); }}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  1 MB
                </Button>
                <Button
                  onClick={() => { setTargetSize("2"); setTargetSizeUnit("MB"); }}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  2 MB
                </Button>
              </div>
            </div>
          )}

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
                  {useTargetSize ? "Compress to Target Size" : (!width && !height) ? "Convert Format/Quality" : "Resize Images"}
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
                  <div>Original: {formatFileSize(imageData.size)}</div>
                  {imageData.processed && imageData.finalSize && (
                    <div>Final: {formatFileSize(imageData.finalSize)}</div>
                  )}
                  {imageData.processed && imageData.finalQuality && (
                    <div>Quality used: {imageData.finalQuality}%</div>
                  )}
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
