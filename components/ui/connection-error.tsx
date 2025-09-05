"use client"

import { AlertTriangle, RefreshCw, Settings, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ConnectionErrorProps {
  title?: string
  message?: string
  hebrewMessage?: string
  errorCode?: string
  canRetry?: boolean
  onRetry?: () => void
  isRetrying?: boolean
  showTroubleshooting?: boolean
  className?: string
}

export function ConnectionError({
  title = "שגיאת חיבור",
  message = "Connection error",
  hebrewMessage = "לא ניתן להתחבר לגוגל שיטס",
  errorCode,
  canRetry = true,
  onRetry,
  isRetrying = false,
  showTroubleshooting = true,
  className
}: ConnectionErrorProps) {
  const troubleshootingSteps = [
    "בדוק את החיבור לאינטרנט",
    "ודא שגוגל שיטס זמין",
    "בדוק הרשאות גישה לגיליון",
    "נסה לרענן את הדף"
  ]

  return (
    <Card className={`border-red-200 bg-red-50 ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-2">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <CardTitle className="text-lg text-red-700 hebrew-text">{title}</CardTitle>
        {errorCode && (
          <div className="text-sm text-red-600 font-mono">
            קוד שגיאה: {errorCode}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-red-600 text-center hebrew-text">{hebrewMessage}</p>
        
        {showTroubleshooting && (
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <h4 className="font-medium text-red-800 mb-2 hebrew-text">צעדים לפתרון בעיה:</h4>
            <ul className="space-y-1 text-sm text-red-700">
              {troubleshootingSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 hebrew-text">
                  <span className="text-red-500 font-bold">{index + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {canRetry && onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              disabled={isRetrying}
              className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
              <span className="hebrew-text">
                {isRetrying ? "מנסה שוב..." : "נסה שוב"}
              </span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-red-600 hover:bg-red-100"
            onClick={() => window.open('https://sheets.google.com', '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hebrew-text">פתח גוגל שיטס</span>
          </Button>
        </div>

        <div className="text-xs text-red-500 text-center hebrew-text">
          אם הבעיה נמשכת, פנה למנהל המערכת
        </div>
      </CardContent>
    </Card>
  )
}