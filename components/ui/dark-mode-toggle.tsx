"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme/ThemeProvider"

interface DarkModeToggleProps {
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "ghost" | "outline"
}

export function DarkModeToggle({ 
  className, 
  size = "sm", 
  variant = "ghost" 
}: DarkModeToggleProps) {
  const { theme, toggleTheme, isLoaded } = useTheme()

  if (!isLoaded) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={className}
      title={theme === 'light' ? 'עבור למצב כהה' : 'עבור למצב בהיר'}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">
        {theme === 'light' ? 'עבור למצב כהה' : 'עבור למצב בהיר'}
      </span>
    </Button>
  )
}