import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Key, Copy, RefreshCw, Shield } from 'lucide-react';

export function PasswordGeneratorTool() {
  const [password, setPassword] = React.useState("");
  const [length, setLength] = React.useState([12]);
  const [includeUppercase, setIncludeUppercase] = React.useState(true);
  const [includeLowercase, setIncludeLowercase] = React.useState(true);
  const [includeNumbers, setIncludeNumbers] = React.useState(true);
  const [includeSymbols, setIncludeSymbols] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  const generatePassword = () => {
    let charset = "";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (charset === "") {
      setPassword("Please select at least one character type");
      return;
    }

    let newPassword = "";
    for (let i = 0; i < length[0]; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const getPasswordStrength = () => {
    if (password.length < 8) return { strength: "Weak", color: "#ef4444" };
    if (password.length < 12) return { strength: "Medium", color: "#f59e0b" };
    return { strength: "Strong", color: "#10b981" };
  };

  React.useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const strengthInfo = getPasswordStrength();

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <p className="text-sm text-secondary-gray">
        Generate secure passwords with customizable options.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div>
          <Label className="text-dark-gray flex items-center mb-3 font-medium">
            <Key className="h-4 w-4 mr-2" /> Password Length: {length[0]}
          </Label>
          <Slider
            value={length}
            onValueChange={setLength}
            max={50}
            min={4}
            step={1}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="uppercase"
              checked={includeUppercase}
              onCheckedChange={(checked) => setIncludeUppercase(!!checked)}
            />
            <Label htmlFor="uppercase" className="text-sm text-dark-gray">Uppercase (A-Z)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lowercase"
              checked={includeLowercase}
              onCheckedChange={(checked) => setIncludeLowercase(!!checked)}
            />
            <Label htmlFor="lowercase" className="text-sm text-dark-gray">Lowercase (a-z)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="numbers"
              checked={includeNumbers}
              onCheckedChange={(checked) => setIncludeNumbers(!!checked)}
            />
            <Label htmlFor="numbers" className="text-sm text-dark-gray">Numbers (0-9)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="symbols"
              checked={includeSymbols}
              onCheckedChange={(checked) => setIncludeSymbols(!!checked)}
            />
            <Label htmlFor="symbols" className="text-sm text-dark-gray">Symbols (!@#$)</Label>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div>
          <Label className="text-dark-gray font-medium mb-2 block">Generated Password</Label>
          <div className="flex gap-2">
            <Input
              value={password}
              readOnly
              className="flex-1 font-mono text-sm border-gray-200 bg-gray-50"
            />
            <Button
              onClick={copyToClipboard}
              className="bg-primary-blue hover:bg-blue-600 text-white"
            >
              {copied ? "Copied!" : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              onClick={generatePassword}
              variant="outline"
              className="border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" style={{ color: strengthInfo.color }} />
          <span className="text-sm font-medium" style={{ color: strengthInfo.color }}>
            {strengthInfo.strength} Password
          </span>
        </div>
      </motion.div>
    </div>
  );
}
