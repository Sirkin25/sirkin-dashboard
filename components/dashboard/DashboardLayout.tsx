"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Home, FileText, Menu, X, CreditCard, BarChart3 } from "lucide-react"
import { DashboardErrorBoundary } from "@/components/error-boundary-enhanced"
import { ThemeProvider } from "@/lib/theme/ThemeProvider"
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle"
import { RefreshButton } from "@/components/ui/refresh-button"
import { AutoRefreshIndicator } from "@/components/ui/auto-refresh-indicator"
import { setupGlobalErrorHandlers } from "@/lib/error-reporting"

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage?: string
}

// No separate navigation items - using tabs in main page instead

export function DashboardLayout({ children, currentPage = "dashboard" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Setup global error handlers on mount
  useEffect(() => {
    setupGlobalErrorHandlers()
    setMounted(true)
  }, [])

  const handleNavigation = (href: string) => {
    router.push(href)
    setSidebarOpen(false)
  }

  const getActivePageFromPath = () => {
    if (pathname === "/") return "dashboard"
    if (pathname.startsWith("/expenses")) return "expenses"
    if (pathname.startsWith("/payments")) return "payments"
    if (pathname.startsWith("/reports")) return "reports"
    return currentPage
  }

  const activePage = getActivePageFromPath()

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background transition-colors">
        <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
          <div className="flex h-16 items-center justify-between px-6" dir="rtl">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <h1 className="text-xl font-bold hebrew-text">לוח בקרה ועד הבית</h1>
                <p className="text-sm text-muted-foreground hebrew-text">מעקב וניהול הבניין שלך</p>
              </div>
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <RefreshButton 
                variant="ghost" 
                size="sm"
                showLastRefresh={false}
                className="text-muted-foreground hover:text-foreground"
              />
              <DarkModeToggle 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              />
            </div>
          </div>

          <div className="border-t bg-muted/50 px-6 py-2" dir="rtl">
            <div className="flex items-center justify-between text-sm">
              <AutoRefreshIndicator 
                showControls={false}
                className="flex items-center gap-4"
              />
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="mx-auto max-w-7xl">
            <DashboardErrorBoundary>
              {children}
            </DashboardErrorBoundary>
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
