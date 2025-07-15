import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { FileText, Copy, ArrowRightLeft, Code2 } from 'lucide-react';

export function Base64Tool() {
  const [plainText, setPlainText] = React.useState("");
  const [encodedText, setEncodedText] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("encode");
  const [copied, setCopied] = React.useState("");

  const encodeText = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(plainText)));
      setEncodedText(encoded);
    } catch (error) {
      setEncodedText("Error: Unable to encode text");
    }
  };

  const decodeText = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(encodedText)));
      setPlainText(decoded);
    } catch (error) {
      setPlainText("Error: Invalid Base64 string");
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const clearAll = () => {
    setPlainText("");
    setEncodedText("");
  };

  const isValidBase64 = (str: string) => {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <p className="text-sm text-secondary-gray">
        Encode text to Base64 or decode Base64 strings back to readable text.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encode" className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            Encode
          </TabsTrigger>
          <TabsTrigger value="decode" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Decode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label className="text-dark-gray font-medium mb-2 block">
              Plain Text
            </Label>
            <Textarea
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              placeholder="Enter text to encode..."
              className="min-h-[100px] border-gray-200 bg-gray-50 resize-none"
            />
            <div className="flex gap-2 mt-2">
              <Button
                onClick={encodeText}
                className="bg-primary-blue hover:bg-blue-600 text-white flex items-center gap-2"
                disabled={!plainText.trim()}
              >
                <ArrowRightLeft className="h-4 w-4" />
                Encode to Base64
              </Button>
              {plainText && (
                <Button
                  onClick={() => copyToClipboard(plainText, "plain")}
                  variant="outline"
                  className="border-gray-200 hover:bg-gray-50"
                >
                  {copied === "plain" ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Label className="text-dark-gray font-medium mb-2 block">
              Base64 Encoded
            </Label>
            <Textarea
              value={encodedText}
              readOnly
              placeholder="Encoded text will appear here..."
              className="min-h-[100px] border-gray-200 bg-gray-50 font-mono text-sm resize-none"
            />
            {encodedText && (
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => copyToClipboard(encodedText, "encoded")}
                  className="bg-primary-blue hover:bg-blue-600 text-white flex items-center gap-2"
                >
                  {copied === "encoded" ? "Copied!" : <><Copy className="h-4 w-4" /> Copy Base64</>}
                </Button>
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="decode" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label className="text-dark-gray font-medium mb-2 block">
              Base64 Encoded Text
            </Label>
            <Textarea
              value={encodedText}
              onChange={(e) => setEncodedText(e.target.value)}
              placeholder="Enter Base64 string to decode..."
              className="min-h-[100px] border-gray-200 bg-gray-50 font-mono text-sm resize-none"
            />
            <div className="flex gap-2 mt-2">
              <Button
                onClick={decodeText}
                className="bg-primary-blue hover:bg-blue-600 text-white flex items-center gap-2"
                disabled={!encodedText.trim()}
              >
                <ArrowRightLeft className="h-4 w-4" />
                Decode from Base64
              </Button>
              {encodedText && (
                <Button
                  onClick={() => copyToClipboard(encodedText, "encoded")}
                  variant="outline"
                  className="border-gray-200 hover:bg-gray-50"
                >
                  {copied === "encoded" ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
            {encodedText && !isValidBase64(encodedText) && (
              <p className="text-sm text-red-500 mt-1">
                ⚠️ This doesn't appear to be valid Base64
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Label className="text-dark-gray font-medium mb-2 block">
              Decoded Text
            </Label>
            <Textarea
              value={plainText}
              readOnly
              placeholder="Decoded text will appear here..."
              className="min-h-[100px] border-gray-200 bg-gray-50 resize-none"
            />
            {plainText && (
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => copyToClipboard(plainText, "plain")}
                  className="bg-primary-blue hover:bg-blue-600 text-white flex items-center gap-2"
                >
                  {copied === "plain" ? "Copied!" : <><Copy className="h-4 w-4" /> Copy Text</>}
                </Button>
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center"
      >
        <Button
          onClick={clearAll}
          variant="outline"
          className="border-gray-200 hover:bg-gray-50"
        >
          Clear All
        </Button>
      </motion.div>
    </div>
  );
}
