"use client"

import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { AccountStatus } from "@/components/dashboard/AccountStatus"
import { MonthlyExpenses } from "@/components/dashboard/MonthlyExpenses"
import { ExpectedExpenses } from "@/components/dashboard/ExpectedExpenses"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAccountStatus, useMonthlyExpenses, useExpectedExpenses, useTenantPayments } from "@/hooks/use-sheets-data"
import { formatCurrency, formatHebrewDate } from "@/lib/hebrew-utils"
import { RefreshCw, TrendingUp, AlertCircle, FileText, Users, BarChart3, Settings } from "lucide-react"

export default function HomePage() {
  const accountStatus = useAccountStatus({ autoRefresh: true, refreshInterval: 300000 })
  const monthlyExpenses = useMonthlyExpenses({ autoRefresh: true })
  const expectedExpenses = useExpectedExpenses()
  const tenantPayments = useTenantPayments()

  const handleRefreshAll = async () => {
    await Promise.all([
      accountStatus.refresh(),
      monthlyExpenses.refresh(),
      expectedExpenses.refresh(),
      tenantPayments.refresh(),
    ])
  }

  const isLoading =
    accountStatus.loading || monthlyExpenses.loading || expectedExpenses.loading || tenantPayments.loading

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground hebrew-text">לוח בקרה ראשי</h1>
            <p className="text-muted-foreground hebrew-text">
              {formatHebrewDate(new Date())} • סקירה כללית של מצב הבניין
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm">
              <div className={`w-2 h-2 rounded-full ${accountStatus.isConnected ? "bg-success" : "bg-accent"}`} />
              <span className="hebrew-text">{accountStatus.source || "טוען..."}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={handleRefreshAll}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hebrew-text">רענן נתונים</span>
            </Button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Account Balance */}
          {accountStatus.loading ? (
            <Card className="gradient-primary text-primary-foreground">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-24 bg-primary-foreground/20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 bg-primary-foreground/20 mb-2" />
                <Skeleton className="h-4 w-20 bg-primary-foreground/20" />
              </CardContent>
            </Card>
          ) : (
            <Card className="gradient-primary text-primary-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-base hebrew-text flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  יתרת הבניין
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold currency-hebrew">
                  {accountStatus.data ? formatCurrency(accountStatus.data.balance) : "₪0"}
                </div>
                <p className="text-sm opacity-90 hebrew-text">
                  {accountStatus.data?.monthlyChange
                    ? `${accountStatus.data.monthlyChange > 0 ? "+" : ""}${accountStatus.data.monthlyChange.toFixed(1)}% מהחודש הקודם`
                    : "אין נתוני שינוי"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Payments This Month */}
          {tenantPayments.loading ? (
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base hebrew-text">תשלומים החודש</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success hebrew-numbers">
                  {tenantPayments.data
                    ? `${tenantPayments.data.payments.filter((p) => p.status === "paid").length}/${tenantPayments.data.payments.length}`
                    : "0/0"}
                </div>
                <p className="text-sm text-muted-foreground hebrew-text">
                  {tenantPayments.data
                    ? `${Math.round((tenantPayments.data.payments.filter((p) => p.status === "paid").length / tenantPayments.data.payments.length) * 100)}% מהדירות שילמו`
                    : "אין נתונים"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Monthly Expenses */}
          {monthlyExpenses.loading ? (
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base hebrew-text">הוצאות החודש</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive currency-hebrew">
                  {monthlyExpenses.data
                    ? formatCurrency(monthlyExpenses.data.expenses.reduce((sum, exp) => sum + exp.amount, 0))
                    : "₪0"}
                </div>
                <p className="text-sm text-muted-foreground hebrew-text">
                  {monthlyExpenses.data
                    ? `מתוך תקציב ${formatCurrency(monthlyExpenses.data.totalBudget)}`
                    : "אין נתוני תקציב"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Alerts */}
          {expectedExpenses.loading ? (
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-8 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base hebrew-text flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-accent" />
                  התראות
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent hebrew-numbers">
                  {expectedExpenses.data
                    ? expectedExpenses.data.expenses.filter((exp) => {
                        const daysUntilDue = Math.ceil(
                          (new Date(exp.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                        )
                        return daysUntilDue <= 7
                      }).length
                    : 0}
                </div>
                <p className="text-sm text-muted-foreground hebrew-text">דורשות טיפול</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Dashboard Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Status */}
          {accountStatus.loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : accountStatus.data ? (
            <AccountStatus
              balance={accountStatus.data.balance}
              lastUpdated={new Date(accountStatus.data.lastUpdated)}
              monthlyChange={accountStatus.data.monthlyChange}
              status={accountStatus.data.status}
              isConnected={accountStatus.isConnected}
            />
          ) : null}

          {/* Monthly Expenses */}
          {monthlyExpenses.loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : monthlyExpenses.data ? (
            <MonthlyExpenses expenses={monthlyExpenses.data.expenses} totalBudget={monthlyExpenses.data.totalBudget} />
          ) : null}
        </div>

        {/* Expected Expenses and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expected Expenses */}
          {expectedExpenses.loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : expectedExpenses.data ? (
            <ExpectedExpenses expenses={expectedExpenses.data.expenses} />
          ) : null}

          {/* Recent Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="hebrew-text">פעילות אחרונה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tenantPayments.data?.payments.slice(0, 3).map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium hebrew-text">תשלום מדירה {payment.apartmentNumber}</div>
                    <div className="text-sm text-muted-foreground hebrew-text">{payment.tenantName}</div>
                  </div>
                  <div
                    className={`font-semibold currency-hebrew ${payment.status === "paid" ? "text-success" : "text-muted-foreground"}`}
                  >
                    {payment.status === "paid" ? formatCurrency(payment.monthlyFee) : "ממתין"}
                  </div>
                </div>
              ))}

              {monthlyExpenses.data?.expenses.slice(0, 2).map((expense, index) => (
                <div key={`expense-${index}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium hebrew-text">{expense.description}</div>
                    <div className="text-sm text-muted-foreground hebrew-text">{expense.category}</div>
                  </div>
                  <div className="text-destructive font-semibold currency-hebrew">
                    -{formatCurrency(expense.amount)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="hebrew-text">פעולות מהירות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <FileText className="h-6 w-6" />
                <span className="hebrew-text text-sm">הוסף הוצאה</span>
              </Button>

              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Users className="h-6 w-6" />
                <span className="hebrew-text text-sm">נהל דיירים</span>
              </Button>

              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <BarChart3 className="h-6 w-6" />
                <span className="hebrew-text text-sm">צור דוח</span>
              </Button>

              <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                <Settings className="h-6 w-6" />
                <span className="hebrew-text text-sm">הגדרות</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Status Footer */}
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-1">
                  <div className={`w-2 h-2 rounded-full ${accountStatus.isConnected ? "bg-success" : "bg-accent"}`} />
                  <span className="hebrew-text">{accountStatus.source}</span>
                </Badge>
                {accountStatus.lastFetched && (
                  <span className="text-muted-foreground hebrew-text">
                    עדכון אחרון: {formatHebrewDate(accountStatus.lastFetched)}
                  </span>
                )}
              </div>

              {accountStatus.error && (
                <Badge variant="destructive" className="hebrew-text">
                  שגיאה בטעינת נתונים
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
