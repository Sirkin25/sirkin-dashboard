"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Home, FileText, Menu, X, CreditCard, BarChart3, Moon, RefreshCw } from "lucide-react"
import { DashboardErrorBoundary } from "@/components/error-boundary"
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
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-6" dir="rtl">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <h1 className="text-xl font-bold text-gray-900 hebrew-text">לוח בקרה ועד הבית</h1>
              <p className="text-sm text-gray-600 hebrew-text">מעקב וניהול הבניין שלך</p>
            </div>
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <span className="hidden sm:inline hebrew-text ml-2">רענן</span>
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Moon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="border-t bg-blue-50 px-6 py-2" dir="rtl">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded hebrew-text">נתונים נטענו בהצלחה</span>
              <span className="text-gray-600 hebrew-text">עודכן: {mounted ? new Date().toLocaleTimeString("he-IL") : "טוען..."}</span>
            </div>
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
  )
}
