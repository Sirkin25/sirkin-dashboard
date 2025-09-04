"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatHebrewDate } from "@/lib/hebrew-utils"
import { useAccountStatus } from "@/hooks/use-sheets-data"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"

export function AccountStatus() {
  const { data: accountData, isLoading, error, isConnected } = useAccountStatus()

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg hebrew-text">מצב חשבון הבניין</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground hebrew-text mt-2">טוען נתונים...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !accountData) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg hebrew-text">מצב חשבון הבניין</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive hebrew-text">שגיאה בטעינת הנתונים</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const balance = accountData.balance || 0
  const lastUpdated = accountData.lastUpdated ? new Date(accountData.lastUpdated) : new Date()
  const monthlyChange = accountData.monthlyChange || 0

  const getStatus = () => {
    if (balance > 10000) return "healthy"
    if (balance > 5000) return "warning"
    return "critical"
  }

  const status = getStatus()

  const getStatusColor = () => {
    switch (status) {
      case "healthy":
        return "bg-success text-success-foreground"
      case "warning":
        return "bg-accent text-accent-foreground"
      case "critical":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "healthy":
        return "מצב תקין"
      case "warning":
        return "דורש תשומת לב"
      case "critical":
        return "מצב קריטי"
      default:
        return "לא ידוע"
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
              <span className="hebrew-text">{getStatusText()}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Balance */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold currency-hebrew text-primary">{formatCurrency(balance)}</div>
          <p className="text-sm text-muted-foreground hebrew-text">יתרה נוכחית בחשבון הבניין</p>
        </div>

        {/* Monthly Change */}
        <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg">
          {monthlyChange >= 0 ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          <span className={`font-medium ${monthlyChange >= 0 ? "text-success" : "text-destructive"}`}>
            {monthlyChange >= 0 ? "+" : ""}
            {monthlyChange.toFixed(1)}%
          </span>
          <span className="text-sm text-muted-foreground hebrew-text">מהחודש הקודם</span>
        </div>

        {/* Last Updated */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground hebrew-text">עדכון אחרון: {formatHebrewDate(lastUpdated)}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-success" : "bg-accent"}`} />
            <span className="text-xs text-muted-foreground hebrew-text">
              {isConnected ? "מחובר לגוגל שיטס" : "נתונים לדוגמה"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
