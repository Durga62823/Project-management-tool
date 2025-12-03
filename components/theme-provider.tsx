"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const initializeTheme = async () => {
      if (!session?.user?.id) {
        // For unauthenticated users, check localStorage
        const savedTheme = localStorage.getItem("theme") || "light";
        applyTheme(savedTheme);
        return;
      }

      try {
        // Fetch user preferences from the server
        const response = await fetch("/api/user/preferences");
        if (!response.ok) {
          // Fallback to localStorage
          const savedTheme = localStorage.getItem("theme") || "light";
          applyTheme(savedTheme);
          return;
        }

        const data = await response.json();
        const theme = data.preferences?.theme || "light";
        applyTheme(theme);
      } catch (error) {
        console.error("Failed to apply theme:", error);
        // Fallback to localStorage
        const savedTheme = localStorage.getItem("theme") || "light";
        applyTheme(savedTheme);
      }
    };

    initializeTheme();
  }, [session]);

  return <>{children}</>;
}

function applyTheme(themeValue: string) {
  const htmlElement = document.documentElement;

  if (themeValue === "dark") {
    htmlElement.classList.add("dark");
  } else if (themeValue === "light") {
    htmlElement.classList.remove("dark");
  } else if (themeValue === "auto") {
    // Check system preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (prefersDark) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
  }
}
