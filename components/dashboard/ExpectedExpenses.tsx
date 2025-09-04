"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatShortHebrewDate } from "@/lib/hebrew-utils"
import { Calendar, Clock, AlertCircle } from "lucide-react"

interface ExpectedExpense {
  id: string
  description: string
  category: string
  amount: number
  dueDate: Date
  priority: "low" | "medium" | "high"
  recurring: boolean
}

interface ExpectedExpensesProps {
  expenses: ExpectedExpense[]
  onMarkAsPaid?: (id: string) => void
}

export function ExpectedExpenses({ expenses, onMarkAsPaid }: ExpectedExpensesProps) {
  const totalExpected = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const urgentExpenses = expenses.filter((expense) => {
    const daysUntilDue = Math.ceil((expense.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilDue <= 7
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

  const getDaysUntilDue = (dueDate: Date) => {
    const days = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (days < 0) return "באיחור"
    if (days === 0) return "היום"
    if (days === 1) return "מחר"
    return `בעוד ${days} ימים`
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
            expenses.map((expense) => {
              const daysUntilDue = Math.ceil((expense.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              const isUrgent = daysUntilDue <= 7

              return (
                <div
                  key={expense.id}
                  className={`p-3 rounded-lg border ${isUrgent ? "border-destructive/20 bg-destructive/5" : "bg-muted/50"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium hebrew-text">{expense.description}</span>
                        <Badge variant="outline" className="text-xs">
                          {expense.category}
                        </Badge>
                        {expense.recurring && (
                          <Badge variant="secondary" className="text-xs hebrew-text">
                            חוזר
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="hebrew-text">{formatShortHebrewDate(expense.dueDate)}</span>
                        <span className={`hebrew-text ${isUrgent ? "text-destructive font-medium" : ""}`}>
                          {getDaysUntilDue(expense.dueDate)}
                        </span>
                        <Badge className={getPriorityColor(expense.priority)} variant="secondary">
                          <span className="hebrew-text">{getPriorityText(expense.priority)}</span>
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold currency-hebrew">{formatCurrency(expense.amount)}</span>
                      {onMarkAsPaid && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMarkAsPaid(expense.id)}
                          className="hebrew-text"
                        >
                          סמן כשולם
                        </Button>
                      )}
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
