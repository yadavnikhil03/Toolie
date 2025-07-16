"use client";

import React from "react";
import { HudLayout } from "@/components/hud-layout";
import { NeonTypewriter } from "@/components/animations/neon-typewriter";
import { ToolCard } from "@/components/tool-card";
import { ToolModal } from "@/components/tool-modal";
import { ToolSearch } from "@/components/tool-search";
import { ToolCategories, toolCategories } from "@/components/tool-categories";
import { FileText, Image, Music, Type, QrCode, Clock, Ruler, Palette, Key, Code2, Hash, FileJson, type LucideIcon } from 'lucide-react';

// Import tool components lazily
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
  const [selectedCategory, setSelectedCategory] = React.useState("all");


  const getToolIdFromKey = (key: ToolKey): string => {
    const keyToIdMap: Record<ToolKey, string> = {
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
  

    if (selectedCategory !== "all") {
      const categoryTools = toolCategories.find(cat => cat.id === selectedCategory)?.tools || [];
      filtered = filtered.filter(([key]) => {
        const toolId = getToolIdFromKey(key as ToolKey);
        return categoryTools.includes(toolId);
      });
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
    <HudLayout>
      <main className="container relative z-10 flex min-h-screen flex-col p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 text-dark-gray" style={{ fontFamily: 'Caveat, cursive' }}>
            <NeonTypewriter text="TOOLIE" delay={0.5} />
          </h1>
          <div className="text-xl md:text-2xl text-secondary-gray" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <NeonTypewriter text="Your Modern Utility Suite" delay={1.5} />
          </div>
        </div>

        {/* Search and Categories */}
        <div className="mb-8 space-y-6">
          <ToolSearch
            value={searchQuery}
            onChange={setSearchQuery}
          />
          
          <ToolCategories
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>

        <div className="w-full max-w-6xl mx-auto">
          {/* Main Tools Grid */}
          <section className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map(([key, tool], index) => (
              <div key={key}>
                <ToolCard
                  title={tool.title}
                  description={tool.description}
                  icon={tool.icon}
                  onClick={() => handleOpenTool(key as ToolKey)}
                />
              </div>
            ))}
          </section>

          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No tools found matching your criteria.</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </main>

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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
              </div>
            }>
              <CurrentToolComponent />
            </React.Suspense>
          )}
        </ToolModal>
      )}

    </HudLayout>
  );
}
