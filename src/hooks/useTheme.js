import { useEffect, useState } from "react";

const STORAGE_KEY = "theme"; // "light" | "dark"

function getSystemPref() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "dark" || saved === "light" ? saved : getSystemPref();
}

export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  // aplicar al <html data-theme="...">
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // si cambia el tema del sistema y el usuario NO guardó manualmente, podés escuchar (opcional)
  // Descomenta si querés que siga al SO cuando no hay preferencia guardada:
  /*
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setTheme(mq.matches ? "dark" : "light");
    };
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  */

  const toggle = () => setTheme(t => (t === "light" ? "dark" : "light"));

  return { theme, setTheme, toggle, isDark: theme === "dark" };
}
