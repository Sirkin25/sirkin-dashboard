"use client"

import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NoDataAvailableProps {
  title?: string
  message?: string
  hebrewMessage?: string
  canRetry?: boolean
  onRetry?: () => void
  isRetrying?: boolean
  showConnectionStatus?: boolean
  isConnected?: boolean
  className?: string
}

export function NoDataAvailable({
  title = "אין נתונים זמינים",
  message = "No data available",
  hebrewMessage = "לא ניתן לטעון נתונים מגוגל שיטס כרגע",
  canRetry = true,
  onRetry,
  isRetrying = false,
  showConnectionStatus = true,
  isConnected = false,
  className
}: NoDataAvailableProps) {
  return (
    <Card className={`border-dashed border-2 border-gray-300 ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-2">
          <AlertCircle className="h-12 w-12 text-gray-400" />
        </div>
        <CardTitle className="text-lg text-gray-600 hebrew-text">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-500 hebrew-text">{hebrewMessage}</p>
        
        {showConnectionStatus && (
          <div className="flex items-center justify-center gap-2 text-sm">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-600 hebrew-text">מחובר לאינטרנט</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-red-600 hebrew-text">בעיית חיבור</span>
              </>
            )}
          </div>
        )}

        {canRetry && onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
            <span className="hebrew-text">
              {isRetrying ? "מנסה שוב..." : "נסה שוב"}
            </span>
          </Button>
        )}

        <div className="text-xs text-gray-400 hebrew-text">
          בדוק את החיבור לאינטרנט ואת הגדרות גוגל שיטס
        </div>
      </CardContent>
    </Card>
  )
}