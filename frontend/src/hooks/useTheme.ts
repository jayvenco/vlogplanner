import { useEffect, useState } from "react";

const THEME_KEY = "vlogbuddy.theme";
export type Theme = "light" | "dark" | "rainbow" | "cyberpunk" | "earth";

export const THEME_OPTIONS: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "Licht", icon: "☀️" },
  { value: "dark", label: "Donker", icon: "🌙" },
  { value: "rainbow", label: "Rainbow", icon: "🌈" },
  { value: "cyberpunk", label: "Cyberpunk", icon: "⚡" },
  { value: "earth", label: "Earth colors", icon: "🌍" },
];

const VALID_THEMES = THEME_OPTIONS.map((option) => option.value);

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  return stored && VALID_THEMES.includes(stored) ? stored : "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function setTheme(next: Theme) {
    setThemeState(next);
  }

  return { theme, setTheme };
}
