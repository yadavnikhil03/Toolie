import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { QrCode } from 'lucide-react';

export function QrCodeGenTool() {
  const [text, setText] = React.useState("");
  const [qrCodeUrl, setQrCodeUrl] = React.useState("");
  const [isHovered, setIsHovered] = React.useState(false);

  const generateQrCode = () => {
    if (text) {
      // In a real app, you'd use a library like 'qrcode' or a backend API
      // For now, we'll use a placeholder or a simple QR API if available
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`);
    } else {
      setQrCodeUrl("");
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Generate QR codes from any text or URL.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Label htmlFor="qr-input" className="text-mint-green flex items-center mb-2">
          <QrCode className="h-4 w-4 mr-2" /> Enter text or URL
        </Label>
        <Input
          id="qr-input"
          placeholder="e.g., https://www.vercel.com"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="bg-card/50 border-neon-blue/30 text-neon-blue placeholder:text-muted-foreground/70"
        />
      </motion.div>

      <div className="flex justify-end">
        <Button variant="glass-neon" onClick={generateQrCode}>
          Generate QR Code
        </Button>
      </div>

      {qrCodeUrl && (
        <motion.div
          className="relative flex items-center justify-center rounded-lg border border-neon-blue/50 bg-card/50 p-6 overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img src={qrCodeUrl || "/placeholder.svg"} alt="Generated QR Code" className="w-48 h-48 object-contain" />
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-neon-blue/20 to-mint-green/20 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 w-full h-1 bg-neon-blue/80 shadow-[0_0_10px_#00F0FF]"
                  initial={{ y: "-100%" }}
                  animate={{ y: "100%" }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              </div>
              <p className="text-lg font-bold text-neon-blue drop-shadow-[0_0_5px_#00F0FF]">SCANNING...</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
