import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Clock, Calendar } from 'lucide-react';

export function TimestampConverterTool() {
  const [timestampInput, setTimestampInput] = React.useState("");
  const [dateInput, setDateInput] = React.useState("");
  const [convertedTimestamp, setConvertedTimestamp] = React.useState("");
  const [convertedDate, setConvertedDate] = React.useState("");

  const convertTimestampToDate = () => {
    if (timestampInput) {
      const timestamp = parseInt(timestampInput, 10);
      if (!isNaN(timestamp)) {
        const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
        setConvertedDate(date.toLocaleString());
      } else {
        setConvertedDate("Invalid Timestamp");
      }
    } else {
      setConvertedDate("");
    }
  };

  const convertDateToTimestamp = () => {
    if (dateInput) {
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        setConvertedTimestamp(Math.floor(date.getTime() / 1000).toString()); // Convert milliseconds to seconds
      } else {
        setConvertedTimestamp("Invalid Date");
      }
    } else {
      setConvertedTimestamp("");
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Convert Unix timestamps to human-readable dates and vice-versa.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Label htmlFor="timestamp-input" className="text-mint-green flex items-center mb-2">
          <Clock className="h-4 w-4 mr-2" /> Unix Timestamp
        </Label>
        <Input
          id="timestamp-input"
          placeholder="e.g., 1678886400"
          value={timestampInput}
          onChange={(e) => setTimestampInput(e.target.value)}
          className="bg-card/50 border-neon-blue/30 text-neon-blue placeholder:text-muted-foreground/70"
        />
        <Button variant="glass-neon" onClick={convertTimestampToDate} className="mt-3 w-full">
          Convert to Date
        </Button>
        {convertedDate && (
          <p className="mt-2 text-neon-blue text-center text-lg font-semibold drop-shadow-[0_0_3px_#00F0FF]">
            {convertedDate}
          </p>
        )}
      </motion.div>

      <div className="relative flex items-center justify-center my-6">
        <div className="absolute w-full border-t border-neon-blue/30"></div>
        <span className="relative z-10 bg-card px-3 text-mint-green text-sm">OR</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Label htmlFor="date-input" className="text-mint-green flex items-center mb-2">
          <Calendar className="h-4 w-4 mr-2" /> Date & Time
        </Label>
        <Input
          id="date-input"
          type="datetime-local"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="bg-card/50 border-neon-blue/30 text-neon-blue placeholder:text-muted-foreground/70"
        />
        <Button variant="glass-neon" onClick={convertDateToTimestamp} className="mt-3 w-full">
          Convert to Timestamp
        </Button>
        {convertedTimestamp && (
          <p className="mt-2 text-neon-blue text-center text-lg font-semibold drop-shadow-[0_0_3px_#00F0FF]">
            {convertedTimestamp}
          </p>
        )}
      </motion.div>
    </div>
  );
}
