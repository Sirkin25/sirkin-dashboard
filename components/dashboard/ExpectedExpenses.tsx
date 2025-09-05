"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatShortHebrewDate } from "@/lib/formatters"
import { useExpectedExpenses } from "@/hooks/use-sheets-data"
import { Calendar, Clock, AlertCircle } from "lucide-react"

export function ExpectedExpenses() {
  const { data: expensesData, isLoading, error, isConnected } = useExpectedExpenses()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            הוצאות צפויות
          </CardTitle>
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

  if (error || !expensesData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="hebrew-text flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            הוצאות צפויות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive hebrew-text">שגיאה בטעינת הנתונים</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const expenses = expensesData.expenses || []
  const totalExpected = expenses.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0)

  const urgentExpenses = expenses.filter((expense: any) => {
    if (!expense.dueDate) return false
    const dueDate = new Date(expense.dueDate)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays >= 0
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-accent text-accent-foreground"
      case "low":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "דחוף"
      case "medium":
        return "בינוני"
      case "low":
        return "נמוך"
      default:
        return "לא ידוע"
    }
  }

  const formatDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "פג תוקף"
    if (diffDays === 0) return "היום"
    if (diffDays === 1) return "מחר"
    if (diffDays <= 7) return `בעוד ${diffDays} ימים`
    return `בעוד ${Math.ceil(diffDays / 7)} שבועות`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="hebrew-text flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          הוצאות צפויות
        </CardTitle>

        {/* Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="hebrew-text">סה"כ הוצאות צפויות:</span>
            <span className="font-medium currency-hebrew">{formatCurrency(totalExpected)}</span>
          </div>
          {urgentExpenses.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive hebrew-text">{urgentExpenses.length} הוצאות דחופות השבוע</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="hebrew-text">אין הוצאות צפויות</p>
            </div>
          ) : (
            expenses.map((expense: any, index: number) => {
              const isUrgent = urgentExpenses.includes(expense)

              return (
                <div
                  key={expense.id || index}
                  className={`p-3 rounded-lg border ${isUrgent ? "border-destructive/20 bg-destructive/5" : "bg-muted/50"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium hebrew-text">{expense.description || expense.category}</span>
                        <Badge variant="outline" className="text-xs">
                          {expense.category}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {expense.dueDate && (
                          <>
                            <span className="hebrew-text">{formatShortHebrewDate(new Date(expense.dueDate))}</span>
                            <span className={`hebrew-text ${isUrgent ? "text-destructive font-medium" : ""}`}>
                              {formatDaysUntilDue(expense.dueDate)}
                            </span>
                          </>
                        )}
                        <Badge className={getPriorityColor(expense.priority || "low")} variant="secondary">
                          <span className="hebrew-text">{getPriorityText(expense.priority || "low")}</span>
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold currency-hebrew">{formatCurrency(expense.amount || 0)}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
