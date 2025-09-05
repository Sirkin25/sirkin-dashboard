"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRefreshManager } from "@/hooks/use-refresh-manager"
import { formatHebrewDate } from "@/lib/formatters"

interface RefreshButtonProps {
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "ghost" | "outline"
  showLastRefresh?: boolean
}

export function RefreshButton({ 
  className, 
  size = "sm", 
  variant = "outline",
  showLastRefresh = false
}: RefreshButtonProps) {
  const { 
    refreshCurrentTab, 
    isRefreshing, 
    refreshState 
  } = useRefreshManager()

  const handleRefresh = async () => {
    try {
      await refreshCurrentTab()
    } catch (error) {
      console.error('Refresh failed:', error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size={size}
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={className}
        title="רענן נתונים"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        <span className="hebrew-text ml-2">
          {isRefreshing ? "מרענן..." : "רענן"}
        </span>
      </Button>
      
      {showLastRefresh && refreshState.lastRefreshTime && (
        <span className="text-xs text-muted-foreground hebrew-text">
          עודכן: {formatHebrewDate(refreshState.lastRefreshTime)}
        </span>
      )}
    </div>
  )
}

// Simplified refresh button without text
export function RefreshIconButton({ 
  className, 
  size = "sm", 
  variant = "ghost"
}: Omit<RefreshButtonProps, 'showLastRefresh'>) {
  const { refreshCurrentTab, isRefreshing } = useRefreshManager()

  const handleRefresh = async () => {
    try {
      await refreshCurrentTab()
    } catch (error) {
      console.error('Refresh failed:', error)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={className}
      title={isRefreshing ? "מרענן נתונים..." : "רענן נתונים"}
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
    </Button>
  )
}