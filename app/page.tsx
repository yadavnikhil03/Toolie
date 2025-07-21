"use client";

import React from "react";
import { HudLayout } from "@/components/hud-layout";
import { NeonTypewriter } from "@/components/animations/neon-typewriter";
import { ToolCard } from "@/components/tool-card";
import { ToolModal } from "@/components/tool-modal";
import { ToolSearch } from "@/components/tool-search";
import { ToolCategories, toolCategories } from "@/components/tool-categories";
import { FileText, Image, Music, Type, QrCode, Clock, Ruler, Palette, Key, Code2, Hash, FileJson, Calculator, PenTool, Eye, Crop, Sparkles, FileImage, Scan, Loader2, Zap, Rocket, Star, Wand2, type LucideIcon } from 'lucide-react';

// Import tool components lazily
const CaseConverterTool = React.lazy(() => import("@/components/tools/case-converter"));
const LetterCounterTool = React.lazy(() => import("@/components/tools/letter-counter"));
const TextToHandwritingTool = React.lazy(() => import("@/components/tools/text-to-handwriting"));
const BionicReadingTool = React.lazy(() => import("@/components/tools/bionic-reading"));
const GoogleFontsPairFinderTool = React.lazy(() => import("@/components/tools/google-fonts-pair-finder"));
const ImageCropperTool = React.lazy(() => import("@/components/tools/image-cropper"));
const PdfMergeTool = React.lazy(() => import("@/components/tools/pdf-merge").then(m => ({ default: m.PdfMergeTool })));
const ImageResizeTool = React.lazy(() => import("@/components/tools/image-resize").then(m => ({ default: m.ImageResizeTool })));
const Mp3TrimTool = React.lazy(() => import("@/components/tools/mp3-trim").then(m => ({ default: m.Mp3TrimTool })));
const TextFormatterTool = React.lazy(() => import("@/components/tools/text-formatter").then(m => ({ default: m.TextFormatterTool })));
const QrCodeGenTool = React.lazy(() => import("@/components/tools/qr-code-gen").then(m => ({ default: m.QrCodeGenTool })));
const TimestampConverterTool = React.lazy(() => import("@/components/tools/timestamp-converter").then(m => ({ default: m.TimestampConverterTool })));
const UnitConverterTool = React.lazy(() => import("@/components/tools/unit-converter").then(m => ({ default: m.UnitConverterTool })));
const ColorPaletteTool = React.lazy(() => import("@/components/tools/color-palette").then(m => ({ default: m.ColorPaletteTool })));
const PasswordGeneratorTool = React.lazy(() => import("@/components/tools/password-generator").then(m => ({ default: m.PasswordGeneratorTool })));
const Base64Tool = React.lazy(() => import("@/components/tools/base64-tool").then(m => ({ default: m.Base64Tool })));
const HashGeneratorTool = React.lazy(() => import("@/components/tools/hash-generator").then(m => ({ default: m.HashGeneratorTool })));
const JsonFormatterTool = React.lazy(() => import("@/components/tools/json-formatter").then(m => ({ default: m.JsonFormatterTool })));
const SvgBlobGeneratorTool = React.lazy(() => import("@/components/tools/svg-blob-generator"));
const SvgPatternGeneratorTool = React.lazy(() => import("@/components/tools/svg-pattern-generator"));
const SvgToPngConverterTool = React.lazy(() => import("@/components/tools/svg-to-png-converter"));
const DocumentScannerEffectTool = React.lazy(() => import("@/components/tools/document-scanner-effect"));

type ToolKey =
  | "caseConverter"
  | "letterCounter"
  | "textToHandwriting"
  | "bionicReading"
  | "googleFontsPairFinder"
  | "imageCropper"
  | "pdfMerge"
  | "imageResize"
  | "mp3Trim"
  | "textFormatter"
  | "qrCodeGen"
  | "timestampConverter"
  | "unitConverter"
  | "colorPalette"
  | "passwordGenerator"
  | "base64Tool"
  | "hashGenerator"
  | "jsonFormatter"
  | "svgBlobGenerator"
  | "svgPatternGenerator"
  | "svgToPngConverter"
  | "documentScannerEffect";

interface ToolConfig {
  title: string;
  description: string;
  icon: LucideIcon;
  component: React.ElementType;
}

