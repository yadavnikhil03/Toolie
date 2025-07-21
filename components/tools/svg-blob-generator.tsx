"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Copy, 
  Download, 
  Shuffle, 
  Palette,
  Settings,
  Image as ImageIcon,
  Sparkles,
  Layers,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlobPoint {
  x: number;
  y: number;
  handleInX: number;
  handleInY: number;
  handleOutX: number;
  handleOutY: number;
}

const SvgBlobGenerator: React.FC = () => {
  const [fillColor, setFillColor] = useState<string>('#474bff');
  const [growth, setGrowth] = useState<number>(6);
  const [edgeCount, setEdgeCount] = useState<number>(6);
  const [useImageBackground, setUseImageBackground] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [svgCode, setSvgCode] = useState<string>('');
  const [blobSeed, setBlobSeed] = useState<number>(Math.random());
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [localGrowth, setLocalGrowth] = useState<number>(6);
  const [localEdgeCount, setLocalEdgeCount] = useState<number>(6);

  const canvasRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Debounced update function for smooth slider interactions
  const debouncedUpdate = useCallback((newGrowth: number, newEdgeCount: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setGrowth(newGrowth);
      setEdgeCount(newEdgeCount);
    }, 100); // 100ms debounce for smooth updates
  }, []);

  // Handle growth change with immediate visual feedback
  const handleGrowthChange = (value: number[]) => {
    setLocalGrowth(value[0]);
    debouncedUpdate(value[0], localEdgeCount);
  };

  // Handle edge count change with immediate visual feedback
  const handleEdgeCountChange = (value: number[]) => {
    setLocalEdgeCount(value[0]);
    debouncedUpdate(localGrowth, value[0]);
  };

  // Seeded random number generator for consistent results
  const seededRandom = useCallback((seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }, []);

  // Generate blob points based on parameters
  const generateBlobPoints = useCallback((seed: number): BlobPoint[] => {
    const points: BlobPoint[] = [];
    const angleStep = (Math.PI * 2) / edgeCount;
    const baseRadius = 150;
    
    // Better growth calculation for smoother shapes
    const minRadius = baseRadius * (growth / 10);
    const maxRadius = baseRadius;
    
    for (let i = 0; i < edgeCount; i++) {
      const angle = i * angleStep;
      const randomSeed1 = seed + i * 1000;
      const randomSeed2 = seed + i * 1000 + 500;
      const randomSeed3 = seed + i * 1000 + 750;
      const randomSeed4 = seed + i * 1000 + 1000;
      
      // Smoother radius calculation with better randomness
      const randomFactor = seededRandom(randomSeed1);
      const radius = minRadius + (maxRadius - minRadius) * randomFactor;
      
      // Calculate main point
      const x = 200 + Math.cos(angle) * radius;
      const y = 200 + Math.sin(angle) * radius;
      
      // Much smoother control points calculation
      const prevAngle = (i - 1) * angleStep;
      const nextAngle = (i + 1) * angleStep;
      
      // Calculate smooth tangent directions
      const tangentLength = radius * (0.25 + seededRandom(randomSeed2) * 0.15); // Reduced variation for smoothness
      
      // Use perpendicular angles for smoother curves
      const inAngle = angle - Math.PI / 2;
      const outAngle = angle + Math.PI / 2;
      
      // Add subtle randomness to avoid perfect circles
      const angleVariation = (seededRandom(randomSeed3) - 0.5) * 0.3; // Reduced from 0.5
      const lengthVariation = 0.8 + seededRandom(randomSeed4) * 0.4; // More consistent length
      
      points.push({
        x,
        y,
        handleInX: x + Math.cos(inAngle + angleVariation) * tangentLength * lengthVariation,
        handleInY: y + Math.sin(inAngle + angleVariation) * tangentLength * lengthVariation,
        handleOutX: x + Math.cos(outAngle - angleVariation) * tangentLength * lengthVariation,
        handleOutY: y + Math.sin(outAngle - angleVariation) * tangentLength * lengthVariation,
      });
    }
    
    return points;
  }, [edgeCount, growth, seededRandom]);

  // Generate SVG path from points with smoother curves
  const generateSvgPath = useCallback((points: BlobPoint[]): string => {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    
    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      
      // Use smoother control points for better curves
      path += ` C ${current.handleOutX.toFixed(2)} ${current.handleOutY.toFixed(2)}, ${next.handleInX.toFixed(2)} ${next.handleInY.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
    }
    
    path += ' Z';
    return path;
  }, []);

  // Generate complete SVG code
  const generateSvg = useCallback(() => {
    const points = generateBlobPoints(blobSeed);
    const path = generateSvgPath(points);
    
    let fillContent: string;
    
    if (useImageBackground && imageUrl && !imageError) {
      // Create pattern for image fill
      fillContent = `
    <defs>
      <pattern id="imagePattern" patternUnits="objectBoundingBox" width="1" height="1">
        <image href="${imageUrl}" x="0" y="0" width="400" height="400" preserveAspectRatio="xMidYMid slice"/>
      </pattern>
    </defs>
    <path d="${path}" fill="url(#imagePattern)"/>`;
    } else {
      // Use solid color fill
      fillContent = `<path d="${path}" fill="${fillColor}"/>`;
    }
    
    const svg = `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">${fillContent}
</svg>`;
    
    setSvgCode(svg);
  }, [blobSeed, fillColor, useImageBackground, imageUrl, imageError, generateBlobPoints, generateSvgPath]);

  // Handle image URL validation
  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    if (url && useImageBackground) {
      setIsImageLoading(true);
      setImageError(false);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setIsImageLoading(false);
        setImageError(false);
      };
      img.onerror = () => {
        setIsImageLoading(false);
        setImageError(true);
        toast({
          title: "Image Error",
          description: "Failed to load image. Please check the URL.",
          variant: "destructive",
        });
      };
      img.src = url;
    }
  };

  const shuffleBlob = () => {
    setBlobSeed(Math.random());
  };

  // Copy SVG to clipboard
  const copySvgCode = async () => {
    try {
      await navigator.clipboard.writeText(svgCode);
      toast({
        title: "Copied!",
        description: "SVG code copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy SVG code. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Download SVG file
  const downloadSvg = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'blob.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "SVG blob file downloaded successfully.",
    });
  };

  // Generate initial blob and setup animation
  useEffect(() => {
    generateSvg();
  }, [generateSvg]);

  // SVG regeneration happens automatically through useEffect dependencies

  // Preset colors
  const presetColors = [
    '#474bff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
    '#feca57', '#ff9ff3', '#54a0ff', '#fd79a8', '#fdcb6e',
    '#6c5ce7', '#a29bfe', '#74b9ff', '#0984e3', '#00b894',
    '#00cec9', '#e17055', '#d63031', '#e84393', '#8e44ad'
  ];

  // Sample image URLs for quick testing
  const sampleImages = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            SVG Blob Generator
          </CardTitle>
          <p className="text-gray-600">
            Generate beautiful, organic SVG blob shapes for backgrounds, decorations, and design elements. 
            Perfect for modern web designs and branding.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Preview</Label>
                <div className="flex gap-2">
                  <Button onClick={shuffleBlob} variant="outline" size="sm" className="min-w-[90px] min-h-[36px] justify-center">
                    <Shuffle className="h-4 w-4 mr-2" />
                    Shuffle
                  </Button>
                </div>
              </div>
              
              <div className="relative bg-gray-50 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                <style jsx>{`
                  .blob-container {
                    transition: all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
                  }
                  
                  .blob-container svg {
                    transition: all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
                  }
                  
                  .blob-container svg path {
                    transition: d 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), 
                                fill 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
                  }
                `}</style>
                {isImageLoading && useImageBackground ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading image...
                  </div>
                ) : (
                  <div 
                    ref={canvasRef}
                    className="w-80 h-80 blob-container"
                    dangerouslySetInnerHTML={{ __html: svgCode }}
                  />
                )}
              </div>

              {/* Export Buttons */}
              <div className="flex gap-3">
                <Button onClick={copySvgCode} className="flex-1 min-h-[40px]">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy SVG Code
                </Button>
                <Button onClick={downloadSvg} variant="outline" className="flex-1 min-h-[40px]">
                  <Download className="h-4 w-4 mr-2" />
                  Download SVG
                </Button>
              </div>
            </div>

            {/* Controls Section */}
            <div className="space-y-6">
              {/* Fill Settings */}
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Fill Settings
                </Label>
                
                {!useImageBackground && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-600">Blob Fill Color</Label>
                      <div className="flex gap-3 items-center mt-1">
                        <Input
                          type="color"
                          value={fillColor}
                          onChange={(e) => setFillColor(e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          type="text"
                          value={fillColor}
                          onChange={(e) => setFillColor(e.target.value)}
                          placeholder="#474bff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    {/* Preset Colors */}
                    <div>
                      <Label className="text-sm text-gray-600">Quick Colors</Label>
                      <div className="grid grid-cols-10 gap-1 mt-1">
                        {presetColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setFillColor(color)}
                            className={`w-6 h-6 rounded border-2 transition-all ${
                              fillColor === color ? 'border-gray-400 scale-110' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Background Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={useImageBackground}
                    onCheckedChange={setUseImageBackground}
                  />
                  <Label className="text-sm">Use Image Background</Label>
                </div>

                {useImageBackground && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-600">Background Image URL</Label>
                      <Input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                      />
                      {imageError && (
                        <p className="text-xs text-red-500 mt-1">
                          Failed to load image. Please check the URL.
                        </p>
                      )}
                    </div>
                    
                    {/* Sample Images */}
                    <div>
                      <Label className="text-sm text-gray-600">Quick Sample Images</Label>
                      <div className="grid grid-cols-5 gap-2 mt-1">
                        {sampleImages.map((url, index) => (
                          <button
                            key={index}
                            onClick={() => handleImageUrlChange(url)}
                            className="aspect-square rounded border border-gray-200 hover:border-blue-400 overflow-hidden transition-colors"
                          >
                            <img
                              src={url}
                              alt={`Sample ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Shape Settings */}
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Shape Settings
                </Label>

                {/* Growth Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm text-gray-600">Growth: {localGrowth}</Label>
                    <span className="text-xs text-gray-500">Shape smoothness</span>
                  </div>
                  <Slider
                    value={[localGrowth]}
                    onValueChange={handleGrowthChange}
                    min={3}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500">
                    Higher values create smoother, more circular shapes
                  </div>
                </div>

                {/* Edge Count Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm text-gray-600">Edge Count: {localEdgeCount}</Label>
                    <span className="text-xs text-gray-500">Shape complexity</span>
                  </div>
                  <Slider
                    value={[localEdgeCount]}
                    onValueChange={handleEdgeCountChange}
                    min={3}
                    max={12}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500">
                    More edges create more complex blob shapes
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Quick Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => { 
                        setLocalGrowth(4); 
                        setLocalEdgeCount(4); 
                        setGrowth(4); 
                        setEdgeCount(4);
                      }}
                      variant="outline"
                      size="sm"
                      className="min-h-[36px] justify-center"
                    >
                      Organic (4, 4)
                    </Button>
                    <Button
                      onClick={() => { 
                        setLocalGrowth(6); 
                        setLocalEdgeCount(6); 
                        setGrowth(6); 
                        setEdgeCount(6);
                      }}
                      variant="outline"
                      size="sm"
                      className="min-h-[36px] justify-center"
                    >
                      Balanced (6, 6)
                    </Button>
                    <Button
                      onClick={() => { 
                        setLocalGrowth(8); 
                        setLocalEdgeCount(8); 
                        setGrowth(8); 
                        setEdgeCount(8);
                      }}
                      variant="outline"
                      size="sm"
                      className="min-h-[36px] justify-center"
                    >
                      Smooth (8, 8)
                    </Button>
                    <Button
                      onClick={() => { 
                        setLocalGrowth(9); 
                        setLocalEdgeCount(10); 
                        setGrowth(9); 
                        setEdgeCount(10);
                      }}
                      variant="outline"
                      size="sm"
                      className="min-h-[36px] justify-center"
                    >
                      Fluid (9, 10)
                    </Button>
                  </div>
                </div>
              </div>

              {/* Random Generation */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Generate Variations
                </Label>
                <div className="flex gap-2">
                  <Button onClick={shuffleBlob} className="flex-1 min-h-[40px] justify-center">
                    <Shuffle className="h-4 w-4 mr-2" />
                    Generate New Shape
                  </Button>
                  <Button 
                    onClick={() => {
                      setFillColor(presetColors[Math.floor(Math.random() * presetColors.length)]);
                      shuffleBlob();
                    }}
                    variant="outline"
                    className="min-h-[40px] min-w-[110px] px-4 justify-center"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Random All
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* SVG Code Display */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Generated SVG Code</Label>
            <div className="relative">
              <textarea
                value={svgCode}
                readOnly
                className="w-full h-32 p-3 border rounded-lg font-mono text-sm bg-gray-50 resize-none"
                placeholder="SVG code will appear here..."
              />
              <Button
                onClick={copySvgCode}
                size="sm"
                className="absolute top-2 right-2 min-h-[32px] px-3"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Usage Ideas</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Website Backgrounds:</strong> Use as decorative background elements</li>
              <li>• <strong>Logo Design:</strong> Create unique organic shapes for branding</li>
              <li>• <strong>Image Masks:</strong> Use as clip-path for creative image layouts</li>
              <li>• <strong>Icons & Graphics:</strong> Perfect for modern, fluid design elements</li>
              <li>• <strong>Presentations:</strong> Add visual interest to slides and documents</li>
              <li>• <strong>CSS Integration:</strong> Use as background-image or mask in CSS</li>
            </ul>
          </div>

          {/* Technical Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">🔧 Technical Details</h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• <strong>Format:</strong> Scalable Vector Graphics (SVG)</li>
              <li>• <strong>Viewbox:</strong> 400x400 units (scales to any size)</li>
              <li>• <strong>Browser Support:</strong> All modern browsers</li>
              <li>• <strong>File Size:</strong> Typically under 1KB</li>
              <li>• <strong>Quality:</strong> Vector-based, infinite resolution</li>
              <li>• <strong>Customization:</strong> Easily editable with code or design tools</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SvgBlobGenerator;
