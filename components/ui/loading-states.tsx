"use client"

import { useState, useEffect } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { STATUS_MESSAGES } from "@/lib/constants/hebrew"
import type { LoadingState } from "@/lib/types/api"

interface LoadingSpinnerProps {
  message?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ message, size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      <span className="text-sm text-muted-foreground hebrew-text">
        {message || STATUS_MESSAGES.loading}
      </span>
    </div>
  )
}

interface CardLoadingProps {
  title?: string
  className?: string
}

export function CardLoading({ title, className }: CardLoadingProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        <div className="text-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </CardContent>
    </Card>
  )
}

interface SkeletonLoaderProps {
  rows?: number
  columns?: number
  className?: string
}

export function SkeletonLoader({ rows = 3, columns = 4, className }: SkeletonLoaderProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

interface TableSkeletonProps {
  rows?: number
  columns?: number
  hasHeader?: boolean
  className?: string
}

export function TableSkeleton({ rows = 5, columns = 4, hasHeader = true, className }: TableSkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {hasHeader && (
        <div className="flex gap-4 pb-2 border-b">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-5 flex-1" />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

interface RefreshIndicatorProps {
  isRefreshing: boolean
  onRefresh?: () => void
  lastUpdated?: Date
  className?: string
}

export function RefreshIndicator({ isRefreshing, onRefresh, lastUpdated, className }: RefreshIndicatorProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      {isRefreshing ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="hebrew-text">{STATUS_MESSAGES.refreshing}</span>
        </>
      ) : (
        <>
          {lastUpdated && mounted && (
            <span className="hebrew-text">
              עודכן: {lastUpdated.toLocaleTimeString("he-IL")}
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hebrew-text">רענן</span>
            </button>
          )}
        </>
      )}
    </div>
  )
}

interface ProgressIndicatorProps {
  progress: number
  message?: string
  className?: string
}

export function ProgressIndicator({ progress, message, className }: ProgressIndicatorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {message && (
        <p className="text-sm text-muted-foreground text-center hebrew-text">
          {message}
        </p>
      )}
    </div>
  )
}

interface LoadingStateManagerProps {
  loadingState: LoadingState
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

export function LoadingStateManager({ loadingState, children, fallback, className }: LoadingStateManagerProps) {
  if (loadingState.isLoading && !loadingState.isRefreshing) {
    return (
      <div className={className}>
        {fallback || <LoadingSpinner message={loadingState.message} />}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {loadingState.isRefreshing && (
        <div className="absolute top-2 right-2 z-10">
          <RefreshIndicator isRefreshing={true} />
        </div>
      )}
      {loadingState.progress !== undefined && (
        <div className="absolute top-0 left-0 right-0 z-10">
          <ProgressIndicator 
            progress={loadingState.progress} 
            message={loadingState.message}
          />
        </div>
      )}
      {children}
    </div>
  )
}