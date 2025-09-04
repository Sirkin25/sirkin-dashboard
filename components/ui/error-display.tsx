"use client"

import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ErrorState } from "@/lib/types/api"

interface ErrorDisplayProps {
  error: ErrorState
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({ error, onRetry, className }: ErrorDisplayProps) {
  const getErrorIcon = () => {
    switch (error.type) {
      case 'network_error':
        return <WifiOff className="h-8 w-8 text-destructive" />
      case 'sheets_connection_error':
        return <Wifi className="h-8 w-8 text-destructive" />
      default:
        return <AlertTriangle className="h-8 w-8 text-destructive" />
    }
  }

  const getErrorBadgeVariant = () => {
    switch (error.type) {
      case 'network_error':
        return 'destructive'
      case 'authentication_error':
        return 'destructive'
      case 'sheets_connection_error':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          {getErrorIcon()}
          <span className="hebrew-text">שגיאה בטעינת הנתונים</span>
          <Badge variant={getErrorBadgeVariant()}>
            {error.type.replace('_', ' ')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-destructive hebrew-text font-medium">
            {error.hebrewMessage}
          </p>
          {error.message && (
            <p className="text-sm text-muted-foreground">
              {error.message}
            </p>
          )}
        </div>

        {error.canRetry && (onRetry || error.retryAction) && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={onRetry || error.retryAction}
              className="hebrew-text"
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              נסה שוב
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center hebrew-text">
          אם הבעיה נמשכת, פנה למנהל המערכת
        </div>
      </CardContent>
    </Card>
  )
}

interface RetryButtonProps {
  onRetry: () => void
  isRetrying?: boolean
  disabled?: boolean
  className?: string
}

export function RetryButton({ onRetry, isRetrying = false, disabled = false, className }: RetryButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onRetry}
      disabled={disabled || isRetrying}
      className={className}
    >
      <RefreshCw className={`h-4 w-4 ml-2 ${isRetrying ? 'animate-spin' : ''}`} />
      <span className="hebrew-text">
        {isRetrying ? 'מנסה שוב...' : 'נסה שוב'}
      </span>
    </Button>
  )
}

interface ConnectionStatusProps {
  isConnected: boolean
  source: string
  className?: string
}

export function ConnectionStatus({ isConnected, source, className }: ConnectionStatusProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500"}`} />
      <span className="text-xs text-muted-foreground hebrew-text">
        {isConnected ? "מחובר לגוגל שיטס" : source}
      </span>
    </div>
  )
}