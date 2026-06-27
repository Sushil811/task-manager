"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { setTheme, theme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 border rounded-full p-1 bg-background/50 backdrop-blur-md shadow-sm opacity-0">
        <div className="w-8 h-8"></div>
        <div className="w-8 h-8"></div>
        <div className="w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border rounded-full p-1 bg-background/50 backdrop-blur-md shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-full w-8 h-8 ${theme === "light" ? "bg-muted" : ""}`}
        onClick={() => setTheme("light")}
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Light theme</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-full w-8 h-8 ${theme === "dark" ? "bg-muted" : ""}`}
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only">Dark theme</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-full w-8 h-8 ${theme === "amoled" ? "bg-muted" : ""}`}
        onClick={() => setTheme("amoled")}
      >
        <Monitor className="h-4 w-4" />
        <span className="sr-only">AMOLED theme</span>
      </Button>
    </div>
  );
}
