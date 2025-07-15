"use client";

import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ToolModal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ToolModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={cn(
              "relative w-full max-w-3xl rounded-2xl border-2 border-gray-200 bg-white/95 p-6 shadow-2xl backdrop-blur-md",
              "transform-gpu will-change-transform",
              className
            )}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-3xl font-bold text-dark-gray" style={{ fontFamily: 'Caveat, cursive' }}>
                {title}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-secondary-gray hover:text-primary-blue hover:bg-gray-100 transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
