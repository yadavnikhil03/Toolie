"use client";

import { motion } from "framer-motion";
import React from "react";

interface NeonTypewriterProps {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
}

export function NeonTypewriter({
  text,
  delay = 0,
  duration = 0.05,
  className,
}: NeonTypewriterProps) {
  const characters = Array.from(text);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: duration,
        delayChildren: delay,
      },
    },
  };

  const charVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={charVariants}
          className="inline-block text-inherit will-change-transform"
        >
          {char === " " ? "\u00A0" : char} {/* Preserve spaces */}
        </motion.span>
      ))}
    </motion.div>
  );
}
