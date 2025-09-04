"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Home, FileText, Menu, X, CreditCard, BarChart3, Moon, RefreshCw } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage?: string
}

const navigationItems = [
  {
    id: "dashboard",
    label: "סקירה כללית",
    icon: Home,
    href: "/",
  },
  {
    id: "expenses",
    label: "פירוט הוצאות",
    icon: FileText,
    href: "/expenses",
  },
  {
    id: "payments",
    label: "תשלומים",
    icon: CreditCard,
    href: "/payments",
  },
  {
    id: "reports",
    label: "דוחות",
    icon: BarChart3,
    href: "/reports",
  },
]

export function DashboardLayout({ children, currentPage = "dashboard" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

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
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 hebrew-text">לוח בקרה ועד הבית</h1>
              <p className="text-sm text-gray-600 hebrew-text">מעקב וניהול הבניין שלך</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Moon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <RefreshCw className="h-5 w-5" />
              <span className="hidden sm:inline hebrew-text mr-2">רענן</span>
            </Button>
          </div>
        </div>

        <div className="border-t bg-blue-50 px-6 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded hebrew-text">נתונים נטענו בהצלחה</span>
              <span className="text-gray-600 hebrew-text">עודכן: {new Date().toLocaleTimeString("he-IL")}</span>
            </div>
          </div>
        </div>

        <div className="border-t bg-white px-6">
          <nav className="flex space-x-8" dir="rtl">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors hebrew-text",
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="p-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
