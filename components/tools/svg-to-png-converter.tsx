'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Upload, 
  Download, 
  RotateCcw,
  FileImage,
  Zap,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface ConversionSettings {
  scale: number;
  width?: number;
  height?: number;
  quality: number;
  backgroundColor: string;
  transparent: boolean;
}

export default function SvgToPngConverter() {
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [pngDataUrl, setPngDataUrl] = useState<string>('');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [settings, setSettings] = useState<ConversionSettings>({
    scale: 1,
    quality: 1,
    backgroundColor: '#ffffff',
    transparent: true,
  });
  const [isConverting, setIsConverting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.includes('svg')) {
      toast.error('Please upload a valid SVG file');
      return;
    }

    setSvgFile(file);
    const text = await file.text();
    setSvgContent(text);
    
    // Extract dimensions from SVG
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(text, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');
    
    if (svgElement) {
      const viewBox = svgElement.getAttribute('viewBox');
      let width = 300, height = 300; // defaults
      
      if (viewBox) {
        const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);
        width = vbWidth || 300;
        height = vbHeight || 300;
      } else {
        width = parseFloat(svgElement.getAttribute('width') || '300');
        height = parseFloat(svgElement.getAttribute('height') || '300');
      }
      
      setOriginalDimensions({ width, height });
      setSettings(prev => ({
        ...prev,
        width: Math.round(width),
        height: Math.round(height),
      }));
      
      // Auto-convert
      convertToPng(text, { ...settings, width: Math.round(width), height: Math.round(height) });
    }
  }, [settings]);

  // Convert SVG to PNG
  const convertToPng = useCallback(async (svgText: string, conversionSettings: ConversionSettings) => {
    if (!svgText) return;

    setIsConverting(true);
    
    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      const { scale, backgroundColor, transparent } = conversionSettings;
      const width = (conversionSettings.width || originalDimensions?.width || 300) * scale;
      const height = (conversionSettings.height || originalDimensions?.height || 300) * scale;
      
      canvas.width = width;
      canvas.height = height;

      // Set background
      if (!transparent) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }

      // Create SVG blob
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        
        const pngDataUrl = canvas.toDataURL('image/png', conversionSettings.quality);
        setPngDataUrl(pngDataUrl);
        
        URL.revokeObjectURL(url);
        setIsConverting(false);
        toast.success('SVG converted to PNG successfully!');
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setIsConverting(false);
        toast.error('Failed to convert SVG. Please check if the SVG is valid.');
      };
      
      img.src = url;
    } catch (error) {
      setIsConverting(false);
      toast.error('Conversion failed. Please try again.');
      console.error('Conversion error:', error);
    }
  }, [originalDimensions]);

  // Apply settings
  const applySettings = () => {
    if (svgContent) {
      convertToPng(svgContent, settings);
    }
  };

  // Reset settings
  const resetSettings = () => {
    if (originalDimensions) {
      setSettings({
        scale: 1,
        width: originalDimensions.width,
        height: originalDimensions.height,
        quality: 1,
        backgroundColor: '#ffffff',
        transparent: true,
      });
    }
  };

  // Download PNG
  const downloadPng = () => {
    if (!pngDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `${svgFile?.name.replace('.svg', '') || 'converted'}.png`;
    link.href = pngDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('PNG downloaded successfully!');
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  // File input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Update setting
  const updateSetting = (key: keyof ConversionSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Calculate scaled dimensions
  const scaledWidth = Math.round((settings.width || originalDimensions?.width || 300) * settings.scale);
  const scaledHeight = Math.round((settings.height || originalDimensions?.height || 300) * settings.scale);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">SVG to PNG Converter</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Convert SVG vector graphics to PNG images with customizable scale, quality, and background options. 
          Maintain perfect quality with scalable vector conversion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload and Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            {/* File Upload */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Upload SVG File</Label>
              
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Upload className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">
                      Drag your SVG here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a SVG image to get the PNG file
                    </p>
                  </div>
                </div>
              </div>

              {svgFile && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">{svgFile.name}</span>
                </div>
              )}
            </div>

            {/* Conversion Settings */}
            {svgContent && (
              <div className="space-y-6">
                <div className="border-t pt-6">
                  <Label className="text-base font-medium mb-4 block">Conversion Settings</Label>
                  
                  {/* Scale */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm text-gray-600">Scale</Label>
                      <span className="text-sm text-gray-500">{settings.scale}x</span>
                    </div>
                    <Slider
                      value={[settings.scale]}
                      onValueChange={([value]) => updateSetting('scale', value)}
                      min={0.1}
                      max={5}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500">
                      Output: {scaledWidth} × {scaledHeight} px
                    </div>
                  </div>

                  {/* Dimensions */}
                  {originalDimensions && (
                    <div className="space-y-3 mt-4">
                      <Label className="text-sm text-gray-600">Custom Dimensions</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Width (px)</Label>
                          <Input
                            type="number"
                            value={settings.width || ''}
                            onChange={(e) => updateSetting('width', parseInt(e.target.value) || undefined)}
                            placeholder="Auto"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Height (px)</Label>
                          <Input
                            type="number"
                            value={settings.height || ''}
                            onChange={(e) => updateSetting('height', parseInt(e.target.value) || undefined)}
                            placeholder="Auto"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quality */}
                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm text-gray-600">Quality</Label>
                      <span className="text-sm text-gray-500">{Math.round(settings.quality * 100)}%</span>
                    </div>
                    <Slider
                      value={[settings.quality]}
                      onValueChange={([value]) => updateSetting('quality', value)}
                      min={0.1}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  {/* Background Options */}
                  <div className="space-y-3 mt-4">
                    <Label className="text-sm text-gray-600">Background</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="background"
                          checked={settings.transparent}
                          onChange={() => updateSetting('transparent', true)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Transparent</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="background"
                          checked={!settings.transparent}
                          onChange={() => updateSetting('transparent', false)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Custom Color</span>
                      </label>
                    </div>
                    
                    {!settings.transparent && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={settings.backgroundColor}
                          onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          type="text"
                          value={settings.backgroundColor}
                          onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={applySettings} 
                    className="flex-1"
                    disabled={isConverting}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {isConverting ? 'Converting...' : 'Apply'}
                  </Button>
                  <Button onClick={resetSettings} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview and Download Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Preview & Download</Label>
                {pngDataUrl && (
                  <Button onClick={downloadPng}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PNG
                  </Button>
                )}
              </div>
              
              <div className="relative bg-gray-50 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
                {!svgContent ? (
                  <div className="text-center space-y-4">
                    <FileImage className="h-16 w-16 text-gray-300 mx-auto" />
                    <div>
                      <p className="text-gray-500 font-medium">No SVG uploaded</p>
                      <p className="text-sm text-gray-400">Upload an SVG file to see the preview</p>
                    </div>
                  </div>
                ) : isConverting ? (
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600">Converting SVG to PNG...</p>
                  </div>
                ) : pngDataUrl ? (
                  <div className="space-y-4 w-full">
                    <div className="flex justify-center">
                      <img
                        src={pngDataUrl}
                        alt="Converted PNG"
                        className="max-w-full max-h-96 object-contain border border-gray-200 rounded shadow-sm"
                        style={{
                          imageRendering: 'crisp-edges',
                        }}
                      />
                    </div>
                    <div className="text-center text-sm text-gray-600">
                      <p>Size: {scaledWidth} × {scaledHeight} px</p>
                      <p>Scale: {settings.scale}x | Quality: {Math.round(settings.quality * 100)}%</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <AlertCircle className="h-16 w-16 text-gray-300 mx-auto" />
                    <div>
                      <p className="text-gray-500 font-medium">Conversion failed</p>
                      <p className="text-sm text-gray-400">Please check your SVG file and try again</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Info Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">About SVG to PNG Converter</h2>
        <div className="text-blue-800 space-y-2">
          <p>
            Convert SVG vector graphics to high-quality PNG images with full control over scale, quality, and background settings.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Scalable Conversion:</strong> Scale up to 5x without quality loss</li>
            <li><strong>Custom Dimensions:</strong> Set specific width and height in pixels</li>
            <li><strong>Background Control:</strong> Choose transparent or custom background color</li>
            <li><strong>Quality Settings:</strong> Adjust PNG compression quality (10-100%)</li>
            <li><strong>Instant Preview:</strong> See results before downloading</li>
            <li><strong>Drag & Drop:</strong> Easy file upload with drag and drop support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
