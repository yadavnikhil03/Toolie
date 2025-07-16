import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Ruler, Copy, RefreshCw } from 'lucide-react';

export function UnitConverterTool() {
  const [value, setValue] = React.useState("");
  const [fromUnit, setFromUnit] = React.useState("meters");
  const [toUnit, setToUnit] = React.useState("feet");
  const [convertedValue, setConvertedValue] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const units = {
    length: {
      // Base unit: meter
      meters: 1,
      kilometers: 0.001,
      centimeters: 100,
      millimeters: 1000,
      inches: 39.3701,
      feet: 3.28084,
      yards: 1.09361,
      miles: 0.000621371,
      nauticalMiles: 0.000539957,
    },
    mass: {
      // Base unit: kilogram
      kilograms: 1,
      grams: 1000,
      pounds: 2.20462,
      ounces: 35.274,
      stones: 0.157473,
      tons: 0.001,
    },
    temperature: {
      // Special handling for temperature
      celsius: (val: number) => val,
      fahrenheit: (val: number) => (val - 32) * 5/9,
      kelvin: (val: number) => val - 273.15,
    },
    volume: {
      // Base unit: liter
      liters: 1,
      milliliters: 1000,
      gallons: 0.264172,
      quarts: 1.05669,
      pints: 2.11338,
      cups: 4.22675,
      fluidOunces: 33.814,
      tablespoons: 67.628,
      teaspoons: 202.884,
    },
    area: {
      // Base unit: square meter
      squareMeters: 1,
      squareKilometers: 0.000001,
      squareCentimeters: 10000,
      squareInches: 1550,
      squareFeet: 10.7639,
      squareYards: 1.19599,
      acres: 0.000247105,
      hectares: 0.0001,
    },
    time: {
      // Base unit: second
      seconds: 1,
      minutes: 1/60,
      hours: 1/3600,
      days: 1/86400,
      weeks: 1/604800,
      months: 1/2629746,
      years: 1/31556952,
    },
    speed: {
      // Base unit: meters per second
      metersPerSecond: 1,
      kilometersPerHour: 3.6,
      milesPerHour: 2.23694,
      feetPerSecond: 3.28084,
      knots: 1.94384,
    },
  };

  const getUnitCategory = (unit: string) => {
    for (const [category, categoryUnits] of Object.entries(units)) {
      if (Object.keys(categoryUnits).includes(unit)) return category;
    }
    return null;
  };

  const handleConvert = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || value.trim() === "") {
      setConvertedValue("Please enter a valid number");
      return;
    }

    const fromCategory = getUnitCategory(fromUnit);
    const toCategory = getUnitCategory(toUnit);

    if (fromCategory !== toCategory || !fromCategory || !toCategory) {
      setConvertedValue("Cannot convert between different unit types");
      return;
    }

    let result: number;
    if (fromCategory === "temperature") {
      // Convert to base (Celsius) first, then to target
      let valInCelsius = numValue;
      
      // Convert from input unit to Celsius
      if (fromUnit === "fahrenheit") valInCelsius = (numValue - 32) * 5/9;
      else if (fromUnit === "kelvin") valInCelsius = numValue - 273.15;
      
      // Convert from Celsius to target unit
      if (toUnit === "celsius") result = valInCelsius;
      else if (toUnit === "fahrenheit") result = (valInCelsius * 9/5) + 32;
      else if (toUnit === "kelvin") result = valInCelsius + 273.15;
      else result = valInCelsius;
    } else {
      // For all other categories, convert through base unit
      const baseValue = numValue / (units as any)[fromCategory][fromUnit];
      result = baseValue * (units as any)[fromCategory][toUnit];
    }

    // Format result based on magnitude
    let formattedResult: string;
    if (Math.abs(result) >= 1000000) {
      formattedResult = result.toExponential(4);
    } else if (Math.abs(result) < 0.0001 && result !== 0) {
      formattedResult = result.toExponential(4);
    } else {
      formattedResult = result.toFixed(6).replace(/\.?0+$/, '');
    }
    
    setConvertedValue(formattedResult);
  };

  const copyToClipboard = async () => {
    if (convertedValue && !convertedValue.includes("Please enter") && !convertedValue.includes("Cannot convert")) {
      try {
        await navigator.clipboard.writeText(convertedValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  const clearAll = () => {
    setValue("");
    setConvertedValue("");
    setCopied(false);
  };

  // Auto-convert when inputs change
  React.useEffect(() => {
    if (value.trim() !== "") {
      handleConvert();
    } else {
      setConvertedValue("");
    }
  }, [value, fromUnit, toUnit]);

  const allUnits = Object.entries(units).flatMap(([category, categoryUnits]) =>
    Object.keys(categoryUnits).map(unit => ({ unit, category }))
  );

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <p className="text-sm text-secondary-gray">
        Convert values between various units of measurement (length, mass, temperature).
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Label htmlFor="value-input" className="text-primary-blue flex items-center mb-2 font-medium">
          <Ruler className="h-4 w-4 mr-2" /> Value
        </Label>
        <Input
          id="value-input"
          type="number"
          placeholder="e.g., 100"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border-gray-200 bg-gray-50"
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="from-unit" className="text-primary-blue font-medium">From Unit</Label>
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger className="mt-1 border-gray-200 bg-gray-50">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              {allUnits.map(({ unit, category }) => (
                <SelectItem key={unit} value={unit}>
                  {unit.charAt(0).toUpperCase() + unit.slice(1)} ({category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="to-unit" className="text-primary-blue font-medium">To Unit</Label>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger className="mt-1 border-gray-200 bg-gray-50">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              {allUnits.map(({ unit, category }) => (
                <SelectItem key={unit} value={unit}>
                  {unit.charAt(0).toUpperCase() + unit.slice(1)} ({category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <Button onClick={handleConvert} className="bg-primary-blue hover:bg-blue-600 text-white">
          <RefreshCw className="h-4 w-4 mr-2" />
          Convert
        </Button>
        <Button onClick={clearAll} variant="outline" className="border-gray-200 hover:bg-gray-50">
          Clear
        </Button>
      </div>

      {convertedValue && (
        <motion.div 
          className="mt-4 text-center bg-blue-50 p-6 rounded-lg border border-blue-200"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg text-primary-blue font-medium mb-2">Converted Value:</p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-3xl font-bold text-dark-gray">
              {convertedValue} {toUnit}
            </p>
            {convertedValue && !convertedValue.includes("Please enter") && !convertedValue.includes("Cannot convert") && (
              <Button
                onClick={copyToClipboard}
                size="sm"
                className="bg-primary-blue hover:bg-blue-600 text-white"
              >
                {copied ? "Copied!" : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </div>
          {convertedValue.includes("Please enter") || convertedValue.includes("Cannot convert") ? (
            <p className="text-sm text-red-500 mt-2">{convertedValue}</p>
          ) : null}
        </motion.div>
      )}
    </div>
  );
}
