"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Home, FileText, Users, Settings, Menu, X, Building, CreditCard, BarChart3, Bell } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage?: string
}

const navigationItems = [
  {
    id: "dashboard",
    label: "לוח בקרה",
    icon: Home,
    href: "/",
  },
  {
    id: "expenses",
    label: "הוצאות",
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
    id: "tenants",
    label: "דיירים",
    icon: Users,
    href: "/tenants",
  },
  {
    id: "reports",
    label: "דוחות",
    icon: BarChart3,
    href: "/reports",
  },
  {
    id: "settings",
    label: "הגדרות",
    icon: Settings,
    href: "/settings",
  },
]

export function DashboardLayout({ children, currentPage = "dashboard" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-sm">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6" />
              <h1 className="text-lg font-semibold hebrew-text">ועד הבית</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="hidden md:block text-sm hebrew-text">שלום, מנהל הבניין</div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 right-0 z-40 w-64 transform bg-sidebar border-l transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "translate-x-full",
            "top-16 md:top-0",
          )}
        >
          <div className="sidebar-gradient h-full p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 hebrew-text",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-accent",
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                )
              })}
            </nav>

            {/* Quick Stats in Sidebar */}
            <div className="mt-8 space-y-3">
              <h3 className="text-sm font-medium text-sidebar-foreground hebrew-text">סטטיסטיקות מהירות</h3>

              <Card className="p-3 bg-card/50">
                <div className="text-xs text-muted-foreground hebrew-text">יתרת הבניין</div>
                <div className="text-lg font-semibold text-success currency-hebrew">₪45,000</div>
              </Card>

              <Card className="p-3 bg-card/50">
                <div className="text-xs text-muted-foreground hebrew-text">תשלומים החודש</div>
                <div className="text-lg font-semibold hebrew-numbers">18/24</div>
              </Card>

              <Card className="p-3 bg-card/50">
                <div className="text-xs text-muted-foreground hebrew-text">הוצאות החודש</div>
                <div className="text-lg font-semibold text-destructive currency-hebrew">₪8,500</div>
              </Card>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
