"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Keyboard, Command } from 'lucide-react';
import { motion } from "framer-motion";

interface KeyboardShortcutsProps {
  onToolSelect: (toolKey: string) => void;
}

const shortcuts = [
  { key: 'Ctrl + K', description: 'Open command palette', action: 'search' },
  { key: 'Ctrl + 1', description: 'PDF Merge/Split', action: 'pdfMerge' },
  { key: 'Ctrl + 2', description: 'Image Resize', action: 'imageResize' },
  { key: 'Ctrl + 3', description: 'Text Formatter', action: 'textFormatter' },
  { key: 'Ctrl + 4', description: 'QR Code Generator', action: 'qrCodeGen' },
  { key: 'Ctrl + F', description: 'Search tools', action: 'search' },
  { key: 'Escape', description: 'Close modal/dialog', action: 'close' },
  { key: '↑/↓', description: 'Navigate tools', action: 'navigate' },
  { key: 'Enter', description: 'Open selected tool', action: 'open' },
];

export function KeyboardShortcuts({ onToolSelect }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);

  // Global keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setCommandPaletteOpen(true);
            break;
          case '1':
            e.preventDefault();
            onToolSelect('pdfMerge');
            break;
          case '2':
            e.preventDefault();
            onToolSelect('imageResize');
            break;
          case '3':
            e.preventDefault();
            onToolSelect('textFormatter');
            break;
          case '4':
            e.preventDefault();
            onToolSelect('qrCodeGen');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToolSelect]);

  return (
    <>
      {/* Keyboard Shortcuts Help */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="fixed bottom-4 right-4 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white"
          >
            <Keyboard className="h-4 w-4 mr-2" />
            Shortcuts
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <motion.div
                key={shortcut.key}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className="text-sm text-gray-700">{shortcut.description}</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {shortcut.key}
                </Badge>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Command Palette */}
      <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" />
              Quick Actions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <QuickActionItem 
              icon="📄" 
              title="PDF Merge/Split" 
              shortcut="Ctrl+1"
              onClick={() => {
                onToolSelect('pdfMerge');
                setCommandPaletteOpen(false);
              }}
            />
            <QuickActionItem 
              icon="🖼️" 
              title="Image Resize" 
              shortcut="Ctrl+2"
              onClick={() => {
                onToolSelect('imageResize');
                setCommandPaletteOpen(false);
              }}
            />
            <QuickActionItem 
              icon="📝" 
              title="Text Formatter" 
              shortcut="Ctrl+3"
              onClick={() => {
                onToolSelect('textFormatter');
                setCommandPaletteOpen(false);
              }}
            />
            <QuickActionItem 
              icon="📱" 
              title="QR Code Generator" 
              shortcut="Ctrl+4"
              onClick={() => {
                onToolSelect('qrCodeGen');
                setCommandPaletteOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface QuickActionItemProps {
  icon: string;
  title: string;
  shortcut: string;
  onClick: () => void;
}

function QuickActionItem({ icon, title, shortcut, onClick }: QuickActionItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <Badge variant="outline" className="font-mono text-xs">
        {shortcut}
      </Badge>
    </button>
  );
}
