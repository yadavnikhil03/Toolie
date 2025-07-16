import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Clock, Calendar, Copy, RefreshCw, ArrowRightLeft } from 'lucide-react';

export function TimestampConverterTool() {
  const [timestampInput, setTimestampInput] = React.useState("");
  const [dateInput, setDateInput] = React.useState("");
  const [convertedTimestamp, setConvertedTimestamp] = React.useState("");
  const [convertedDate, setConvertedDate] = React.useState("");
  const [timestampUnit, setTimestampUnit] = React.useState("seconds");
  const [timezone, setTimezone] = React.useState("local");
  const [copied, setCopied] = React.useState("");
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Update current time every second
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const convertTimestampToDate = () => {
    if (timestampInput.trim() === "") {
      setConvertedDate("Please enter a timestamp");
      return;
    }

    const timestamp = parseFloat(timestampInput);
    if (isNaN(timestamp)) {
      setConvertedDate("Invalid timestamp format");
      return;
    }

    try {
      let date: Date;
      if (timestampUnit === "seconds") {
        date = new Date(timestamp * 1000);
      } else {
        date = new Date(timestamp);
      }

      if (isNaN(date.getTime())) {
        setConvertedDate("Invalid timestamp value");
        return;
      }

      let formattedDate: string;
      if (timezone === "utc") {
        formattedDate = date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      } else {
        formattedDate = date.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        });
      }
      setConvertedDate(formattedDate);
    } catch (error) {
      setConvertedDate("Error converting timestamp");
    }
  };

  const convertDateToTimestamp = () => {
    if (dateInput.trim() === "") {
      setConvertedTimestamp("Please enter a date");
      return;
    }

    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) {
        setConvertedTimestamp("Invalid date format");
        return;
      }

      let timestamp: number;
      if (timestampUnit === "seconds") {
        timestamp = Math.floor(date.getTime() / 1000);
      } else {
        timestamp = date.getTime();
      }
      setConvertedTimestamp(timestamp.toString());
    } catch (error) {
      setConvertedTimestamp("Error converting date");
    }
  };

  const getCurrentTimestamp = () => {
    const now = Date.now();
    if (timestampUnit === "seconds") {
      setTimestampInput(Math.floor(now / 1000).toString());
    } else {
      setTimestampInput(now.toString());
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const formatted = now.toISOString().slice(0, 16); // Format for datetime-local input
    setDateInput(formatted);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const clearAll = () => {
    setTimestampInput("");
    setDateInput("");
    setConvertedTimestamp("");
    setConvertedDate("");
    setCopied("");
  };

  // Auto-convert when inputs change
  React.useEffect(() => {
    if (timestampInput.trim() !== "") {
      convertTimestampToDate();
    } else {
      setConvertedDate("");
    }
  }, [timestampInput, timestampUnit, timezone]);

  React.useEffect(() => {
    if (dateInput.trim() !== "") {
      convertDateToTimestamp();
    } else {
      setConvertedTimestamp("");
    }
  }, [dateInput, timestampUnit]);

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <p className="text-sm text-secondary-gray">
        Convert between Unix timestamps and human-readable dates with support for different units and timezones.
      </p>

      {/* Current Time Display */}
      <motion.div
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-sm text-secondary-gray mb-1">Current Time</div>
        <div className="text-lg font-bold text-dark-gray">
          {currentTime.toLocaleString()}
        </div>
        <div className="text-sm text-secondary-gray">
          Timestamp: {timestampUnit === "seconds" ? Math.floor(currentTime.getTime() / 1000) : currentTime.getTime()}
        </div>
      </motion.div>

      {/* Configuration Options */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div>
          <Label className="text-dark-gray font-medium mb-2 block">Timestamp Unit</Label>
          <Select value={timestampUnit} onValueChange={setTimestampUnit}>
            <SelectTrigger className="border-gray-200 bg-gray-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seconds">Seconds (Unix)</SelectItem>
              <SelectItem value="milliseconds">Milliseconds (JavaScript)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-dark-gray font-medium mb-2 block">Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="border-gray-200 bg-gray-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Local Time</SelectItem>
              <SelectItem value="utc">UTC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Timestamp to Date */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
      >
        <Label htmlFor="timestamp-input" className="text-dark-gray flex items-center mb-2 font-medium">
          <Clock className="h-4 w-4 mr-2" /> {timestampUnit === "seconds" ? "Unix Timestamp (seconds)" : "Timestamp (milliseconds)"}
        </Label>
        <div className="flex gap-2 mb-3">
          <Input
            id="timestamp-input"
            placeholder={timestampUnit === "seconds" ? "e.g., 1678886400" : "e.g., 1678886400000"}
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            className="flex-1 border-gray-200 bg-white"
          />
          <Button
            onClick={getCurrentTimestamp}
            variant="outline"
            className="border-gray-200 hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {convertedDate && (
          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="flex items-center justify-between">
              <span className="text-dark-gray font-medium">{convertedDate}</span>
              {!convertedDate.includes("Please enter") && !convertedDate.includes("Invalid") && !convertedDate.includes("Error") && (
                <Button
                  onClick={() => copyToClipboard(convertedDate, "date")}
                  size="sm"
                  variant="outline"
                  className="border-gray-200 hover:bg-gray-100"
                >
                  {copied === "date" ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Separator */}
      <div className="relative flex items-center justify-center my-6">
        <div className="absolute w-full border-t border-gray-200"></div>
        <span className="relative z-10 bg-white px-3 text-secondary-gray text-sm flex items-center">
          <ArrowRightLeft className="h-4 w-4 mr-1" /> OR
        </span>
      </div>

      {/* Date to Timestamp */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
      >
        <Label htmlFor="date-input" className="text-dark-gray flex items-center mb-2 font-medium">
          <Calendar className="h-4 w-4 mr-2" /> Date & Time
        </Label>
        <div className="flex gap-2 mb-3">
          <Input
            id="date-input"
            type="datetime-local"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="flex-1 border-gray-200 bg-white"
          />
          <Button
            onClick={getCurrentDateTime}
            variant="outline"
            className="border-gray-200 hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {convertedTimestamp && (
          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="flex items-center justify-between">
              <span className="text-dark-gray font-medium font-mono">{convertedTimestamp}</span>
              {!convertedTimestamp.includes("Please enter") && !convertedTimestamp.includes("Invalid") && !convertedTimestamp.includes("Error") && (
                <Button
                  onClick={() => copyToClipboard(convertedTimestamp, "timestamp")}
                  size="sm"
                  variant="outline"
                  className="border-gray-200 hover:bg-gray-100"
                >
                  {copied === "timestamp" ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex justify-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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
