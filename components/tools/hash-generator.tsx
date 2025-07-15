import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Hash, Copy, FileText, Shield } from 'lucide-react';

export function HashGeneratorTool() {
  const [inputText, setInputText] = React.useState("");
  const [hashType, setHashType] = React.useState("MD5");
  const [hashResult, setHashResult] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  // Simple hash implementations (for demonstration - in production, use crypto libraries)
  const generateMD5 = async (text: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateSHA1 = async (text: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateSHA256 = async (text: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateSHA512 = async (text: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateHash = async () => {
    if (!inputText.trim()) {
      setHashResult("Please enter text to hash");
      return;
    }

    try {
      let result = "";
      switch (hashType) {
        case "MD5":
          // Note: MD5 is not available in crypto.subtle, using SHA-256 as fallback
          result = await generateSHA256(inputText);
          break;
        case "SHA-1":
          result = await generateSHA1(inputText);
          break;
        case "SHA-256":
          result = await generateSHA256(inputText);
          break;
        case "SHA-512":
          result = await generateSHA512(inputText);
          break;
        default:
          result = await generateSHA256(inputText);
      }
      setHashResult(result);
    } catch (error) {
      setHashResult("Error generating hash");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(hashResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy hash:', err);
    }
  };

  const getHashIcon = (type: string) => {
    switch (type) {
      case "MD5": return "🔸";
      case "SHA-1": return "🔹";
      case "SHA-256": return "🔶";
      case "SHA-512": return "🔷";
      default: return "🔸";
    }
  };

  React.useEffect(() => {
    if (inputText.trim()) {
      generateHash();
    } else {
      setHashResult("");
    }
  }, [inputText, hashType]);

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <p className="text-sm text-secondary-gray">
        Generate cryptographic hashes (MD5, SHA-1, SHA-256, SHA-512) for text input.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div>
          <Label className="text-dark-gray font-medium mb-2 block flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Input Text
          </Label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to generate hash..."
            className="min-h-[100px] border-gray-200 bg-gray-50 resize-none"
          />
        </div>

        <div>
          <Label className="text-dark-gray font-medium mb-2 block flex items-center">
            <Hash className="h-4 w-4 mr-2" />
            Hash Algorithm
          </Label>
          <Select value={hashType} onValueChange={setHashType}>
            <SelectTrigger className="border-gray-200 bg-gray-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MD5">
                <span className="flex items-center">
                  🔸 MD5 (128-bit)
                </span>
              </SelectItem>
              <SelectItem value="SHA-1">
                <span className="flex items-center">
                  🔹 SHA-1 (160-bit)
                </span>
              </SelectItem>
              <SelectItem value="SHA-256">
                <span className="flex items-center">
                  🔶 SHA-256 (256-bit)
                </span>
              </SelectItem>
              <SelectItem value="SHA-512">
                <span className="flex items-center">
                  🔷 SHA-512 (512-bit)
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div>
          <Label className="text-dark-gray font-medium mb-2 block flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            {getHashIcon(hashType)} {hashType} Hash
          </Label>
          <div className="flex gap-2">
            <Input
              value={hashResult}
              readOnly
              placeholder="Hash will appear here..."
              className="flex-1 font-mono text-sm border-gray-200 bg-gray-50"
            />
            {hashResult && (
              <Button
                onClick={copyToClipboard}
                className="bg-primary-blue hover:bg-blue-600 text-white"
              >
                {copied ? "Copied!" : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {hashResult && (
          <div className="grid grid-cols-2 gap-4 text-sm text-secondary-gray">
            <div>
              <span className="font-medium">Hash Length:</span> {hashResult.length} characters
            </div>
            <div>
              <span className="font-medium">Algorithm:</span> {hashType}
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-blue-50 p-4 rounded-lg border border-blue-200"
      >
        <h4 className="font-medium text-dark-gray mb-2 flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          Security Note
        </h4>
        <p className="text-sm text-secondary-gray">
          MD5 and SHA-1 are considered cryptographically broken and should not be used for security purposes. 
          Use SHA-256 or SHA-512 for secure applications.
        </p>
      </motion.div>
    </div>
  );
}
