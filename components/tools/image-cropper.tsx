"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Crop, 
  Upload, 
  Download, 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical,
  Square,
  Maximize,
  Smartphone,
  Monitor,
  Camera,
  RefreshCw,
  Move,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageDimensions {
  width: number;
  height: number;
}

const ImageCropper: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState<string>('free');
  const [outputFormat, setOutputFormat] = useState<string>('png');
  const [quality, setQuality] = useState<number>(90);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [imageScale, setImageScale] = useState<number>(1);
  const [imageOffset, setImageOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  const aspectRatios = [
    { value: 'free', label: 'Free', ratio: null },
    { value: '1:1', label: '1:1 (Square)', ratio: 1 },
    { value: '4:3', label: '4:3', ratio: 4/3 },
    { value: '3:2', label: '3:2', ratio: 3/2 },
    { value: '16:9', label: '16:9', ratio: 16/9 },
    { value: '9:16', label: '9:16 (Portrait)', ratio: 9/16 },
    { value: '21:9', label: '21:9 (Ultrawide)', ratio: 21/9 },
    { value: '2:3', label: '2:3 (Photo)', ratio: 2/3 },
  ];

  const outputFormats = [
    { value: 'png', label: 'PNG', description: 'Lossless, supports transparency' },
    { value: 'jpeg', label: 'JPEG', description: 'Compressed, smaller file size' },
    { value: 'webp', label: 'WebP', description: 'Modern format, great compression' },
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    processImageFile(file);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImage(result);
      
      // Create image element to get dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        
        // Calculate scale to fit image in container with better logic
        const containerWidth = Math.min(800, window.innerWidth - 100); // Max 800px or screen width minus padding
        const containerHeight = 600; // Max height
        
        const scaleX = containerWidth / img.width;
        const scaleY = containerHeight / img.height;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
        
        setImageScale(scale);
        
        // Set initial crop area to center of image (proportional to actual image size)
        const cropSize = Math.min(img.width, img.height) * 0.5; // Smaller initial crop
        setCropArea({
          x: (img.width - cropSize) / 2,
          y: (img.height - cropSize) / 2,
          width: cropSize,
          height: cropSize
        });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
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
      processImageFile(files[0]);
    }
  };

  const handleAspectRatioChange = (value: string) => {
    setAspectRatio(value);
    const selectedRatio = aspectRatios.find(r => r.value === value);
    
    if (selectedRatio?.ratio) {
      const currentWidth = cropArea.width;
      const newHeight = currentWidth / selectedRatio.ratio;
      
      // Ensure the new dimensions fit within the image
      if (cropArea.y + newHeight <= imageDimensions.height) {
        setCropArea(prev => ({ ...prev, height: newHeight }));
      } else {
        const maxHeight = imageDimensions.height - cropArea.y;
        const newWidth = maxHeight * selectedRatio.ratio;
        setCropArea(prev => ({ ...prev, width: newWidth, height: maxHeight }));
      }
    }
  };

  const handleCropAreaChange = (field: keyof CropArea, value: number) => {
    setCropArea(prev => {
      const newArea = { ...prev, [field]: value };
      
      // Apply aspect ratio constraint if set
      if (aspectRatio !== 'free') {
        const selectedRatio = aspectRatios.find(r => r.value === aspectRatio);
        if (selectedRatio?.ratio) {
          if (field === 'width') {
            newArea.height = value / selectedRatio.ratio;
          } else if (field === 'height') {
            newArea.width = value * selectedRatio.ratio;
          }
        }
      }
      
      // Ensure crop area stays within image bounds
      newArea.x = Math.max(0, Math.min(newArea.x, imageDimensions.width - newArea.width));
      newArea.y = Math.max(0, Math.min(newArea.y, imageDimensions.height - newArea.height));
      newArea.width = Math.max(10, Math.min(newArea.width, imageDimensions.width - newArea.x));
      newArea.height = Math.max(10, Math.min(newArea.height, imageDimensions.height - newArea.y));
      
      return newArea;
    });
  };

  const applyTransformations = useCallback((img: HTMLImageElement, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match crop area
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.scale(zoom, zoom);

    // Draw the cropped portion of the image
    const sourceX = cropArea.x;
    const sourceY = cropArea.y;
    const sourceWidth = cropArea.width;
    const sourceHeight = cropArea.height;

    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height
    );

    // Restore context state
    ctx.restore();
  }, [cropArea, rotation, flipH, flipV, zoom]);

  const cropImage = useCallback(() => {
    if (!image || !canvasRef.current || !imageRef.current) return null;

    const canvas = canvasRef.current;
    const img = imageRef.current;

    applyTransformations(img, canvas);

    // Convert to desired format
    const formatMimeType = outputFormat === 'jpeg' ? 'image/jpeg' : 
                          outputFormat === 'webp' ? 'image/webp' : 'image/png';
    
    const qualityValue = outputFormat === 'png' ? undefined : quality / 100;
    
    return canvas.toDataURL(formatMimeType, qualityValue);
  }, [image, applyTransformations, outputFormat, quality]);

  const handleDownload = () => {
    const croppedImage = cropImage();
    if (!croppedImage) {
      toast({
        title: "Error",
        description: "Unable to crop image. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement('a');
    link.download = `cropped-image.${outputFormat}`;
    link.href = croppedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: `Image downloaded as ${outputFormat.toUpperCase()}.`,
    });
  };

  const handleReset = () => {
    setImage(null);
    setImageFile(null);
    setCropArea({ x: 0, y: 0, width: 200, height: 200 });
    setImageDimensions({ width: 0, height: 0 });
    setAspectRatio('free');
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoom(1);
    setImageScale(1);
    setImageOffset({ x: 0, y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Convert screen coordinates to image coordinates
  const screenToImageCoords = (screenX: number, screenY: number, containerRect: DOMRect) => {
    // Get the actual image element's bounding rect
    const imageElement = imageRef.current;
    if (!imageElement) return { x: 0, y: 0 };
    
    const imageRect = imageElement.getBoundingClientRect();
    
    // Calculate relative position within the image
    const relativeX = (screenX - imageRect.left) / imageScale;
    const relativeY = (screenY - imageRect.top) / imageScale;
    
    return { x: relativeX, y: relativeY };
  };

  // Handle mouse down on crop area
  const handleMouseDown = (e: React.MouseEvent, handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const { x, y } = screenToImageCoords(e.clientX, e.clientY, rect);
    
    setDragStart({ x, y });
    
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
    }
  };

  // Handle mouse move for dragging and resizing
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;
    
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const { x, y } = screenToImageCoords(e.clientX, e.clientY, rect);
    
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    if (isDragging) {
      // Move crop area
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(prev.x + deltaX, imageDimensions.width - prev.width)),
        y: Math.max(0, Math.min(prev.y + deltaY, imageDimensions.height - prev.height))
      }));
      setDragStart({ x, y });
    } else if (isResizing) {
      // Resize crop area based on handle
      setCropArea(prev => {
        let newArea = { ...prev };
        
        switch (resizeHandle) {
          case 'nw': // Top-left
            newArea.width = Math.max(5, prev.width - deltaX);
            newArea.height = Math.max(5, prev.height - deltaY);
            newArea.x = prev.x + (prev.width - newArea.width);
            newArea.y = prev.y + (prev.height - newArea.height);
            break;
          case 'ne': // Top-right
            newArea.width = Math.max(5, prev.width + deltaX);
            newArea.height = Math.max(5, prev.height - deltaY);
            newArea.y = prev.y + (prev.height - newArea.height);
            break;
          case 'sw': // Bottom-left
            newArea.width = Math.max(5, prev.width - deltaX);
            newArea.height = Math.max(5, prev.height + deltaY);
            newArea.x = prev.x + (prev.width - newArea.width);
            break;
          case 'se': // Bottom-right
            newArea.width = Math.max(5, prev.width + deltaX);
            newArea.height = Math.max(5, prev.height + deltaY);
            break;
          case 'n': // Top
            newArea.height = Math.max(5, prev.height - deltaY);
            newArea.y = prev.y + (prev.height - newArea.height);
            break;
          case 's': // Bottom
            newArea.height = Math.max(5, prev.height + deltaY);
            break;
          case 'w': // Left
            newArea.width = Math.max(5, prev.width - deltaX);
            newArea.x = prev.x + (prev.width - newArea.width);
            break;
          case 'e': // Right
            newArea.width = Math.max(5, prev.width + deltaX);
            break;
        }

        // Apply aspect ratio constraint if set
        if (aspectRatio !== 'free') {
          const selectedRatio = aspectRatios.find(r => r.value === aspectRatio);
          if (selectedRatio?.ratio) {
            if (resizeHandle.includes('e') || resizeHandle.includes('w')) {
              newArea.height = newArea.width / selectedRatio.ratio;
            } else if (resizeHandle.includes('n') || resizeHandle.includes('s')) {
              newArea.width = newArea.height * selectedRatio.ratio;
            }
          }
        }

        // Ensure crop area stays within bounds
        newArea.x = Math.max(0, Math.min(newArea.x, imageDimensions.width - newArea.width));
        newArea.y = Math.max(0, Math.min(newArea.y, imageDimensions.height - newArea.height));
        newArea.width = Math.min(newArea.width, imageDimensions.width - newArea.x);
        newArea.height = Math.min(newArea.height, imageDimensions.height - newArea.y);

        return newArea;
      });
      setDragStart({ x, y });
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  };

  // Handle click to set crop area center (only on image, not on crop area)
  const handleImageClick = (e: React.MouseEvent) => {
    if (isDragging || isResizing || e.target !== e.currentTarget) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const { x, y } = screenToImageCoords(e.clientX, e.clientY, rect);
    
    // Center crop area on click point
    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(x - prev.width / 2, imageDimensions.width - prev.width)),
      y: Math.max(0, Math.min(y - prev.height / 2, imageDimensions.height - prev.height))
    }));
  };

  const presetCrops = [
    { name: 'Instagram Square', width: 1080, height: 1080, ratio: '1:1' },
    { name: 'Instagram Story', width: 1080, height: 1920, ratio: '9:16' },
    { name: 'Facebook Cover', width: 1200, height: 630, ratio: '16:9' },
    { name: 'Twitter Header', width: 1500, height: 500, ratio: '3:1' },
    { name: 'YouTube Thumbnail', width: 1280, height: 720, ratio: '16:9' },
  ];

  const applyPresetCrop = (preset: typeof presetCrops[0]) => {
    setAspectRatio(preset.ratio);
    
    // Calculate crop area based on image dimensions and preset ratio
    const targetRatio = preset.width / preset.height;
    const imageRatio = imageDimensions.width / imageDimensions.height;
    
    let newWidth, newHeight;
    
    if (imageRatio > targetRatio) {
      // Image is wider, fit by height
      newHeight = imageDimensions.height * 0.8;
      newWidth = newHeight * targetRatio;
    } else {
      // Image is taller, fit by width
      newWidth = imageDimensions.width * 0.8;
      newHeight = newWidth / targetRatio;
    }
    
    setCropArea({
      x: (imageDimensions.width - newWidth) / 2,
      y: (imageDimensions.height - newHeight) / 2,
      width: newWidth,
      height: newHeight
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crop className="h-6 w-6 text-blue-600" />
            Image Cropper
          </CardTitle>
          <p className="text-gray-600">
            Crop, rotate, and resize your images with precision. Perfect for social media, websites, and print.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          {!image ? (
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
                  <p className="text-sm text-gray-400">Maximum file size: 10MB</p>
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
              {/* Image Editor */}
              <div className="xl:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Image Editor</Label>
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

                {/* Image Preview with Interactive Crop Overlay */}
                <div 
                  className="relative border rounded-lg overflow-hidden bg-gray-50 mx-auto"
                  style={{ 
                    maxWidth: '100%',
                    width: 'fit-content',
                    minHeight: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div 
                    className="relative"
                    style={{
                      width: `${imageDimensions.width * imageScale}px`,
                      height: `${imageDimensions.height * imageScale}px`,
                      maxWidth: '100%',
                      maxHeight: '600px'
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <img
                      ref={imageRef}
                      src={image}
                      alt="Original"
                      className="block w-full h-full object-contain cursor-crosshair"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                        transformOrigin: 'center',
                        width: `${imageDimensions.width * imageScale}px`,
                        height: `${imageDimensions.height * imageScale}px`
                      }}
                      onClick={handleImageClick}
                      draggable={false}
                    />
                    
                    {/* Crop Overlay */}
                    <div
                      className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-10"
                      style={{
                        left: `${(cropArea.x * imageScale)}px`,
                        top: `${(cropArea.y * imageScale)}px`,
                        width: `${(cropArea.width * imageScale)}px`,
                        height: `${(cropArea.height * imageScale)}px`,
                        cursor: isDragging ? 'grabbing' : 'grab'
                      }}
                      onMouseDown={(e) => handleMouseDown(e)}
                    >
                      {/* Crop area grid lines */}
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className="border border-blue-300 border-opacity-50" />
                        ))}
                      </div>
                      
                      {/* Corner resize handles */}
                      <div
                        className="absolute -top-2 -left-2 w-4 h-4 bg-blue-600 border-2 border-white cursor-nw-resize rounded-sm shadow-md hover:bg-blue-700 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'nw')}
                      />
                      <div
                        className="absolute -top-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white cursor-ne-resize rounded-sm shadow-md hover:bg-blue-700 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'ne')}
                      />
                      <div
                        className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-600 border-2 border-white cursor-sw-resize rounded-sm shadow-md hover:bg-blue-700 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'sw')}
                      />
                      <div
                        className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white cursor-se-resize rounded-sm shadow-md hover:bg-blue-700 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'se')}
                      />
                      
                      {/* Edge resize handles */}
                      <div
                        className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 border-2 border-white cursor-n-resize rounded-sm shadow-md hover:bg-blue-700 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'n')}
                      />
                      <div
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 border-2 border-white cursor-s-resize rounded-sm shadow-md hover:bg-blue-700 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 's')}
                      />
                      <div
                        className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-600 border-2 border-white cursor-w-resize rounded-sm shadow-md hover:bg-blue-700 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'w')}
                      />
                      <div
                        className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-600 border-2 border-white cursor-e-resize rounded-sm shadow-md hover:bg-blue-700 transition-colors"
                        onMouseDown={(e) => handleMouseDown(e, 'e')}
                      />
                    </div>
                    
                    {/* Dark overlay for non-crop areas */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Top overlay */}
                      <div
                        className="absolute bg-black bg-opacity-40"
                        style={{
                          left: 0,
                          top: 0,
                          width: '100%',
                          height: `${cropArea.y * imageScale}px`
                        }}
                      />
                      {/* Bottom overlay */}
                      <div
                        className="absolute bg-black bg-opacity-40"
                        style={{
                          left: 0,
                          top: `${(cropArea.y + cropArea.height) * imageScale}px`,
                          width: '100%',
                          height: `calc(100% - ${(cropArea.y + cropArea.height) * imageScale}px)`
                        }}
                      />
                      {/* Left overlay */}
                      <div
                        className="absolute bg-black bg-opacity-40"
                        style={{
                          left: 0,
                          top: `${cropArea.y * imageScale}px`,
                          width: `${cropArea.x * imageScale}px`,
                          height: `${cropArea.height * imageScale}px`
                        }}
                      />
                      {/* Right overlay */}
                      <div
                        className="absolute bg-black bg-opacity-40"
                        style={{
                          left: `${(cropArea.x + cropArea.width) * imageScale}px`,
                          top: `${cropArea.y * imageScale}px`,
                          width: `calc(100% - ${(cropArea.x + cropArea.width) * imageScale}px)`,
                          height: `${cropArea.height * imageScale}px`
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Image info overlay */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    Original: {imageDimensions.width} × {imageDimensions.height}
                    {imageScale < 1 && (
                      <div>Scaled: {Math.round(imageScale * 100)}%</div>
                    )}
                  </div>
                  
                  {/* Crop info overlay */}
                  <div className="absolute top-2 right-2 bg-blue-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded">
                    Crop: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                  </div>
                  
                  {/* Instructions overlay */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    Click to center • Drag to move • Drag handles to resize
                  </div>
                </div>

                {/* Transform Controls */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <Button
                    onClick={() => setRotation(prev => (prev - 90) % 360)}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Rotate Left
                  </Button>
                  <Button
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCw className="h-4 w-4 mr-1" />
                    Rotate Right
                  </Button>
                  <Button
                    onClick={() => setFlipH(!flipH)}
                    variant={flipH ? "default" : "outline"}
                    size="sm"
                  >
                    <FlipHorizontal className="h-4 w-4 mr-1" />
                    Flip H
                  </Button>
                  <Button
                    onClick={() => setFlipV(!flipV)}
                    variant={flipV ? "default" : "outline"}
                    size="sm"
                  >
                    <FlipVertical className="h-4 w-4 mr-1" />
                    Flip V
                  </Button>
                  <Button
                    onClick={() => setZoom(1)}
                    variant="outline"
                    size="sm"
                  >
                    <Maximize className="h-4 w-4 mr-1" />
                    Fit
                  </Button>
                </div>

                {/* Zoom Control */}
                <div className="space-y-2">
                  <Label className="text-sm">Zoom: {Math.round(zoom * 100)}%</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setZoom(Math.max(0.1, zoom - 0.25))}
                      variant="outline"
                      size="sm"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Slider
                      value={[zoom]}
                      onValueChange={(value) => setZoom(value[0])}
                      min={0.1}
                      max={5}
                      step={0.1}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => setZoom(Math.min(5, zoom + 0.25))}
                      variant="outline"
                      size="sm"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                  {/* Zoom Presets */}
                  <div className="flex gap-2 justify-center">
                    {[0.25, 0.5, 1, 1.5, 2].map(zoomLevel => (
                      <Button
                        key={zoomLevel}
                        onClick={() => setZoom(zoomLevel)}
                        variant={Math.abs(zoom - zoomLevel) < 0.1 ? "default" : "outline"}
                        size="sm"
                        className="text-xs px-2 py-1"
                      >
                        {Math.round(zoomLevel * 100)}%
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Controls Panel */}
              <div className="space-y-6">
                {/* Preset Crops */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Quick Presets</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {presetCrops.map((preset) => (
                      <Button
                        key={preset.name}
                        onClick={() => applyPresetCrop(preset)}
                        variant="outline"
                        className="justify-start text-sm"
                        size="sm"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-3">
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatios.map(ratio => (
                        <SelectItem key={ratio.value} value={ratio.value}>
                          {ratio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Crop Dimensions */}
                <div className="space-y-3">
                  <Label>Crop Area (pixels)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-gray-600">X Position</Label>
                      <Input
                        type="number"
                        value={Math.round(cropArea.x)}
                        onChange={(e) => handleCropAreaChange('x', Number(e.target.value))}
                        min={0}
                        max={imageDimensions.width}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Y Position</Label>
                      <Input
                        type="number"
                        value={Math.round(cropArea.y)}
                        onChange={(e) => handleCropAreaChange('y', Number(e.target.value))}
                        min={0}
                        max={imageDimensions.height}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Width</Label>
                      <Input
                        type="number"
                        value={Math.round(cropArea.width)}
                        onChange={(e) => handleCropAreaChange('width', Number(e.target.value))}
                        min={10}
                        max={imageDimensions.width}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Height</Label>
                      <Input
                        type="number"
                        value={Math.round(cropArea.height)}
                        onChange={(e) => handleCropAreaChange('height', Number(e.target.value))}
                        min={10}
                        max={imageDimensions.height}
                        className="text-sm"
                      />
                    </div>
                  </div>
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
                    />
                  </div>
                )}

                {/* Download Button */}
                <Button onClick={handleDownload} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Cropped Image
                </Button>

                {/* Output Info */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="text-sm">
                    <strong>Output:</strong> {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                  </div>
                  <div className="text-sm">
                    <strong>Format:</strong> {outputFormat.toUpperCase()}
                    {outputFormat !== 'png' && ` (${quality}% quality)`}
                  </div>
                  <div className="text-sm">
                    <strong>Aspect Ratio:</strong> {aspectRatio === 'free' ? 'Free' : aspectRatio}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hidden canvas for processing */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🎨 Image Cropping Tips</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Use presets:</strong> Quick crop sizes for popular social media platforms</li>
              <li>• <strong>Maintain aspect ratio:</strong> Keep proportions consistent for professional results</li>
              <li>• <strong>PNG for graphics:</strong> Choose PNG for images with transparency or sharp edges</li>
              <li>• <strong>JPEG for photos:</strong> Better compression for photographs and complex images</li>
              <li>• <strong>WebP for web:</strong> Modern format with excellent compression and quality</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageCropper;
