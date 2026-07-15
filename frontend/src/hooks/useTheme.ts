import { useEffect, useState } from "react";

const THEME_KEY = "vlogplanner.theme";
export type Theme = "light" | "dark" | "rainbow" | "cyberpunk" | "earth" | "kpop" | "anime" | "youtube";

export const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Licht" },
  { value: "dark", label: "Donker" },
  { value: "rainbow", label: "Rainbow" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "earth", label: "Earth colors" },
  { value: "kpop", label: "K-pop" },
  { value: "anime", label: "Anime" },
  { value: "youtube", label: "YouTube" },
];

const VALID_THEMES = THEME_OPTIONS.map((option) => option.value);

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  return stored && VALID_THEMES.includes(stored) ? stored : "light";
}

export function applyStoredTheme() {
  document.documentElement.setAttribute("data-theme", getInitialTheme());
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
