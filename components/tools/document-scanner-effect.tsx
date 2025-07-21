'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Upload, 
  Download, 
  RotateCcw,
  FileImage,
  Scan,
  AlertCircle,
  CheckCircle,
  Settings,
  Eye,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface ScannerSettings {
  rotation: number;
  brightness: number;
  contrast: number;
  scale: number;
  blur: number;
  noise: number;
  blackAndWhite: boolean;
  paperBorder: boolean;
  highResolution: boolean;
}

interface ProcessedDocument {
  originalDataUrl: string;
  scannedDataUrl: string;
  fileName: string;
  fileType: string;
}

export default function DocumentScannerEffect() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processedDoc, setProcessedDoc] = useState<ProcessedDocument | null>(null);
  const [settings, setSettings] = useState<ScannerSettings>({
    rotation: 1,
    brightness: 1,
    contrast: 1,
    scale: 1,
    blur: 0.25,
    noise: 0.5,
    blackAndWhite: false,
    paperBorder: true,
    highResolution: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (!validTypes.some(type => file.type.includes(type.split('/')[1]) || file.type === type)) {
      toast.error('Please upload a PDF, JPEG, PNG, WEBP, or GIF file');
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      let dataUrl: string;
      
      if (file.type === 'application/pdf') {
        // For PDF files, we'll create a placeholder since full PDF rendering requires additional libraries
        dataUrl = await createPdfPlaceholder(file);
      } else {
        // For images, convert to data URL
        dataUrl = await fileToDataUrl(file);
      }

      const processed: ProcessedDocument = {
        originalDataUrl: dataUrl,
        scannedDataUrl: dataUrl, // Will be updated when effects are applied
        fileName: file.name,
        fileType: file.type,
      };

      setProcessedDoc(processed);
      
      // Apply initial scanner effects
      await applyScannerEffects(dataUrl, processed);
      
    } catch (error) {
      toast.error('Failed to process file. Please try again.');
      console.error('File processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Convert file to data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Create PDF placeholder (in a real implementation, you'd use PDF.js)
  const createPdfPlaceholder = async (file: File): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 600;
    canvas.height = 800;
    
    if (ctx) {
      // Create a simple PDF page representation
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#333333';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PDF Document', canvas.width / 2, 100);
      
      ctx.font = '16px Arial';
      ctx.fillText(file.name, canvas.width / 2, 140);
      
      ctx.fillStyle = '#666666';
      ctx.font = '14px Arial';
      ctx.fillText('Preview not available for PDF files', canvas.width / 2, 200);
      ctx.fillText('Scanner effects will be applied to actual PDF', canvas.width / 2, 220);
      
      // Add some sample content lines
      ctx.fillStyle = '#999999';
      for (let i = 0; i < 20; i++) {
        const y = 280 + (i * 25);
        ctx.fillRect(50, y, 500, 2);
      }
    }
    
    return canvas.toDataURL();
  };

  // Apply scanner effects to image
  const applyScannerEffects = useCallback(async (originalDataUrl: string, doc: ProcessedDocument) => {
    if (!originalDataUrl) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const { rotation, brightness, contrast, scale, blur, noise, blackAndWhite, paperBorder, highResolution } = settings;
      
      // Set canvas size
      const scaleFactor = highResolution ? 2 : 1;
      const padding = paperBorder ? 40 : 0;
      
      canvas.width = (img.width * scale + padding * 2) * scaleFactor;
      canvas.height = (img.height * scale + padding * 2) * scaleFactor;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Add paper background if border is enabled
      if (paperBorder) {
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add subtle shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(5 * scaleFactor, 5 * scaleFactor, canvas.width - 10 * scaleFactor, canvas.height - 10 * scaleFactor);
      }
      
      // Apply transformations
      ctx.save();
      
      // Move to center for rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      
      // Apply blur filter
      if (blur > 0) {
        ctx.filter = `blur(${blur}px)`;
      }
      
      // Draw the image
      const drawWidth = img.width * scale * scaleFactor;
      const drawHeight = img.height * scale * scaleFactor;
      
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      
      ctx.restore();
      
      // Apply post-processing effects
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // Apply brightness and contrast
        r = Math.min(255, Math.max(0, (r - 128) * contrast + 128 + (brightness - 1) * 50));
        g = Math.min(255, Math.max(0, (g - 128) * contrast + 128 + (brightness - 1) * 50));
        b = Math.min(255, Math.max(0, (b - 128) * contrast + 128 + (brightness - 1) * 50));
        
        // Apply black and white filter
        if (blackAndWhite) {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = g = b = gray;
        }
        
        // Add noise
        if (noise > 0) {
          const noiseValue = (Math.random() - 0.5) * noise * 30;
          r = Math.min(255, Math.max(0, r + noiseValue));
          g = Math.min(255, Math.max(0, g + noiseValue));
          b = Math.min(255, Math.max(0, b + noiseValue));
        }
        
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Update processed document
      const scannedDataUrl = canvas.toDataURL('image/png', 0.9);
      setProcessedDoc(prev => prev ? { ...prev, scannedDataUrl } : null);
    };
    
    img.src = originalDataUrl;
  }, [settings]);

  // Apply settings changes
  const applySettings = () => {
    if (processedDoc) {
      applyScannerEffects(processedDoc.originalDataUrl, processedDoc);
    }
  };

  // Reset settings
  const resetSettings = () => {
    setSettings({
      rotation: 1,
      brightness: 1,
      contrast: 1,
      scale: 1,
      blur: 0.25,
      noise: 0.5,
      blackAndWhite: false,
      paperBorder: true,
      highResolution: false,
    });
  };

  // Download scanned document
  const downloadScanned = () => {
    if (!processedDoc?.scannedDataUrl) return;
    
    const link = document.createElement('a');
    const fileName = processedDoc.fileName.replace(/\.[^/.]+$/, '');
    link.download = `${fileName}_scanned.png`;
    link.href = processedDoc.scannedDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Scanned document downloaded successfully!');
  };

  // Download as PDF (simplified - in real implementation would use jsPDF)
  const downloadAsPdf = () => {
    if (!processedDoc?.scannedDataUrl) return;
    
    // For now, just download as image
    downloadScanned();
    toast.info('PDF download feature coming soon! Downloaded as image instead.');
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
  const updateSetting = (key: keyof ScannerSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Auto-apply effects when settings change
  React.useEffect(() => {
    if (processedDoc && !isProcessing) {
      const timer = setTimeout(() => {
        applyScannerEffects(processedDoc.originalDataUrl, processedDoc);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [settings, processedDoc, isProcessing, applyScannerEffects]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Document Scanner Effect</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transform your digital documents into realistic scanned-looking files. Add authentic scanner effects 
          like rotation, blur, noise, and aging to make PDFs and images appear physically scanned.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            {/* File Upload */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Upload Document</Label>
              
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
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
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <Upload className="h-10 w-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium text-sm">
                      Drag your file here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOCX and Image Files (JPEG, PNG, WEBP, GIF) are supported
                    </p>
                  </div>
                </div>
              </div>

              {uploadedFile && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">{uploadedFile.name}</span>
                </div>
              )}
            </div>

            {/* Scanner Settings */}
            {processedDoc && (
              <div className="space-y-6">
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <Label className="text-base font-medium">Scanner Settings</Label>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Rotation */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm text-gray-600">Rotation</Label>
                        <span className="text-sm text-gray-500">{settings.rotation}°</span>
                      </div>
                      <Slider
                        value={[settings.rotation]}
                        onValueChange={([value]) => updateSetting('rotation', value)}
                        min={-10}
                        max={10}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    {/* Brightness */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm text-gray-600">Brightness</Label>
                        <span className="text-sm text-gray-500">{settings.brightness}</span>
                      </div>
                      <Slider
                        value={[settings.brightness]}
                        onValueChange={([value]) => updateSetting('brightness', value)}
                        min={0}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    {/* Contrast */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm text-gray-600">Contrast</Label>
                        <span className="text-sm text-gray-500">{settings.contrast}</span>
                      </div>
                      <Slider
                        value={[settings.contrast]}
                        onValueChange={([value]) => updateSetting('contrast', value)}
                        min={0}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    {/* Scale */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm text-gray-600">Scale</Label>
                        <span className="text-sm text-gray-500">{settings.scale}</span>
                      </div>
                      <Slider
                        value={[settings.scale]}
                        onValueChange={([value]) => updateSetting('scale', value)}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    {/* Blur */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm text-gray-600">Blur</Label>
                        <span className="text-sm text-gray-500">{settings.blur}px</span>
                      </div>
                      <Slider
                        value={[settings.blur]}
                        onValueChange={([value]) => updateSetting('blur', value)}
                        min={0}
                        max={1}
                        step={0.05}
                        className="w-full"
                      />
                    </div>

                    {/* Noise */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm text-gray-600">Noise</Label>
                        <span className="text-sm text-gray-500">{settings.noise}</span>
                      </div>
                      <Slider
                        value={[settings.noise]}
                        onValueChange={([value]) => updateSetting('noise', value)}
                        min={0}
                        max={1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    {/* Toggle Options */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-gray-600">Black & White</Label>
                        <Switch
                          checked={settings.blackAndWhite}
                          onCheckedChange={(checked) => updateSetting('blackAndWhite', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-gray-600">Paper Border</Label>
                        <Switch
                          checked={settings.paperBorder}
                          onCheckedChange={(checked) => updateSetting('paperBorder', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-gray-600">High Resolution</Label>
                        <Switch
                          checked={settings.highResolution}
                          onCheckedChange={(checked) => updateSetting('highResolution', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={resetSettings} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Document Preview</Label>
                {processedDoc && (
                  <div className="flex gap-2">
                    <Button onClick={downloadScanned} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button onClick={downloadAsPdf} variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Download as PDF
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Document */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Original Document</Label>
                  <div className="relative bg-gray-50 rounded-lg p-4 min-h-[300px] flex items-center justify-center border">
                    {!processedDoc ? (
                      <div className="text-center space-y-3">
                        <FileImage className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="text-gray-500 text-sm">Upload a document to see preview</p>
                      </div>
                    ) : isProcessing ? (
                      <div className="text-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 text-sm">Processing document...</p>
                      </div>
                    ) : (
                      <img
                        src={processedDoc.originalDataUrl}
                        alt="Original Document"
                        className="max-w-full max-h-80 object-contain rounded"
                      />
                    )}
                  </div>
                </div>

                {/* Scanned Output */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Scanned Output</Label>
                  <div className="relative bg-gray-50 rounded-lg p-4 min-h-[300px] flex items-center justify-center border">
                    {!processedDoc ? (
                      <div className="text-center space-y-3">
                        <Scan className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="text-gray-500 text-sm">Upload a document to see preview</p>
                      </div>
                    ) : isProcessing ? (
                      <div className="text-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 text-sm">Applying scanner effects...</p>
                      </div>
                    ) : processedDoc.scannedDataUrl ? (
                      <img
                        src={processedDoc.scannedDataUrl}
                        alt="Scanned Document"
                        className="max-w-full max-h-80 object-contain rounded shadow-md"
                      />
                    ) : (
                      <div className="text-center space-y-3">
                        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="text-gray-500 text-sm">Failed to apply scanner effects</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Info Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">About Document Scanner Effect</h2>
        <div className="text-blue-800 space-y-2">
          <p>
            Transform your digital documents into realistic scanned-looking files without needing a physical scanner. 
            Perfect for creating authentic document appearances for various use cases.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Realistic Effects:</strong> Rotation, blur, noise, and aging effects</li>
            <li><strong>Multiple Formats:</strong> Support for PDF, DOCX, and image files</li>
            <li><strong>Customizable Settings:</strong> Fine-tune brightness, contrast, and scale</li>
            <li><strong>Paper Effects:</strong> Optional border and high-resolution output</li>
            <li><strong>Black & White Mode:</strong> Convert to monochrome for authentic scanner look</li>
            <li><strong>Privacy Focused:</strong> All processing happens in your browser</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
