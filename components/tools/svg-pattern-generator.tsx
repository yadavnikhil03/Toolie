'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Copy, 
  Download, 
  Shuffle, 
  RotateCcw,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Star,
  Heart,
  Zap,
  Diamond
} from 'lucide-react';
import { toast } from 'sonner';

interface PatternSettings {
  type: string;
  size: number;
  spacing: number;
  rotation: number;
  skew: number;
  opacity: number;
  patternColor: string;
  backgroundColor: string;
  exportWidth: number;
  exportHeight: number;
}

const PATTERN_SHAPES = [
  { id: 'circle', name: 'Circle', icon: Circle },
  { id: 'square', name: 'Square', icon: Square },
  { id: 'triangle', name: 'Triangle', icon: Triangle },
  { id: 'hexagon', name: 'Hexagon', icon: Hexagon },
  { id: 'star', name: 'Star', icon: Star },
  { id: 'heart', name: 'Heart', icon: Heart },
  { id: 'diamond', name: 'Diamond', icon: Diamond },
  { id: 'lightning', name: 'Lightning', icon: Zap },
];

const EXPORT_PRESETS = [
  { name: 'Custom', width: 1920, height: 1080 },
  { name: 'Facebook Cover', width: 1640, height: 859 },
  { name: 'Twitter Header', width: 1500, height: 500 },
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'LinkedIn Cover', width: 1584, height: 396 },
];

const PRESET_COLORS = [
  '#47d3ff', '#474bff', '#ff6b6b', '#4ecdc4', '#45b7d1',
  '#f39c12', '#e74c3c', '#9b59b6', '#2ecc71', '#34495e'
];

