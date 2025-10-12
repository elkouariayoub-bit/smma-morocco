"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

type ThemeName = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: ThemeName | undefined
  resolvedTheme: "light" | "dark"
  setTheme: (theme: ThemeName) => void
}

export type ThemeProviderProps = {
  children: ReactNode
  attribute?: string
  defaultTheme?: ThemeName
  enableSystem?: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light"
  }
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyClass(attribute: string, nextTheme: "light" | "dark") {
  if (typeof document === "undefined") return
  const root = document.documentElement
  if (attribute === "class") {
    root.classList.remove("light", "dark")
    root.classList.add(nextTheme)
    return
  }

  root.setAttribute(attribute, nextTheme)
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeName | undefined>(undefined)
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
    defaultTheme === "dark" ? "dark" : defaultTheme === "light" ? "light" : getSystemTheme()
  )

  const setTheme = useCallback(
    (value: ThemeName) => {
      const next = value === "system" && enableSystem ? getSystemTheme() : (value === "dark" ? "dark" : "light")
      setThemeState(value)
      setResolvedTheme(next)
      applyClass(attribute, next)
      if (typeof window !== "undefined") {
        window.localStorage.setItem("theme", value)
      }
    },
    [attribute, enableSystem]
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("theme") as ThemeName | null
    if (stored) {
      setTheme(stored)
      return
    }
    if (defaultTheme === "system" && enableSystem) {
      setTheme("system")
      return
    }
    setTheme(defaultTheme)
  }, [defaultTheme, enableSystem, setTheme])

  useEffect(() => {
    if (!enableSystem || typeof window === "undefined") return
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const listener = () => {
      if (theme === "system" || theme === undefined) {
        const next = media.matches ? "dark" : "light"
        setResolvedTheme(next)
        applyClass(attribute, next)
      }
    }
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [attribute, enableSystem, theme])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [resolvedTheme, setTheme, theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
