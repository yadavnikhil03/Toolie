import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { QrCode, Download, Copy, RefreshCw } from 'lucide-react';

export function QrCodeGenTool() {
  const [text, setText] = React.useState("");
  const [qrCodeUrl, setQrCodeUrl] = React.useState("");
  const [isHovered, setIsHovered] = React.useState(false);
  const [size, setSize] = React.useState([200]);
  const [errorCorrection, setErrorCorrection] = React.useState("M");
  const [format, setFormat] = React.useState("PNG");
  const [copied, setCopied] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generateQrCode = async () => {
    if (!text.trim()) {
      setQrCodeUrl("");
      return;
    }

    setIsGenerating(true);
    try {
      // Using QR Server API with enhanced options
      const baseUrl = "https://api.qrserver.com/v1/create-qr-code/";
      const params = new URLSearchParams({
        size: `${size[0]}x${size[0]}`,
        data: text,
        ecc: errorCorrection,
        format: format.toLowerCase(),
        download: "0"
      });

      const url = `${baseUrl}?${params.toString()}`;
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Error generating QR code:", error);
      setQrCodeUrl("");
    }
    setIsGenerating(false);
  };

  const downloadQrCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qr-code-${Date.now()}.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const clearAll = () => {
    setText("");
    setQrCodeUrl("");
    setCopied(false);
  };

  // Auto-generate when text changes
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateQrCode();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [text, size, errorCorrection, format]);

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <p className="text-sm text-secondary-gray">
        Generate high-quality QR codes from any text, URL, or data with customizable options.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Label htmlFor="qr-input" className="text-dark-gray flex items-center mb-2 font-medium">
          <QrCode className="h-4 w-4 mr-2" /> Enter text, URL, or data
        </Label>
        <div className="flex gap-2">
          <Input
            id="qr-input"
            placeholder="e.g., https://www.example.com or any text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 border-gray-200 bg-gray-50"
          />
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="border-gray-200 hover:bg-gray-50"
            disabled={!text}
          >
            {copied ? "Copied!" : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div>
          <Label className="text-dark-gray font-medium mb-2 block">
            Size: {size[0]}x{size[0]} pixels
          </Label>
          <Slider
            value={size}
            onValueChange={setSize}
            max={500}
            min={100}
            step={10}
            className="w-full"
          />
        </div>
        
        <div>
          <Label className="text-dark-gray font-medium mb-2 block">Error Correction</Label>
          <Select value={errorCorrection} onValueChange={setErrorCorrection}>
            <SelectTrigger className="border-gray-200 bg-gray-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Low (~7%)</SelectItem>
              <SelectItem value="M">Medium (~15%)</SelectItem>
              <SelectItem value="Q">Quartile (~25%)</SelectItem>
              <SelectItem value="H">High (~30%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-dark-gray font-medium mb-2 block">Format</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="border-gray-200 bg-gray-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PNG">PNG</SelectItem>
              <SelectItem value="SVG">SVG</SelectItem>
              <SelectItem value="JPG">JPG</SelectItem>
              <SelectItem value="GIF">GIF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <div className="flex justify-center gap-3">
        <Button 
          onClick={generateQrCode} 
          className="bg-primary-blue hover:bg-blue-600 text-white"
          disabled={!text.trim() || isGenerating}
        >
          {isGenerating ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <QrCode className="h-4 w-4 mr-2" />}
          {isGenerating ? "Generating..." : "Generate QR Code"}
        </Button>
        <Button 
          onClick={clearAll} 
          variant="outline"
          className="border-gray-200 hover:bg-gray-50"
        >
          Clear All
        </Button>
      </div>

      {qrCodeUrl && (
        <motion.div
          className="relative flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-white p-6 overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img 
            src={qrCodeUrl} 
            alt="Generated QR Code" 
            className="max-w-full h-auto object-contain mb-4"
            style={{ width: `${size[0]}px`, height: `${size[0]}px` }}
          />
          
          <div className="flex gap-3">
            <Button
              onClick={downloadQrCode}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download {format}
            </Button>
          </div>

          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary-blue/10 to-green-500/10 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 w-full h-1 bg-primary-blue/80 shadow-[0_0_10px_#3b82f6]"
                  initial={{ y: "-100%" }}
                  animate={{ y: "100%" }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              </div>
              <p className="text-lg font-bold text-primary-blue drop-shadow-[0_0_5px_#3b82f6] z-10">READY TO SCAN</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
