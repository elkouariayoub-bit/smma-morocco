"use client"

import { useEffect, useState } from "react"
import { MoonStar, SunMedium } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        aria-label="Toggle theme"
        disabled
      >
        <SunMedium className="h-5 w-5" aria-hidden="true" />
      </Button>
    )
  }

  const isDark = (theme === "system" ? resolvedTheme === "dark" : theme === "dark") || resolvedTheme === "dark"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative h-10 w-10 text-slate-500 hover:text-[#0070f3] dark:text-slate-400 dark:hover:text-[#0070f3]"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <SunMedium className={`h-5 w-5 transition-opacity ${isDark ? "opacity-0" : "opacity-100"}`} aria-hidden="true" />
      <MoonStar className={`absolute h-5 w-5 transition-opacity ${isDark ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
    </Button>
  )
}
