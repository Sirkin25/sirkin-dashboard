"use client"

import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { MonthlyExpenses } from "@/components/dashboard/MonthlyExpenses"
import { ExpectedExpenses } from "@/components/dashboard/ExpectedExpenses"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useMonthlyExpenses, useExpectedExpenses } from "@/hooks/use-sheets-data"
import { formatCurrency } from "@/lib/hebrew-utils"
import { RefreshCw, Download, Plus, TrendingDown, Calendar } from "lucide-react"

export default function ExpensesPage() {
  const monthlyExpenses = useMonthlyExpenses({ autoRefresh: true })
  const expectedExpenses = useExpectedExpenses({ autoRefresh: true })

  const handleRefresh = async () => {
    await Promise.all([monthlyExpenses.refresh(), expectedExpenses.refresh()])
  }

  const totalMonthlyExpenses = monthlyExpenses.data?.expenses.reduce((sum, exp) => sum + exp.amount, 0) || 0
  const totalExpectedExpenses = expectedExpenses.data?.expenses.reduce((sum, exp) => sum + exp.amount, 0) || 0

  return (
    <DashboardLayout currentPage="expenses">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground hebrew-text">ניהול הוצאות</h1>
            <p className="text-muted-foreground hebrew-text">מעקב אחר הוצאות חודשיות והוצאות צפויות</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleRefresh}>
              <RefreshCw className={`h-4 w-4 ${monthlyExpenses.loading ? "animate-spin" : ""}`} />
              <span className="hebrew-text">רענן</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              <span className="hebrew-text">ייצא</span>
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hebrew-text">הוסף הוצאה</span>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base hebrew-text flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                הוצאות החודש
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyExpenses.loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-destructive currency-hebrew">
                  {formatCurrency(totalMonthlyExpenses)}
                </div>
              )}
              <p className="text-sm text-muted-foreground hebrew-text">
                {monthlyExpenses.data?.expenses.length || 0} הוצאות רשומות
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base hebrew-text flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                הוצאות צפויות
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expectedExpenses.loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-accent currency-hebrew">
                  {formatCurrency(totalExpectedExpenses)}
                </div>
              )}
              <p className="text-sm text-muted-foreground hebrew-text">
                {expectedExpenses.data?.expenses.length || 0} הוצאות מתוכננות
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base hebrew-text">תקציב נותר</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyExpenses.loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-success currency-hebrew">
                  {formatCurrency((monthlyExpenses.data?.totalBudget || 0) - totalMonthlyExpenses)}
                </div>
              )}
              <p className="text-sm text-muted-foreground hebrew-text">
                מתוך תקציב {formatCurrency(monthlyExpenses.data?.totalBudget || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Expenses Components */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {monthlyExpenses.loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : monthlyExpenses.data ? (
            <MonthlyExpenses expenses={monthlyExpenses.data.expenses} totalBudget={monthlyExpenses.data.totalBudget} />
          ) : null}

          {expectedExpenses.loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : expectedExpenses.data ? (
            <ExpectedExpenses expenses={expectedExpenses.data.expenses} />
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  )
}
