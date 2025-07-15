import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Palette, Copy, RefreshCw } from 'lucide-react';

export function ColorPaletteTool() {
  const [baseColor, setBaseColor] = React.useState("#3b82f6");
  const [palette, setPalette] = React.useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const generatePalette = () => {
    const baseHsl = hexToHsl(baseColor);
    const newPalette = [
      baseColor,
      hslToHex(baseHsl.h, Math.max(baseHsl.s - 20, 0), Math.min(baseHsl.l + 20, 100)),
      hslToHex(baseHsl.h, Math.min(baseHsl.s + 20, 100), Math.max(baseHsl.l - 20, 0)),
      hslToHex((baseHsl.h + 30) % 360, baseHsl.s, baseHsl.l),
      hslToHex((baseHsl.h + 60) % 360, baseHsl.s, baseHsl.l),
      hslToHex((baseHsl.h + 120) % 360, baseHsl.s, baseHsl.l),
      hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l),
      hslToHex((baseHsl.h + 240) % 360, baseHsl.s, baseHsl.l),
    ];
    setPalette(newPalette);
  };

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    const hslToRgb = (h: number, s: number, l: number) => {
      h /= 360; s /= 100; l /= 100;
      const k = (n: number) => (n + h / (1/12)) % 1;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
    };

    const [r, g, b] = hslToRgb(h, s, l);
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  };

  const copyToClipboard = async (color: string, index: number) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  };

  const generateRandomColor = () => {
    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    setBaseColor(randomColor);
  };

  React.useEffect(() => {
    generatePalette();
  }, [baseColor]);

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <p className="text-sm text-secondary-gray">
        Generate beautiful color palettes from a base color.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="base-color" className="text-dark-gray flex items-center mb-2 font-medium">
              <Palette className="h-4 w-4 mr-2" /> Base Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="base-color"
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="w-16 h-10 p-1 border-gray-200"
              />
              <Input
                type="text"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="flex-1 border-gray-200"
                placeholder="#3b82f6"
              />
            </div>
          </div>
          <Button
            onClick={generateRandomColor}
            className="bg-secondary-gray hover:bg-gray-600 text-white mt-6"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Random
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Label className="text-dark-gray font-medium mb-4 block">Generated Palette</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {palette.map((color, index) => (
            <motion.div
              key={index}
              className="group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => copyToClipboard(color, index)}
            >
              <div
                className="w-full h-20 rounded-lg shadow-md border-2 border-gray-200 group-hover:border-primary-blue transition-all duration-200"
                style={{ backgroundColor: color }}
              />
              <div className="mt-2 text-center">
                <p className="text-sm font-medium text-dark-gray">{color}</p>
                {copiedIndex === index ? (
                  <p className="text-xs text-green-600 font-medium">Copied!</p>
                ) : (
                  <p className="text-xs text-secondary-gray group-hover:text-primary-blue">Click to copy</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
