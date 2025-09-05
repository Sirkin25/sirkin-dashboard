"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"
import { formatCurrency, formatHebrewDate } from "@/lib/formatters"
import { ACCOUNT_STATUS_TEXTS } from "@/lib/constants/hebrew"
import { ConnectionError } from "@/components/ui/connection-error"
import { NoDataAvailable } from "@/components/ui/no-data-available"
import { LoadingSpinner, RefreshIndicator } from "@/components/ui/loading-states"
import type { AccountStatusData, ApiResponse, ErrorState } from "@/lib/types/api"

export function AccountStatus() {
  const [response, setResponse] = useState<ApiResponse<AccountStatusData> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ErrorState | null>(null)
  const [mounted, setMounted] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sheets/account-status')
      const result: ApiResponse<AccountStatusData> = await res.json()
      
      if (!res.ok) {
        const apiError = result.error
        if (apiError) {
          setError({
            type: 'sheets_connection_error',
            message: apiError.message,
            hebrewMessage: apiError.hebrewMessage,
            canRetry: true
          })
        }
      } else {
        setResponse(result)
      }
    } catch (err) {
      console.error("Account status fetch error:", err)
      setError({
        type: 'network_error',
        message: err instanceof Error ? err.message : 'Unknown error',
        hebrewMessage: 'שגיאת רשת - בדוק את החיבור לאינטרנט',
        canRetry: true
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    fetchData()
  }

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  if (loading) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg hebrew-text">מצב חשבון הבניין</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <ConnectionError
        hebrewMessage={error.hebrewMessage}
        onRetry={handleRetry}
        canRetry={error.canRetry}
      />
    )
  }

  if (!response || !response.data) {
    return (
      <NoDataAvailable
        title="אין נתוני חשבון"
        hebrewMessage="לא ניתן לטעון נתוני חשבון הבניין מגוגל שיטס"
        onRetry={handleRetry}
        isConnected={false}
      />
    )
  }

  const { data: accountData, meta } = response
  const balance = accountData.balance || 0
  const lastUpdated = new Date(accountData.lastUpdated)
  const monthlyChange = accountData.monthlyChange || 0
  const status = accountData.status

  const getStatusColor = () => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5" />
      case "warning":
        return <AlertTriangle className="h-5 w-5" />
      case "critical":
        return <AlertTriangle className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg hebrew-text">מצב חשבון הבניין</CardTitle>
          <Badge className={getStatusColor()}>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span className="hebrew-text">{ACCOUNT_STATUS_TEXTS[status]}</span>
            </div>
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${meta.isConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-xs text-muted-foreground">
            {meta.isConnected ? "מחובר" : "לא מחובר"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Balance */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold currency-hebrew text-primary">
            {formatCurrency(balance)}
          </div>
          <p className="text-sm text-muted-foreground hebrew-text">יתרה נוכחית בחשבון הבניין</p>
        </div>

        {/* Monthly Change */}
        <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg">
          {monthlyChange >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span className={`font-medium ${monthlyChange >= 0 ? "text-green-600" : "text-red-600"}`}>
            {monthlyChange >= 0 ? "+" : ""}
            {monthlyChange.toFixed(1)}%
          </span>
          <span className="text-sm text-muted-foreground hebrew-text">מהחודש הקודם</span>
        </div>

        {/* Last Updated */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground hebrew-text">
            עדכון אחרון: {mounted ? formatHebrewDate(lastUpdated) : "טוען..."}
          </p>
          <RefreshIndicator
            isRefreshing={false}
            onRefresh={handleRetry}
            lastUpdated={mounted ? new Date(meta.lastFetched) : new Date()}
            className="mt-2 justify-center"
          />
        </div>
      </CardContent>
    </Card>
  )
}
