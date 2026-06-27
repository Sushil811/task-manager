"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Play, Pause, Square, Flame } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedCard } from "@/components/ui/animated-card";

export function FocusTimer() {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            clearInterval(interval);
            setTimeout(() => setIsActive(false), 0);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <AnimatedCard className="p-6 relative overflow-hidden bg-gradient-to-b from-orange-500/10 to-transparent border-orange-500/20 max-w-sm w-full mx-auto">
      <div className="absolute top-0 left-0 h-1 bg-orange-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Focus Session
        </h3>
        <span className="text-xs font-medium text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full">Pomodoro</span>
      </div>

      <div className="flex justify-center my-8">
        <div className="text-6xl font-black tabular-nums tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
          {minutes}:{seconds}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <AnimatedButton 
          onClick={toggleTimer} 
          className={`w-14 h-14 rounded-full flex items-center justify-center ${isActive ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30' : 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'}`}
        >
          {isActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
        </AnimatedButton>
        <AnimatedButton 
          onClick={resetTimer} 
          variant="outline"
          className="w-14 h-14 rounded-full flex items-center justify-center glass text-muted-foreground hover:text-foreground"
        >
          <Square className="w-5 h-5 fill-current" />
        </AnimatedButton>
      </div>
    </AnimatedCard>
  );
}
