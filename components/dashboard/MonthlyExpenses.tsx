"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatShortHebrewDate } from "@/lib/formatters"
import { Plus, FileText, Trash2 } from "lucide-react"

interface Expense {
  id: string
  description: string
  category: string
  amount: number
  date: Date
  status: "paid" | "pending" | "overdue"
}

interface MonthlyExpensesProps {
  expenses: Expense[]
  totalBudget: number
  onAddExpense?: () => void
  onDeleteExpense?: (id: string) => void
}

export function MonthlyExpenses({ expenses, totalBudget, onAddExpense, onDeleteExpense }: MonthlyExpensesProps) {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const budgetUsed = (totalExpenses / totalBudget) * 100

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success text-success-foreground"
      case "pending":
        return "bg-accent text-accent-foreground"
      case "overdue":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "שולם"
      case "pending":
        return "ממתין"
      case "overdue":
        return "באיחור"
      default:
        return "לא ידוע"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="hebrew-text">הוצאות החודש</CardTitle>
          {onAddExpense && (
            <Button onClick={onAddExpense} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hebrew-text">הוסף הוצאה</span>
            </Button>
          )}
        </div>

        {/* Budget Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="hebrew-text">סה"כ הוצאות:</span>
            <span className="font-medium currency-hebrew">{formatCurrency(totalExpenses)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="hebrew-text">תקציב חודשי:</span>
            <span className="currency-hebrew">{formatCurrency(totalBudget)}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                budgetUsed > 90 ? "bg-destructive" : budgetUsed > 70 ? "bg-accent" : "bg-success"
              }`}
              style={{ width: `${Math.min(budgetUsed, 100)}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground hebrew-text">{budgetUsed.toFixed(1)}% מהתקציב נוצל</div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="hebrew-text">אין הוצאות רשומות החודש</p>
            </div>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium hebrew-text">{expense.description}</span>
                    <Badge variant="outline" className="text-xs">
                      {expense.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="hebrew-text">{formatShortHebrewDate(expense.date)}</span>
                    <Badge className={getStatusColor(expense.status)} variant="secondary">
                      <span className="hebrew-text">{getStatusText(expense.status)}</span>
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold currency-hebrew text-destructive">
                    -{formatCurrency(expense.amount)}
                  </span>
                  {onDeleteExpense && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteExpense(expense.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
