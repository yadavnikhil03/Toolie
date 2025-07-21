"use client";

import React from "react";
import { HudLayout } from "@/components/hud-layout";
import { NeonTypewriter } from "@/components/animations/neon-typewriter";
import { ToolCard } from "@/components/tool-card";
import { ToolModal } from "@/components/tool-modal";
import { ToolSearch } from "@/components/tool-search";
import { ToolCategories, toolCategories } from "@/components/tool-categories";
import { FileText, Image, Music, Type, QrCode, Clock, Ruler, Palette, Key, Code2, Hash, FileJson, Calculator, PenTool, type LucideIcon } from 'lucide-react';

// Import tool components lazily
const CaseConverterTool = React.lazy(() => import("@/components/tools/case-converter"));
const LetterCounterTool = React.lazy(() => import("@/components/tools/letter-counter"));
const TextToHandwritingTool = React.lazy(() => import("@/components/tools/text-to-handwriting"));
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

type ToolKey =
  | "caseConverter"
  | "letterCounter"
  | "textToHandwriting"
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
  | "jsonFormatter";

interface ToolConfig {
  title: string;
  description: string;
  icon: LucideIcon;
  component: React.ElementType;
}

const tools: Record<ToolKey, ToolConfig> = {
  caseConverter: {
    title: "Case Converter",
    description: "Convert text between different case formats.",
    icon: Type,
    component: CaseConverterTool,
  },
  letterCounter: {
    title: "Letter Counter",
    description: "Count letters, words, and sentences with social media limits.",
    icon: Calculator,
    component: LetterCounterTool,
  },
  textToHandwriting: {
    title: "Text to Handwriting",
    description: "Convert digital text into beautiful handwritten notes.",
    icon: PenTool,
    component: TextToHandwritingTool,
  },
  pdfMerge: {
    title: "PDF Merge / Split",
    description: "Combine or divide PDF documents.",
    icon: FileText,
    component: PdfMergeTool,
  },
  imageResize: {
    title: "Image Resize / Convert",
    description: "Adjust image dimensions and formats.",
    icon: Image,
    component: ImageResizeTool,
  },
  mp3Trim: {
    title: "MP3 Trim / Convert",
    description: "Cut audio files or change formats.",
    icon: Music,
    component: Mp3TrimTool,
  },
  textFormatter: {
    title: "Text Case + Count",
    description: "Format text and get character/word counts.",
    icon: Type,
    component: TextFormatterTool,
  },
  qrCodeGen: {
    title: "QR Code Generator",
    description: "Create QR codes from text or URLs.",
    icon: QrCode,
    component: QrCodeGenTool,
  },
  timestampConverter: {
    title: "Timestamp ↔ Date",
    description: "Convert between Unix timestamps and dates.",
    icon: Clock,
    component: TimestampConverterTool,
  },
  unitConverter: {
    title: "Unit Converter",
    description: "Convert various units of measurement.",
    icon: Ruler,
    component: UnitConverterTool,
  },
  colorPalette: {
    title: "Color Palette",
    description: "Generate and convert colors (HEX, HSL, RGB).",
    icon: Palette,
    component: ColorPaletteTool,
  },
  passwordGenerator: {
    title: "Password Generator",
    description: "Create secure passwords with custom options.",
    icon: Key,
    component: PasswordGeneratorTool,
  },
  base64Tool: {
    title: "Base64 Encoder/Decoder",
    description: "Encode and decode Base64 strings.",
    icon: Code2,
    component: Base64Tool,
  },
  hashGenerator: {
    title: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes.",
    icon: Hash,
    component: HashGeneratorTool,
  },
  jsonFormatter: {
    title: "JSON Formatter",
    description: "Format, validate, and minify JSON data.",
    icon: FileJson,
    component: JsonFormatterTool,
  },
};

export default function HomePage() {
  const [openTool, setOpenTool] = React.useState<ToolKey | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("favorite");


  const getToolIdFromKey = (key: ToolKey): string => {
    const keyToIdMap: Record<ToolKey, string> = {
      caseConverter: "case-converter",
      letterCounter: "letter-counter",
      textToHandwriting: "text-to-handwriting",
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
      jsonFormatter: "json-formatter"
    };
    return keyToIdMap[key];
  };
  

  const filteredTools = React.useMemo(() => {
    let filtered = Object.entries(tools);
  
    // Filter by category if a specific category is selected and it has tools
    if (selectedCategory !== "favorite") {
      const categoryTools = toolCategories.find(cat => cat.id === selectedCategory)?.tools || [];
      if (categoryTools.length > 0) {
        filtered = filtered.filter(([key]) => {
          const toolId = getToolIdFromKey(key as ToolKey);
          return categoryTools.includes(toolId);
        });
      }
    }
    // For "favorite" category, show all tools for now (can be customized later)

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
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            All Online Tools in{" "}
            <span className="text-blue-600">"One Box"</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            No need to bookmark the tools you like separately. Toolie is a free all-in-one toolbox solution created to ease your life by preventing bookmark mess.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-16">
          <div className="max-w-2xl mx-auto">
            <ToolSearch
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
        </div>

        {/* Tool Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Tool Categories</h2>
          <ToolCategories
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>

        {/* Tools Grid */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredTools.map(([key, tool], index) => (
              <ToolCard
                key={key}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                onClick={() => handleOpenTool(key as ToolKey)}
                className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 rounded-lg p-6"
              />
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-xl mb-2">No tools found matching your criteria.</p>
              <p className="text-gray-400">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-4">Toolie</div>
            <p className="text-gray-600 mb-6">Made with ❤️ for developers and creators</p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">About</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Terms</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Contact</a>
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
