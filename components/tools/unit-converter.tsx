import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Ruler } from 'lucide-react';

export function UnitConverterTool() {
  const [value, setValue] = React.useState("");
  const [fromUnit, setFromUnit] = React.useState("meters");
  const [toUnit, setToUnit] = React.useState("feet");
  const [convertedValue, setConvertedValue] = React.useState("");

  const units = {
    length: {
      meters: 1,
      feet: 3.28084,
      kilometers: 0.001,
      miles: 0.000621371,
      centimeters: 100,
      inches: 39.3701,
    },
    mass: {
      kilograms: 1,
      pounds: 2.20462,
      grams: 1000,
      ounces: 35.274,
    },
    temperature: {
      celsius: (val: number) => val,
      fahrenheit: (val: number) => (val - 32) * 5/9,
      kelvin: (val: number) => val - 273.15,
    },
  };

  const getUnitCategory = (unit: string) => {
    if (Object.keys(units.length).includes(unit)) return "length";
    if (Object.keys(units.mass).includes(unit)) return "mass";
    if (Object.keys(units.temperature).includes(unit)) return "temperature";
    return null;
  };

  const handleConvert = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setConvertedValue("Invalid input");
      return;
    }

    const fromCategory = getUnitCategory(fromUnit);
    const toCategory = getUnitCategory(toUnit);

    if (fromCategory !== toCategory || !fromCategory || !toCategory) {
      setConvertedValue("Incompatible units");
      return;
    }

    let result;
    if (fromCategory === "temperature") {
      // Convert to base (Celsius) first, then to target
      const valInCelsius = (units.temperature as any)[fromUnit](numValue);
      if (toUnit === "celsius") result = valInCelsius;
      else if (toUnit === "fahrenheit") result = (valInCelsius * 9/5) + 32;
      else if (toUnit === "kelvin") result = valInCelsius + 273.15;
    } else {
      const baseValue = numValue / (units as any)[fromCategory][fromUnit];
      result = baseValue * (units as any)[toCategory][toUnit];
    }

    setConvertedValue(result.toFixed(4));
  };

  const allUnits = Object.entries(units).flatMap(([category, categoryUnits]) =>
    Object.keys(categoryUnits).map(unit => ({ unit, category }))
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Convert values between various units of measurement (length, mass, temperature).
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Label htmlFor="value-input" className="text-mint-green flex items-center mb-2">
          <Ruler className="h-4 w-4 mr-2" /> Value
        </Label>
        <Input
          id="value-input"
          type="number"
          placeholder="e.g., 100"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="bg-card/50 border-neon-blue/30 text-neon-blue placeholder:text-muted-foreground/70"
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="from-unit" className="text-mint-green">From Unit</Label>
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger className="mt-1 bg-card/50 border-neon-blue/30 text-neon-blue">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent className="bg-card border-neon-blue/50 text-neon-blue">
              {allUnits.map(({ unit, category }) => (
                <SelectItem key={unit} value={unit}>
                  {unit.charAt(0).toUpperCase() + unit.slice(1)} ({category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="to-unit" className="text-mint-green">To Unit</Label>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger className="mt-1 bg-card/50 border-neon-blue/30 text-neon-blue">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent className="bg-card border-neon-blue/50 text-neon-blue">
              {allUnits.map(({ unit, category }) => (
                <SelectItem key={unit} value={unit}>
                  {unit.charAt(0).toUpperCase() + unit.slice(1)} ({category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="glass-neon" onClick={handleConvert}>
          Convert
        </Button>
      </div>

      {convertedValue && (
        <div className="mt-4 text-center">
          <p className="text-lg text-mint-green">Converted Value:</p>
          <p className="text-3xl font-bold text-neon-blue drop-shadow-[0_0_5px_#00F0FF]">
            {convertedValue}
          </p>
        </div>
      )}
    </div>
  );
}