export default function SvgPatternGenerator() {
  const [settings, setSettings] = useState<PatternSettings>({
    type: 'circle',
    size: 32,
    spacing: 30,
    rotation: 0,
    skew: 0,
    opacity: 1,
    patternColor: '#47d3ff',
    backgroundColor: '#474bff',
    exportWidth: 1920,
    exportHeight: 1080,
  });

  const [selectedPreset, setSelectedPreset] = useState('Custom');
  const [svgCode, setSvgCode] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Generate shape path
  const generateShapePath = useCallback((type: string, size: number) => {
    const half = size / 2;
    const center = size / 2;
    
    switch (type) {
      case 'circle':
        return `<circle cx="${center}" cy="${center}" r="${half * 0.8}" />`;
      
      case 'square':
        const squareSize = size * 0.8;
        const offset = (size - squareSize) / 2;
        return `<rect x="${offset}" y="${offset}" width="${squareSize}" height="${squareSize}" />`;
      
      case 'triangle':
        const points = [
          [center, size * 0.1],
          [size * 0.9, size * 0.9],
          [size * 0.1, size * 0.9]
        ];
        return `<polygon points="${points.map(p => p.join(',')).join(' ')}" />`;
      
      case 'hexagon':
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = center + (half * 0.8) * Math.cos(angle);
          const y = center + (half * 0.8) * Math.sin(angle);
          hexPoints.push([x, y]);
        }
        return `<polygon points="${hexPoints.map(p => p.join(',')).join(' ')}" />`;
      
      case 'star':
        const starPoints = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5;
          const radius = i % 2 === 0 ? half * 0.8 : half * 0.4;
          const x = center + radius * Math.cos(angle - Math.PI / 2);
          const y = center + radius * Math.sin(angle - Math.PI / 2);
          starPoints.push([x, y]);
        }
        return `<polygon points="${starPoints.map(p => p.join(',')).join(' ')}" />`;
      
      case 'heart':
        const heartPath = `M${center},${size * 0.75} 
          C${center},${size * 0.5} ${size * 0.2},${size * 0.3} ${size * 0.2},${size * 0.45}
          C${size * 0.2},${size * 0.25} ${size * 0.4},${size * 0.15} ${center},${size * 0.3}
          C${size * 0.6},${size * 0.15} ${size * 0.8},${size * 0.25} ${size * 0.8},${size * 0.45}
          C${size * 0.8},${size * 0.3} ${center},${size * 0.5} ${center},${size * 0.75}z`;
        return `<path d="${heartPath}" />`;
      
      case 'diamond':
        const diamondPoints = [
          [center, size * 0.1],
          [size * 0.9, center],
          [center, size * 0.9],
          [size * 0.1, center]
        ];
        return `<polygon points="${diamondPoints.map(p => p.join(',')).join(' ')}" />`;
      
      case 'lightning':
        const lightningPath = `M${size * 0.4},${size * 0.1} 
          L${size * 0.6},${size * 0.1} 
          L${size * 0.3},${size * 0.5} 
          L${size * 0.5},${size * 0.5} 
          L${size * 0.2},${size * 0.9} 
          L${size * 0.7},${size * 0.4} 
          L${size * 0.5},${size * 0.4} 
          L${size * 0.8},${size * 0.1}z`;
        return `<path d="${lightningPath}" />`;
      
      default:
        return `<circle cx="${center}" cy="${center}" r="${half * 0.8}" />`;
    }
  }, []);

  // Generate SVG pattern
  const generateSvgPattern = useCallback(() => {
    const { type, size, spacing, rotation, skew, opacity, patternColor, backgroundColor, exportWidth, exportHeight } = settings;
    
    const totalSize = size + spacing;
    const shapePath = generateShapePath(type, size);
    
    const patternTransform = `rotate(${rotation}) skewX(${skew})`;
    
    const svg = `<svg width="${exportWidth}" height="${exportHeight}" viewBox="0 0 ${exportWidth} ${exportHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="pattern" x="0" y="0" width="${totalSize}" height="${totalSize}" patternUnits="userSpaceOnUse" patternTransform="${patternTransform}">
      <g fill="${patternColor}" opacity="${opacity}">
        ${shapePath}
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="${backgroundColor}" />
  <rect width="100%" height="100%" fill="url(#pattern)" />
</svg>`;
    
    setSvgCode(svg);
  }, [settings, generateShapePath]);

  // Update SVG when settings change
  useEffect(() => {
    generateSvgPattern();
  }, [generateSvgPattern]);

  // Handle preset change
  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = EXPORT_PRESETS.find(p => p.name === presetName);
    if (preset) {
      setSettings(prev => ({
        ...prev,
        exportWidth: preset.width,
        exportHeight: preset.height,
      }));
    }
  };

  // Update settings
  const updateSetting = (key: keyof PatternSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Shuffle colors
  const shuffleColors = () => {
    const patternColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
    const backgroundColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
    setSettings(prev => ({ ...prev, patternColor, backgroundColor }));
  };

  // Reset settings
  const resetSettings = () => {
    setSettings({
      type: 'circle',
      size: 32,
      spacing: 30,
      rotation: 0,
      skew: 0,
      opacity: 1,
      patternColor: '#47d3ff',
      backgroundColor: '#474bff',
      exportWidth: 1920,
      exportHeight: 1080,
    });
    setSelectedPreset('Custom');
  };

  // Copy SVG code
  const copySvgCode = () => {
    navigator.clipboard.writeText(svgCode);
    toast.success('SVG code copied to clipboard!');
  };

  // Download SVG
  const downloadSvg = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pattern-${settings.type}-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('SVG pattern downloaded!');
  };

  // Download as PNG
  const downloadPng = () => {
    const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = settings.exportWidth;
      canvas.height = settings.exportHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `pattern-${settings.type}-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(pngUrl);
            toast.success('PNG pattern downloaded!');
          }
        });
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">SVG Pattern Generator</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create beautiful SVG background patterns with customizable shapes, colors, and settings. 
          Export as SVG code, SVG file, or PNG image.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            {/* Pattern Type */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Pattern Type</Label>
              <div className="grid grid-cols-4 gap-2">
                {PATTERN_SHAPES.map((shape) => {
                  const IconComponent = shape.icon;
                  const isSelected = settings.type === shape.id;
                  return (
                    <Button
                      key={shape.id}
                      onClick={() => updateSetting('type', shape.id)}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className={`
                        aspect-square h-16 w-auto min-w-16
                        flex items-center justify-center
                        ${isSelected 
                          ? '!bg-blue-600 !text-white !border-blue-600 hover:!bg-blue-700' 
                          : '!bg-white !text-gray-700 !border-gray-300 hover:!bg-gray-50'
                        }
                        transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                      `}
                      title={shape.name}
                      type="button"
                    >
                      <IconComponent 
                        className="h-6 w-6 !stroke-current"
                        strokeWidth={2}
                        style={{ 
                          color: isSelected ? 'white' : '#374151',
                          width: '24px',
                          height: '24px'
                        }}
                      />
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Pattern Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.patternColor}
                    onChange={(e) => updateSetting('patternColor', e.target.value)}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={settings.patternColor}
                    onChange={(e) => updateSetting('patternColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Background Color</Label>
                <div className="flex gap-2">
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
              </div>
            </div>

            {/* Pattern Settings */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Pattern Settings</Label>
              
              <div className="flex justify-between mb-4">
                <Button onClick={resetSettings} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={shuffleColors} variant="outline" size="sm">
                  <Shuffle className="h-4 w-4 mr-2" />
                  Shuffle Colors
                </Button>
              </div>

              <div className="space-y-4">
                {/* Size */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm text-gray-600">Size</Label>
                    <span className="text-sm text-gray-500">{settings.size}px</span>
                  </div>
                  <Slider
                    value={[settings.size]}
                    onValueChange={([value]) => updateSetting('size', value)}
                    min={8}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Spacing */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm text-gray-600">Spacing</Label>
                    <span className="text-sm text-gray-500">{settings.spacing}px</span>
                  </div>
                  <Slider
                    value={[settings.spacing]}
                    onValueChange={([value]) => updateSetting('spacing', value)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Rotation */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm text-gray-600">Rotation</Label>
                    <span className="text-sm text-gray-500">{settings.rotation}°</span>
                  </div>
                  <Slider
                    value={[settings.rotation]}
                    onValueChange={([value]) => updateSetting('rotation', value)}
                    min={-180}
                    max={180}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Skew */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm text-gray-600">Skew</Label>
                    <span className="text-sm text-gray-500">{settings.skew}°</span>
                  </div>
                  <Slider
                    value={[settings.skew]}
                    onValueChange={([value]) => updateSetting('skew', value)}
                    min={-45}
                    max={45}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm text-gray-600">Pattern Opacity</Label>
                    <span className="text-sm text-gray-500">{settings.opacity}</span>
                  </div>
                  <Slider
                    value={[settings.opacity]}
                    onValueChange={([value]) => updateSetting('opacity', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Export Settings */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Export Size Settings</Label>
              
              <div className="space-y-3">
                <Select value={selectedPreset} onValueChange={handlePresetChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPORT_PRESETS.map((preset) => (
                      <SelectItem key={preset.name} value={preset.name}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Width (px)</Label>
                    <Input
                      type="number"
                      value={settings.exportWidth}
                      onChange={(e) => updateSetting('exportWidth', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Height (px)</Label>
                    <Input
                      type="number"
                      value={settings.exportHeight}
                      onChange={(e) => updateSetting('exportHeight', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Export</Label>
              <div className="space-y-2">
                <Button onClick={copySvgCode} className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy SVG Code
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={downloadSvg} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download SVG
                  </Button>
                  <Button onClick={downloadPng} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PNG
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Preview</Label>
              
              <div className="relative bg-gray-50 rounded-lg p-4 min-h-[500px] flex items-center justify-center overflow-hidden">
                <div 
                  ref={canvasRef}
                  className="w-full h-full max-w-2xl max-h-2xl"
                  style={{
                    aspectRatio: `${settings.exportWidth}/${settings.exportHeight}`,
                  }}
                  dangerouslySetInnerHTML={{ __html: svgCode }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">About SVG Pattern Generator</h2>
        <div className="text-blue-800 space-y-2">
          <p>
            Create beautiful SVG background patterns with customizable shapes, colors, and settings. 
            Perfect for web backgrounds, social media graphics, and design projects.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Multiple Shapes:</strong> Choose from circles, squares, triangles, and more</li>
            <li><strong>Full Customization:</strong> Adjust size, spacing, rotation, skew, and opacity</li>
            <li><strong>Color Control:</strong> Set pattern and background colors with color picker</li>
            <li><strong>Export Options:</strong> Download as SVG or PNG, or copy SVG code</li>
            <li><strong>Social Media Presets:</strong> Ready-made sizes for Facebook, Twitter, Instagram</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
