import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { FileText, Copy, CheckCircle, XCircle, Minimize2, Maximize2, RotateCcw } from 'lucide-react';

export function JsonFormatterTool() {
  const [inputJson, setInputJson] = React.useState("");
  const [outputJson, setOutputJson] = React.useState("");
  const [indentSize, setIndentSize] = React.useState([2]);
  const [isValid, setIsValid] = React.useState<boolean | null>(null);
  const [error, setError] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [stats, setStats] = React.useState({ chars: 0, lines: 0, objects: 0, arrays: 0 });

  const analyzeJson = (jsonString: string) => {
    const chars = jsonString.length;
    const lines = jsonString.split('\n').length;
    const objects = (jsonString.match(/\{/g) || []).length;
    const arrays = (jsonString.match(/\[/g) || []).length;
    return { chars, lines, objects, arrays };
  };

  const formatJson = () => {
    if (!inputJson.trim()) {
      setOutputJson("");
      setIsValid(null);
      setError("");
      setStats({ chars: 0, lines: 0, objects: 0, arrays: 0 });
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, indentSize[0]);
      setOutputJson(formatted);
      setIsValid(true);
      setError("");
      setStats(analyzeJson(formatted));
    } catch (err) {
      setOutputJson("");
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Invalid JSON format");
      setStats(analyzeJson(inputJson));
    }
  };

  const minifyJson = () => {
    if (!inputJson.trim()) return;

    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
      setIsValid(true);
      setError("");
      setStats(analyzeJson(minified));
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Invalid JSON format");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  const clearAll = () => {
    setInputJson("");
    setOutputJson("");
    setIsValid(null);
    setError("");
    setStats({ chars: 0, lines: 0, objects: 0, arrays: 0 });
  };

  const loadSample = () => {
    const sampleJson = `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "coding", "traveling"],
  "address": {
    "street": "123 Main St",
    "zipCode": "10001"
  },
  "isActive": true
}`;
    setInputJson(sampleJson);
  };

  React.useEffect(() => {
    formatJson();
  }, [inputJson, indentSize]);

  const getStatusColor = () => {
    if (isValid === null) return "text-secondary-gray";
    return isValid ? "text-green-600" : "text-red-600";
  };

  const getStatusIcon = () => {
    if (isValid === null) return null;
    return isValid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <p className="text-sm text-secondary-gray">
        Format, validate, and minify JSON data with real-time analysis.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <Label className="text-dark-gray font-medium flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            JSON Input
          </Label>
          <div className="flex gap-2">
            <Button
              onClick={loadSample}
              variant="outline"
              size="sm"
              className="border-gray-200 hover:bg-gray-50 text-xs"
            >
              Load Sample
            </Button>
            <Button
              onClick={clearAll}
              variant="outline"
              size="sm"
              className="border-gray-200 hover:bg-gray-50 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
        
        <Textarea
          value={inputJson}
          onChange={(e) => setInputJson(e.target.value)}
          placeholder="Paste your JSON here..."
          className="min-h-[150px] border-gray-200 bg-gray-50 font-mono text-sm resize-none"
        />

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">
              {isValid === null ? "Enter JSON" : isValid ? "Valid JSON" : "Invalid JSON"}
            </span>
          </div>
          
          {error && (
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              {error}
            </span>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <Label className="text-dark-gray font-medium">
            Indent Size: {indentSize[0]} spaces
          </Label>
          <div className="flex gap-2">
            <Button
              onClick={formatJson}
              className="bg-primary-blue hover:bg-blue-600 text-white text-sm"
              disabled={!inputJson.trim()}
            >
              <Maximize2 className="h-4 w-4 mr-1" />
              Format
            </Button>
            <Button
              onClick={minifyJson}
              variant="outline"
              className="border-gray-200 hover:bg-gray-50 text-sm"
              disabled={!inputJson.trim()}
            >
              <Minimize2 className="h-4 w-4 mr-1" />
              Minify
            </Button>
          </div>
        </div>

        <Slider
          value={indentSize}
          onValueChange={setIndentSize}
          max={8}
          min={1}
          step={1}
          className="w-full"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <Label className="text-dark-gray font-medium">Formatted Output</Label>
          {outputJson && (
            <Button
              onClick={copyToClipboard}
              className="bg-primary-blue hover:bg-blue-600 text-white text-sm"
            >
              {copied ? "Copied!" : <><Copy className="h-4 w-4 mr-1" /> Copy</>}
            </Button>
          )}
        </div>

        <Textarea
          value={outputJson}
          readOnly
          placeholder="Formatted JSON will appear here..."
          className="min-h-[150px] border-gray-200 bg-gray-50 font-mono text-sm resize-none"
        />

        {outputJson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-4 gap-4 text-sm text-secondary-gray bg-blue-50 p-3 rounded-lg border border-blue-200"
          >
            <div className="text-center">
              <div className="font-medium text-dark-gray">{stats.chars}</div>
              <div className="text-xs">Characters</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-dark-gray">{stats.lines}</div>
              <div className="text-xs">Lines</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-dark-gray">{stats.objects}</div>
              <div className="text-xs">Objects</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-dark-gray">{stats.arrays}</div>
              <div className="text-xs">Arrays</div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
