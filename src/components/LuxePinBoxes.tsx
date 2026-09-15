import React, { useRef, useState, useEffect } from "react";
import { ShieldCheck, Lock, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LuxePinBoxesProps {
  length?: number;
  onComplete: (pin: string) => void;
  error?: string;
  onClearError?: () => void;
}

export function LuxePinBoxes({ length = 4, onComplete, error, onClearError }: LuxePinBoxesProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first box on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, val: string) => {
    if (error && onClearError) onClearError();

    // Only allow alphanumeric / digits
    const cleaned = val.replace(/[^a-zA-Z0-9]/g, "");
    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
      return;
    }

    // Handle single character or paste
    const char = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // If there is a next box, auto-focus it
    if (index < length - 1 && char) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all filled
    const fullPin = newDigits.join("");
    if (fullPin.length === length && !newDigits.includes("")) {
      onComplete(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move back to previous box
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      }
    } else if (e.key === "ArrowLeft") {
      // In RTL: ArrowLeft moves visually to next or prev depending on layout
      if (index < length - 1) inputRefs.current[index + 1]?.focus();
    } else if (e.key === "ArrowRight") {
      if (index > 0) inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .trim()
      .replace(/[^a-zA-Z0-9]/g, "");
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < length; i++) {
      if (pasted[i]) {
        newDigits[i] = pasted[i];
      }
    }
    setDigits(newDigits);

    const fullPin = newDigits.join("");
    if (fullPin.length === length) {
      onComplete(fullPin);
      inputRefs.current[length - 1]?.focus();
    } else {
      const nextEmpty = newDigits.findIndex((d) => !d);
      if (nextEmpty !== -1) {
        inputRefs.current[nextEmpty]?.focus();
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Individual PIN Digits Container */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 my-2" dir="ltr">
        {digits.map((digit, idx) => {
          const isFilled = Boolean(digit);
          return (
            <div key={idx} className="relative group">
              <input
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono rounded-2xl border-2 transition-all duration-200 outline-none select-none shadow-xs ${
                  error
                    ? "border-rose-400 bg-rose-50/50 text-rose-700 focus:border-rose-600 focus:ring-4 focus:ring-rose-100"
                    : isFilled
                      ? "border-primary bg-primary/5 text-slate-900 dark:text-white shadow-sm ring-2 ring-primary/20"
                      : "border-slate-200 dark:border-slate-700 bg-card hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/15"
                }`}
                aria-label={`الرقم ${idx + 1}`}
                autoComplete="off"
              />
              {/* Subtle top indicator highlight */}
              {isFilled && (
                <span className="absolute -top-1 start-1/2 -translate-x-1/2 w-2 h-1 rounded-full bg-primary" />
              )}
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-600 font-semibold animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
