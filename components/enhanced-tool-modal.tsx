"use client";

import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { X, Settings, History, Share2, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EnhancedToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  onShare?: () => void;
  usageCount?: number;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function EnhancedToolModal({
  isOpen,
  onClose,
  title,
  children,
  className,
  onShare,
  usageCount = 0,
  isFullscreen = false,
  onToggleFullscreen,
}: EnhancedToolModalProps) {
  const [activeTab, setActiveTab] = React.useState("tool");

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
              "relative w-full max-w-4xl rounded-2xl border-2 border-gray-200 bg-white/95 shadow-2xl backdrop-blur-md",
              "transform-gpu will-change-transform",
              isFullscreen && "max-w-[95vw] max-h-[95vh]",
              className
            )}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Enhanced Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-dark-gray flex items-center gap-2" style={{ fontFamily: 'Caveat, cursive' }}>
                      {title}
                      {usageCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {usageCount} uses
                        </Badge>
                      )}
                    </h2>
                    <TabsList className="mt-2">
                      <TabsTrigger value="tool">Tool</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {onShare && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onShare}
                      className="text-secondary-gray hover:text-primary-blue"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  )}
                  {onToggleFullscreen && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onToggleFullscreen}
                      className="text-secondary-gray hover:text-primary-blue"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="h-5 w-5" />
                      ) : (
                        <Maximize2 className="h-5 w-5" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-secondary-gray hover:text-primary-blue hover:bg-gray-100 transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              {/* Tab Contents */}
              <div className={cn(
                "max-h-[70vh] overflow-y-auto",
                isFullscreen && "max-h-[85vh]"
              )}>
                <TabsContent value="tool" className="p-6">
                  <div style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {children}
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="p-6">
                  <ToolSettings />
                </TabsContent>

                <TabsContent value="history" className="p-6">
                  <ToolHistory toolName={title} />
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToolSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-dark-gray">Tool Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Auto-save results</label>
            <div className="mt-1">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="ml-2 text-sm text-gray-600">Save outputs automatically</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Theme preference</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm">
              <option>Follow system</option>
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Default quality</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm">
              <option>High (100%)</option>
              <option>Medium (80%)</option>
              <option>Low (60%)</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Notifications</label>
            <div className="mt-1">
              <input type="checkbox" className="rounded border-gray-300" defaultChecked />
              <span className="ml-2 text-sm text-gray-600">Show completion notifications</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolHistory({ toolName }: { toolName: string }) {
  const mockHistory = [
    { id: 1, action: "Converted image", time: "2 minutes ago", status: "success" },
    { id: 2, action: "Resized image", time: "1 hour ago", status: "success" },
    { id: 3, action: "Format conversion", time: "Yesterday", status: "success" },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-dark-gray">Recent Activity</h3>
      
      <div className="space-y-3">
        {mockHistory.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.action}</p>
              <p className="text-xs text-gray-500">{item.time}</p>
            </div>
            <Badge variant={item.status === "success" ? "default" : "destructive"}>
              {item.status}
            </Badge>
          </div>
        ))}
      </div>
      
      <Button variant="outline" className="w-full">
        View Full History
      </Button>
    </div>
  );
}
