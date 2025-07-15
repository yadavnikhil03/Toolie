"use client";

import React from "react";
import { HudLayout } from "@/components/hud-layout";
import { NeonTypewriter } from "@/components/animations/neon-typewriter";
import { ToolCard } from "@/components/tool-card";
import { ToolModal } from "@/components/tool-modal";
import { FileText, Image, Music, Type, QrCode, Clock, Ruler, Palette, Key, Code2, Hash, FileJson, type LucideIcon } from 'lucide-react';

// Import tool components
import { PdfMergeTool } from "@/components/tools/pdf-merge";
import { ImageResizeTool } from "@/components/tools/image-resize";
import { Mp3TrimTool } from "@/components/tools/mp3-trim";
import { TextFormatterTool } from "@/components/tools/text-formatter";
import { QrCodeGenTool } from "@/components/tools/qr-code-gen";
import { TimestampConverterTool } from "@/components/tools/timestamp-converter";
import { UnitConverterTool } from "@/components/tools/unit-converter";
import { ColorPaletteTool } from "@/components/tools/color-palette";
import { PasswordGeneratorTool } from "@/components/tools/password-generator";
import { Base64Tool } from "@/components/tools/base64-tool";
import { HashGeneratorTool } from "@/components/tools/hash-generator";
import { JsonFormatterTool } from "@/components/tools/json-formatter";

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

  const handleOpenTool = (toolKey: ToolKey) => {
    setOpenTool(toolKey);
  };

  const handleCloseTool = () => {
    setOpenTool(null);
  };

  const CurrentToolComponent = openTool ? tools[openTool].component : null;

  return (
    <HudLayout>
      <main className="container relative z-10 flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
        <div className="mb-12 text-center animate-slide-in-left">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 text-dark-gray animate-bounce-gentle" style={{ fontFamily: 'Caveat, cursive' }}>
            <NeonTypewriter text="TOOLIE" delay={0.5} />
          </h1>
          <div className="text-xl md:text-2xl text-secondary-gray animate-slide-in-right" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <NeonTypewriter text="Your Modern Utility Suite" delay={1.5} />
          </div>
        </div>

        <section className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {Object.entries(tools).map(([key, tool], index) => (
            <div
              key={key}
              className="animate-slide-in-left"
              style={{ animationDelay: `${(index + 1) * 0.1}s` }}
            >
              <ToolCard
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                onClick={() => handleOpenTool(key as ToolKey)}
              />
            </div>
          ))}
        </section>
      </main>

      {openTool && (
        <ToolModal
          isOpen={!!openTool}
          onClose={handleCloseTool}
          title={tools[openTool].title}
        >
          {CurrentToolComponent && <CurrentToolComponent />}
        </ToolModal>
      )}
    </HudLayout>
  );
}