const tools: Record<ToolKey, ToolConfig> = {
  caseConverter: {
    title: "Case Converter",
    description: "UPPERCASE, lowercase, Title Case - switch between them instantly.",
    icon: Type,
    component: CaseConverterTool,
  },
  letterCounter: {
    title: "Letter Counter",
    description: "Count characters and words. Great for Twitter limits and essays.",
    icon: Calculator,
    component: LetterCounterTool,
  },
  textToHandwriting: {
    title: "Text to Handwriting",
    description: "Make your typed text look like actual handwriting.",
    icon: PenTool,
    component: TextToHandwritingTool,
  },
  bionicReading: {
    title: "Bionic Reading",
    description: "Bold the first half of words to read faster. It actually works.",
    icon: Eye,
    component: BionicReadingTool,
  },
  googleFontsPairFinder: {
    title: "Font Pair Finder",
    description: "Find Google Font combos that don't look terrible together.",
    icon: Type,
    component: GoogleFontsPairFinderTool,
  },
  imageCropper: {
    title: "Image Cropper",
    description: "Crop, rotate, and resize images without losing quality.",
    icon: Crop,
    component: ImageCropperTool,
  },
  pdfMerge: {
    title: "PDF Tools",
    description: "Combine PDFs or split them apart. Works right in your browser.",
    icon: FileText,
    component: PdfMergeTool,
  },
  imageResize: {
    title: "Image Resizer",
    description: "Change image size and format. JPG to PNG, big to small, whatever.",
    icon: Image,
    component: ImageResizeTool,
  },
  mp3Trim: {
    title: "Audio Trimmer",
    description: "Cut audio files and convert between formats. No fancy software needed.",
    icon: Music,
    component: Mp3TrimTool,
  },
  textFormatter: {
    title: "Text Formatter",
    description: "Clean up text formatting and count stuff at the same time.",
    icon: Type,
    component: TextFormatterTool,
  },
  qrCodeGen: {
    title: "QR Code Maker",
    description: "Turn any text or link into a QR code people can actually scan.",
    icon: QrCode,
    component: QrCodeGenTool,
  },
  timestampConverter: {
    title: "Timestamp Converter",
    description: "Convert Unix timestamps to dates and back. Developer lifesaver.",
    icon: Clock,
    component: TimestampConverterTool,
  },
  unitConverter: {
    title: "Unit Converter",
    description: "Convert anything - feet to meters, pounds to kilos, you name it.",
    icon: Ruler,
    component: UnitConverterTool,
  },
  colorPalette: {
    title: "Color Tools",
    description: "Pick colors, convert between HEX/RGB/HSL, build palettes.",
    icon: Palette,
    component: ColorPaletteTool,
  },
  passwordGenerator: {
    title: "Password Generator",
    description: "Generate strong passwords that you'll definitely forget.",
    icon: Key,
    component: PasswordGeneratorTool,
  },
  base64Tool: {
    title: "Base64 Tool",
    description: "Encode and decode Base64. Useful for APIs and weird data stuff.",
    icon: Code2,
    component: Base64Tool,
  },
  hashGenerator: {
    title: "Hash Generator",
    description: "Create MD5, SHA-1, SHA-256 hashes for security and verification.",
    icon: Hash,
    component: HashGeneratorTool,
  },
  jsonFormatter: {
    title: "JSON Formatter",
    description: "Make ugly JSON readable, validate it, or compress it down.",
    icon: FileJson,
    component: JsonFormatterTool,
  },
  svgBlobGenerator: {
    title: "Blob Generator",
    description: "Create those trendy organic shapes for backgrounds and design.",
    icon: Sparkles,
    component: SvgBlobGeneratorTool,
  },
  svgPatternGenerator: {
    title: "Pattern Generator",
    description: "Generate cool SVG patterns for backgrounds and textures.",
    icon: Sparkles,
    component: SvgPatternGeneratorTool,
  },
  svgToPngConverter: {
    title: "SVG to PNG",
    description: "Convert vector graphics to regular images. High quality guaranteed.",
    icon: FileImage,
    component: SvgToPngConverterTool,
  },
  documentScannerEffect: {
    title: "Document Scanner Effect",
    description: "Make digital docs look like they were actually scanned.",
    icon: Scan,
    component: DocumentScannerEffectTool,
  },
};

