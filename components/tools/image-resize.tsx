"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Image as ImageIcon, 
  Upload, 
  Download, 
  RefreshCw,
  Link,
  Unlink,
  Maximize,
  Minimize,
  Monitor,
  Smartphone,
  Tablet,
  Square,
  Settings,
  Zap,
  FileImage,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageDimensions {
  width: number;
  height: number;
}

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

interface ResizePreset {
  name: string;
  width: number;
  height: number;
  category: string;
  icon: React.ReactNode;
}

const ImageResizeTool: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [newWidth, setNewWidth] = useState<number>(0);
  const [newHeight, setNewHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<string>('png');
  const [quality, setQuality] = useState<number>(90);
  const [resizeMethod, setResizeMethod] = useState<string>('contain');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Target file size features
  const [useTargetSize, setUseTargetSize] = useState<boolean>(false);
  const [targetSize, setTargetSize] = useState<string>('');
  const [targetSizeUnit, setTargetSizeUnit] = useState<string>('KB');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  // Advanced compression with target file size
  const compressToTargetSize = async (file: File, targetWidth: number, targetHeight: number, targetFormat: string, targetSizeBytes: number): Promise<{ dataUrl: string, finalQuality: number, finalSize: number }> => {
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

        // Try with original dimensions and binary search quality
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
            const result = await resizeImageAdvanced(file, testWidth, testHeight, currentQuality, targetFormat);
            
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
          bestResult = await resizeImageAdvanced(file, minWidth, minHeight, 1, targetFormat);
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

  const resizeImageAdvanced = (file: File, targetWidth: number, targetHeight: number, targetQuality: number, targetFormat: string): Promise<string> => {
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

        // Enable high-quality rendering
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
        }

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

  const resizePresets: ResizePreset[] = [
    // Social Media
    { name: 'Instagram Square', width: 1080, height: 1080, category: 'Social Media', icon: <Square className="h-4 w-4" /> },
    { name: 'Instagram Story', width: 1080, height: 1920, category: 'Social Media', icon: <Smartphone className="h-4 w-4" /> },
    { name: 'Facebook Cover', width: 1200, height: 630, category: 'Social Media', icon: <Monitor className="h-4 w-4" /> },
    { name: 'Twitter Header', width: 1500, height: 500, category: 'Social Media', icon: <Monitor className="h-4 w-4" /> },
    { name: 'LinkedIn Banner', width: 1584, height: 396, category: 'Social Media', icon: <Monitor className="h-4 w-4" /> },
    { name: 'YouTube Thumbnail', width: 1280, height: 720, category: 'Social Media', icon: <Monitor className="h-4 w-4" /> },
    
    // Web
    { name: 'Hero Banner', width: 1920, height: 1080, category: 'Web', icon: <Monitor className="h-4 w-4" /> },
    { name: 'Blog Featured', width: 1200, height: 630, category: 'Web', icon: <Monitor className="h-4 w-4" /> },
    { name: 'Card Thumbnail', width: 400, height: 300, category: 'Web', icon: <Square className="h-4 w-4" /> },
    { name: 'Avatar', width: 200, height: 200, category: 'Web', icon: <Square className="h-4 w-4" /> },
    
    // Print
    { name: 'A4 (300 DPI)', width: 2480, height: 3508, category: 'Print', icon: <FileImage className="h-4 w-4" /> },
    { name: 'Letter (300 DPI)', width: 2550, height: 3300, category: 'Print', icon: <FileImage className="h-4 w-4" /> },
    { name: 'Business Card', width: 1050, height: 600, category: 'Print', icon: <Square className="h-4 w-4" /> },
    
    // Device Wallpapers
    { name: 'iPhone 15 Pro', width: 1179, height: 2556, category: 'Wallpaper', icon: <Smartphone className="h-4 w-4" /> },
    { name: 'iPad Pro', width: 2048, height: 2732, category: 'Wallpaper', icon: <Tablet className="h-4 w-4" /> },
    { name: '4K Desktop', width: 3840, height: 2160, category: 'Wallpaper', icon: <Monitor className="h-4 w-4" /> },
    { name: 'Full HD', width: 1920, height: 1080, category: 'Wallpaper', icon: <Monitor className="h-4 w-4" /> },
  ];

  const outputFormats = [
    { value: 'png', label: 'PNG', description: 'Lossless, supports transparency' },
    { value: 'jpeg', label: 'JPEG', description: 'Compressed, smaller file size' },
    { value: 'webp', label: 'WebP', description: 'Modern format, best compression' },
  ];

  const resizeMethods = [
    { value: 'contain', label: 'Contain', description: 'Fit entire image within dimensions' },
    { value: 'cover', label: 'Cover', description: 'Fill dimensions, may crop image' },
    { value: 'stretch', label: 'Stretch', description: 'Stretch to exact dimensions' },
    { value: 'pad', label: 'Pad', description: 'Add padding to maintain aspect ratio' },
  ];

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 50MB.",
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      const newImage: ProcessedImage = {
        original: file,
        originalUrl: url,
        width: img.width,
        height: img.height,
        size: file.size
      };
      
      setImages([newImage]);
      setImageFile(file);
      setOriginalDimensions({ width: img.width, height: img.height });
      setNewWidth(img.width);
      setNewHeight(img.height);
    };
    
    img.src = url;
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

    Promise.all(newImages).then(processedImages => {
      setImages(processedImages);
      if (processedImages.length > 0) {
        const firstImage = processedImages[0];
        setImageFile(firstImage.original);
        setOriginalDimensions({ width: firstImage.width, height: firstImage.height });
        setNewWidth(firstImage.width);
        setNewHeight(firstImage.height);
      }
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    handleFiles(files);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const calculateAspectRatio = useCallback(() => {
    if (originalDimensions.width && originalDimensions.height) {
      return originalDimensions.width / originalDimensions.height;
    }
    return 1;
  }, [originalDimensions]);

  const handleWidthChange = (value: number) => {
    setNewWidth(value);
    if (maintainAspectRatio && originalDimensions.height) {
      const aspectRatio = calculateAspectRatio();
      setNewHeight(Math.round(value / aspectRatio));
    }
  };

  const handleHeightChange = (value: number) => {
    setNewHeight(value);
    if (maintainAspectRatio && originalDimensions.width) {
      const aspectRatio = calculateAspectRatio();
      setNewWidth(Math.round(value * aspectRatio));
    }
  };

  const applyPreset = (preset: ResizePreset) => {
    setNewWidth(preset.width);
    setNewHeight(preset.height);
    
    if (maintainAspectRatio) {
      const aspectRatio = calculateAspectRatio();
      const presetRatio = preset.width / preset.height;
      
      if (aspectRatio > presetRatio) {
        // Image is wider, fit by height
        setNewHeight(preset.height);
        setNewWidth(Math.round(preset.height * aspectRatio));
      } else {
        // Image is taller, fit by width
        setNewWidth(preset.width);
        setNewHeight(Math.round(preset.width / aspectRatio));
      }
    }
  };

  const processImages = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    const targetWidth = newWidth || 0;
    const targetHeight = newHeight || 0;
    const targetSizeBytes = useTargetSize ? getTargetSizeInBytes() : 0;

    const processedImages = await Promise.all(
      images.map(async (imageData) => {
        let processed: string;
        let finalQuality = quality;
        let finalSize = 0;

        if (useTargetSize && targetSizeBytes > 0) {
          // For target size, prefer JPEG for better compression unless PNG specified
          const compressionFormat = outputFormat === 'original' ? 'jpeg' : outputFormat;
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
          processed = await resizeImageAdvanced(
            imageData.original,
            targetWidth,
            targetHeight,
            quality,
            outputFormat
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
    setIsProcessing(false);
  };

  const resizeImage = useCallback(() => {
    if (images.length === 0 || !canvasRef.current || !imageRef.current) return null;

    setIsProcessing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    if (!ctx) return null;

    // Set canvas dimensions
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply resize method
    let drawX = 0, drawY = 0, drawWidth = newWidth, drawHeight = newHeight;
    let sourceX = 0, sourceY = 0, sourceWidth = img.naturalWidth, sourceHeight = img.naturalHeight;

    const imageAspectRatio = img.naturalWidth / img.naturalHeight;
    const canvasAspectRatio = newWidth / newHeight;

    switch (resizeMethod) {
      case 'contain':
        if (imageAspectRatio > canvasAspectRatio) {
          drawWidth = newWidth;
          drawHeight = newWidth / imageAspectRatio;
          drawY = (newHeight - drawHeight) / 2;
        } else {
          drawHeight = newHeight;
          drawWidth = newHeight * imageAspectRatio;
          drawX = (newWidth - drawWidth) / 2;
        }
        break;
        
      case 'cover':
        if (imageAspectRatio > canvasAspectRatio) {
          sourceWidth = img.naturalHeight * canvasAspectRatio;
          sourceX = (img.naturalWidth - sourceWidth) / 2;
        } else {
          sourceHeight = img.naturalWidth / canvasAspectRatio;
          sourceY = (img.naturalHeight - sourceHeight) / 2;
        }
        break;
        
      case 'stretch':
        // Use default values (stretch to fill)
        break;
        
      case 'pad':
        // Add white background for padding
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, newWidth, newHeight);
        
        if (imageAspectRatio > canvasAspectRatio) {
          drawWidth = newWidth;
          drawHeight = newWidth / imageAspectRatio;
          drawY = (newHeight - drawHeight) / 2;
        } else {
          drawHeight = newHeight;
          drawWidth = newHeight * imageAspectRatio;
          drawX = (newWidth - drawWidth) / 2;
        }
        break;
    }

    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw the resized image
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      drawX, drawY, drawWidth, drawHeight
    );

    // Convert to desired format
    const formatMimeType = outputFormat === 'jpeg' ? 'image/jpeg' : 
                          outputFormat === 'webp' ? 'image/webp' : 'image/png';
    
    const qualityValue = outputFormat === 'png' ? undefined : quality / 100;
    
    setIsProcessing(false);
    return canvas.toDataURL(formatMimeType, qualityValue);
  }, [images, newWidth, newHeight, resizeMethod, outputFormat, quality]);

  const handleDownload = async () => {
    if (useTargetSize) {
      // Use advanced processing for target size
      await processImages();
      const processedImage = images[0];
      if (processedImage?.processed) {
        const link = document.createElement('a');
        link.download = `resized-${newWidth}x${newHeight}.${outputFormat}`;
        link.href = processedImage.processed;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Download started",
          description: `Image compressed to ${(processedImage.finalSize! / 1024).toFixed(1)} KB and downloaded.`,
        });
      }
    } else {
      // Use simple resize
      const resizedImage = resizeImage();
      if (!resizedImage) {
        toast({
          title: "Error",
          description: "Unable to resize image. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const link = document.createElement('a');
      link.download = `resized-${newWidth}x${newHeight}.${outputFormat}`;
      link.href = resizedImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download started",
        description: `Image resized to ${newWidth}×${newHeight} and downloaded as ${outputFormat.toUpperCase()}.`,
      });
    }
  };

  const handleReset = () => {
    setImages([]);
    setImageFile(null);
    setOriginalDimensions({ width: 0, height: 0 });
    setNewWidth(0);
    setNewHeight(0);
    setMaintainAspectRatio(true);
    setOutputFormat('png');
    setQuality(90);
    setResizeMethod('contain');
    setUseTargetSize(false);
    setTargetSize('');
    setTargetSizeUnit('KB');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileSizeEstimate = () => {
    if (!newWidth || !newHeight) return '';
    
    const pixels = newWidth * newHeight;
    let estimatedSize = 0;
    
    switch (outputFormat) {
      case 'png':
        estimatedSize = pixels * 4; // 4 bytes per pixel for RGBA
        break;
      case 'jpeg':
        estimatedSize = pixels * (quality / 100) * 0.5; // Rough JPEG estimate
        break;
      case 'webp':
        estimatedSize = pixels * (quality / 100) * 0.3; // WebP is more efficient
        break;
    }
    
    if (estimatedSize > 1024 * 1024) {
      return `~${(estimatedSize / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `~${(estimatedSize / 1024).toFixed(0)} KB`;
    }
  };

  // Group presets by category
  const presetsByCategory = resizePresets.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, ResizePreset[]>);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-blue-600" />
            Image Resizer
          </CardTitle>
          <p className="text-gray-600">
            Resize your images to any dimension with professional quality. Perfect for web, social media, and print.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          {images.length === 0 ? (
            <div 
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200 ${
                isDragOver 
                  ? 'border-blue-500 bg-blue-100 scale-[1.02]' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={`transition-all duration-200 ${isDragOver ? 'scale-110' : ''}`}>
                <Upload className={`h-16 w-16 mx-auto mb-4 transition-colors ${
                  isDragOver ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <h3 className={`text-xl font-medium mb-2 transition-colors ${
                  isDragOver ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {isDragOver ? 'Drop your image here' : 'Click to upload an image'}
                </h3>
                <p className={`mb-6 transition-colors ${
                  isDragOver ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {isDragOver ? 'Release to upload' : 'or drag and drop your image here'}
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Supports JPEG, PNG, WebP, and other image formats</p>
                  <p className="text-sm text-gray-400">Maximum file size: 50MB</p>
                </div>
                {!isDragOver && (
                  <div className="mt-6">
                    <div className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Image Preview */}
              <div className="xl:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Image Preview</Label>
                  <div className="flex gap-2">
                    <Button onClick={handleReset} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-1" />
                      New Image
                    </Button>
                  </div>
                </div>

                {/* Original Image */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Original Image</h4>
                    <div className="relative border rounded-lg overflow-hidden bg-white">
                      <img
                        ref={imageRef}
                        src={images[0]?.originalUrl}
                        alt="Original"
                        className="max-w-full h-auto max-h-96 mx-auto block"
                      />
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {originalDimensions.width} × {originalDimensions.height}
                      </div>
                    </div>
                  </div>

                  {/* Preview of Resized Image */}
                  {newWidth && newHeight && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Preview (Resized)</h4>
                      <div className="relative border rounded-lg overflow-hidden bg-white">
                        <div 
                          className="mx-auto bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center"
                          style={{
                            width: Math.min(400, newWidth),
                            height: Math.min(300, newHeight),
                            aspectRatio: `${newWidth}/${newHeight}`
                          }}
                        >
                          <div className="text-center text-gray-500">
                            <div className="text-sm">Preview Size</div>
                            <div className="text-xs">{newWidth} × {newHeight}</div>
                          </div>
                        </div>
                        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {newWidth} × {newHeight}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls Panel */}
              <div className="space-y-6">
                {/* Quick Presets */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Quick Presets</Label>
                  <div className="space-y-4">
                    {Object.entries(presetsByCategory).map(([category, presets]) => (
                      <div key={category} className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">{category}</Label>
                        <div className="grid grid-cols-1 gap-1">
                          {presets.map((preset) => (
                            <Button
                              key={preset.name}
                              onClick={() => applyPreset(preset)}
                              variant="outline"
                              className="justify-start text-xs h-8"
                              size="sm"
                            >
                              {preset.icon}
                              <span className="ml-2">{preset.name}</span>
                              <span className="ml-auto text-gray-400">{preset.width}×{preset.height}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target File Size */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={useTargetSize}
                      onCheckedChange={setUseTargetSize}
                    />
                    <Label className="text-base font-medium">🎯 Target File Size</Label>
                  </div>
                  
                  {useTargetSize && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600">Size</Label>
                          <Input
                            type="number"
                            value={targetSize}
                            onChange={(e) => setTargetSize(e.target.value)}
                            placeholder="e.g., 99"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Unit</Label>
                          <Select value={targetSizeUnit} onValueChange={setTargetSizeUnit}>
                            <SelectTrigger className="text-sm">
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
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="font-medium text-blue-800 mb-1">🎯 Smart Compression Mode</h4>
                        <ul className="text-blue-700 text-xs space-y-0.5">
                          <li>• Automatically adjusts quality AND dimensions if needed</li>
                          <li>• Uses advanced algorithms to hit exact file size</li>
                          <li>• May reduce image size to reach target</li>
                          <li>• Quality setting will be ignored</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>

                {/* Custom Dimensions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Custom Dimensions</Label>
                    <Button
                      onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                      variant="ghost"
                      size="sm"
                      className={maintainAspectRatio ? 'text-blue-600' : 'text-gray-400'}
                    >
                      {maintainAspectRatio ? <Link className="h-4 w-4" /> : <Unlink className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">Width (px)</Label>
                      <Input
                        type="number"
                        value={newWidth || ''}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        min={1}
                        max={10000}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Height (px)</Label>
                      <Input
                        type="number"
                        value={newHeight || ''}
                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                        min={1}
                        max={10000}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={maintainAspectRatio}
                      onCheckedChange={setMaintainAspectRatio}
                    />
                    <Label className="text-sm">Maintain aspect ratio</Label>
                  </div>
                </div>

                {/* Resize Method */}
                <div className="space-y-3">
                  <Label>Resize Method</Label>
                  <Select value={resizeMethod} onValueChange={setResizeMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resizeMethods.map(method => (
                        <SelectItem key={method.value} value={method.value}>
                          <div>
                            <div className="font-medium">{method.label}</div>
                            <div className="text-xs text-gray-500">{method.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Output Format */}
                <div className="space-y-3">
                  <Label>Output Format</Label>
                  <Select value={outputFormat} onValueChange={setOutputFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {outputFormats.map(format => (
                        <SelectItem key={format.value} value={format.value}>
                          <div>
                            <div className="font-medium">{format.label}</div>
                            <div className="text-xs text-gray-500">{format.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality Slider (for JPEG/WebP) */}
                {outputFormat !== 'png' && (
                  <div className="space-y-3">
                    <Label>Quality: {quality}%</Label>
                    <Slider
                      value={[quality]}
                      onValueChange={(value) => setQuality(value[0])}
                      min={10}
                      max={100}
                      step={5}
                      disabled={useTargetSize}
                    />
                    {useTargetSize && (
                      <p className="text-xs text-gray-500">Quality auto-adjusted for target size</p>
                    )}
                  </div>
                )}

                {/* File Size Estimate */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="text-sm">
                    <strong>Output:</strong> {newWidth} × {newHeight}
                  </div>
                  <div className="text-sm">
                    <strong>Format:</strong> {outputFormat.toUpperCase()}
                    {outputFormat !== 'png' && !useTargetSize && ` (${quality}% quality)`}
                  </div>
                  {useTargetSize ? (
                    <div className="text-sm">
                      <strong>Target Size:</strong> {targetSize} {targetSizeUnit}
                      {images.length > 0 && images[0].processed && (
                        <span className="text-green-600 ml-2">
                          ✓ Achieved: {(images[0].finalSize! / (targetSizeUnit === 'KB' ? 1024 : targetSizeUnit === 'MB' ? 1024*1024 : 1)).toFixed(1)} {targetSizeUnit}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm">
                      <strong>Estimated Size:</strong> {getFileSizeEstimate()}
                    </div>
                  )}
                  <div className="text-sm">
                    <strong>Resize Method:</strong> {resizeMethods.find(m => m.value === resizeMethod)?.label}
                  </div>
                </div>

                {/* Download Button */}
                <Button 
                  onClick={handleDownload} 
                  className="w-full" 
                  disabled={isProcessing || !newWidth || !newHeight}
                >
                  {isProcessing ? (
                    <>
                      <Settings className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Resized Image
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 Image Resizing Tips</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Target File Size:</strong> Smart compression to hit exact file sizes - perfect for web optimization</li>
              <li>• <strong>Contain:</strong> Best for maintaining image quality without cropping</li>
              <li>• <strong>Cover:</strong> Perfect for filling exact dimensions, may crop edges</li>
              <li>• <strong>Stretch:</strong> Forces exact dimensions but may distort the image</li>
              <li>• <strong>Pad:</strong> Maintains aspect ratio by adding white background</li>
              <li>• <strong>WebP format:</strong> Offers the best compression with high quality</li>
              <li>• <strong>Batch processing:</strong> Upload multiple images for bulk resizing</li>
              <li>• <strong>Aspect ratio:</strong> Keep it locked to prevent distortion</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { ImageResizeTool };
export default ImageResizeTool;
