"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

export function ThemeColor() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    
    if (metaThemeColor) {
      const color = resolvedTheme === "dark" ? "#0d1117" : "#fafbfc"
      metaThemeColor.setAttribute("content", color)
    }
  }, [resolvedTheme])

  return null
}