export default function HomePage() {
  const [openTool, setOpenTool] = React.useState<ToolKey | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("text-tools");


  const getToolIdFromKey = (key: ToolKey): string => {
    const keyToIdMap: Record<ToolKey, string> = {
      caseConverter: "case-converter",
      letterCounter: "letter-counter",
      textToHandwriting: "text-to-handwriting",
      bionicReading: "bionic-reading",
      googleFontsPairFinder: "google-fonts-pair-finder",
      imageCropper: "image-cropper",
      pdfMerge: "pdf-merge",
      imageResize: "image-resize", 
      mp3Trim: "mp3-trim",
      textFormatter: "text-formatter",
      qrCodeGen: "qr-code-gen",
      timestampConverter: "timestamp-converter",
      unitConverter: "unit-converter",
      colorPalette: "color-palette",
      passwordGenerator: "password-generator",
      base64Tool: "base64-tool",
      hashGenerator: "hash-generator",
      jsonFormatter: "json-formatter",
      svgBlobGenerator: "svg-blob-generator",
      svgPatternGenerator: "svg-pattern-generator",
      svgToPngConverter: "svg-to-png-converter",
      documentScannerEffect: "document-scanner-effect"
    };
    return keyToIdMap[key];
  };
  

  const filteredTools = React.useMemo(() => {
    let filtered = Object.entries(tools);
  
    // Filter by category if a specific category is selected and it has tools
    if (selectedCategory !== "all") {
      const categoryTools = toolCategories.find(cat => cat.id === selectedCategory)?.tools || [];
      if (categoryTools.length > 0) {
        filtered = filtered.filter(([key]) => {
          return categoryTools.includes(key);
        });
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(([_, tool]) =>
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const handleOpenTool = (toolKey: ToolKey) => {
    setOpenTool(toolKey);
  };

  const handleCloseTool = () => {
    setOpenTool(null);
  };

  const CurrentToolComponent = openTool ? tools[openTool].component : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">
              Toolie
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Tools</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Categories</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section with Animations */}
        <div className="text-center mb-20 relative">
          {/* Floating Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-100 rounded-full animate-bounce opacity-20"></div>
            <div className="absolute top-20 right-20 w-16 h-16 bg-purple-100 rounded-full animate-pulse opacity-30"></div>
            <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-green-100 rounded-full animate-ping opacity-25"></div>
            <div className="absolute bottom-20 right-1/3 w-14 h-14 bg-yellow-100 rounded-full animate-bounce opacity-20" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="relative z-10">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-8 animate-pulse">
              <Zap className="w-4 h-4" />
              Stop switching between 20 different websites
              <Sparkles className="w-4 h-4" />
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              <span className="inline-block animate-fade-in-up">Every</span>{" "}
              <span className="inline-block animate-fade-in-up text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" style={{animationDelay: '0.2s'}}>
                tool
              </span>{" "}
              <span className="inline-block animate-fade-in-up" style={{animationDelay: '0.4s'}}>you need</span>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Rocket className="w-12 h-12 text-blue-600 animate-bounce" />
                <span className="text-4xl md:text-5xl lg:text-6xl animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                  in one place
                </span>
              </div>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              I got tired of bookmarking tons of random tool websites, so I built this. 
              Now I've got everything from text formatters to image converters right here. No ads, no BS, just tools that work.
            </p>
            
            {/* Stats Animation */}
            <div className="flex justify-center gap-8 mb-8 animate-fade-in-up" style={{animationDelay: '1s'}}>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 flex items-center justify-center gap-1">
                  <Star className="w-6 h-6" />
                  22+
                </div>
                <div className="text-sm text-gray-500">Tools</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 flex items-center justify-center gap-1">
                  <Wand2 className="w-6 h-6" />
                  5
                </div>
                <div className="text-sm text-gray-500">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 flex items-center justify-center gap-1">
                  <Zap className="w-6 h-6" />
                  100%
                </div>
                <div className="text-sm text-gray-500">Free</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section with Enhanced Styling */}
        <div className="mb-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">🔍 Looking for something specific?</h3>
              <p className="text-gray-600">Just type what you need and we'll find it</p>
            </div>
            <div className="relative">
              <ToolSearch
                value={searchQuery}
                onChange={setSearchQuery}
              />
              {/* Search suggestions could go here */}
            </div>
          </div>
        </div>

        {/* Tool Categories with Better Styling */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pick what you're working on
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're coding, designing, or just trying to get stuff done
            </p>
          </div>
          <ToolCategories
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>

        {/* Tools Grid with Stagger Animation */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🛠️ Here's what we've got ({filteredTools.length} tools)
            </h3>
            <p className="text-gray-600">Click any tool to jump right in</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredTools.map(([key, tool], index) => (
              <div 
                key={key}
                className="animate-fade-in-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <ToolCard
                  title={tool.title}
                  description={tool.description}
                  icon={tool.icon}
                  onClick={() => handleOpenTool(key as ToolKey)}
                  className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl p-6 group"
                />
              </div>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-20 animate-fade-in">
              <div className="text-6xl mb-4">🤷‍♂️</div>
              <p className="text-gray-500 text-xl mb-2">Hmm, can't find anything like that.</p>
              <p className="text-gray-400">Try searching for something else or check out the categories above.</p>
            </div>
          )}
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-900 mb-4">
              <Rocket className="w-8 h-8 text-blue-600" />
              Toolie
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-gray-600 mb-6">
              Built with way too much coffee ☕ by{" "}
              <a 
                href="https://github.com/yadavnikhil03" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline transition-colors font-medium"
              >
                yadavnikhil03
              </a>
            </p>
            <div className="flex justify-center gap-2 mb-6">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Free forever</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">No signup needed</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Works offline</span>
            </div>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1">
                <Star className="w-4 h-4" /> About
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1">
                <Wand2 className="w-4 h-4" /> Feedback
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1">
                <Zap className="w-4 h-4" /> Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Tool Modal */}
      {openTool && (
        <ToolModal
          isOpen={!!openTool}
          onClose={handleCloseTool}
          title={tools[openTool].title}
        >
          {CurrentToolComponent && (
            <React.Suspense fallback={
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }>
              <CurrentToolComponent />
            </React.Suspense>
          )}
        </ToolModal>
      )}
    </div>
  );
}
