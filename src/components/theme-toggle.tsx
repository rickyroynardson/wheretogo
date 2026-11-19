"use client";

import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/i18n/client";

export function ThemeToggle() {
  const { t } = useI18n();
  function toggle() {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.theme = dark ? "dark" : "light";
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.header.toggleTheme}
      className="grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:cursor-pointer"
    >
      <Moon className="size-4 dark:hidden" aria-hidden />
      <Sun className="hidden size-4 dark:block" aria-hidden />
    </button>
  );
}
