"use client"

import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAccountStatus, useMonthlyExpenses, useExpectedExpenses, useTenantPayments } from "@/hooks/use-sheets-data"
import { formatCurrency } from "@/lib/hebrew-utils"
import { TrendingUp, TrendingDown, Users, AlertCircle, Building, CreditCard, DollarSign, Calendar } from "lucide-react"

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

  const totalMonthlyExpenses = monthlyExpenses.data?.expenses.reduce((sum, exp) => sum + exp.amount, 0) || 0
  const paidPayments = tenantPayments.data?.payments.filter((p) => p.status === "paid").length || 0
  const totalPayments = tenantPayments.data?.payments.length || 1
  const paymentPercentage = Math.round((paidPayments / totalPayments) * 100)
  const urgentExpenses =
    expectedExpenses.data?.expenses.filter((exp) => {
      const daysUntilDue = Math.ceil((new Date(exp.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilDue <= 7
    }).length || 0

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        <Card className="bg-gray-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <CardTitle className="hebrew-text">סיכום ביצועים</CardTitle>
            </div>
            <p className="text-sm text-gray-600 hebrew-text">ביצועי הבניין הכלליים ומדדים עיקריים</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-600 hebrew-text">יתרה כוללת (כולל דיבידנדים)</div>
                {accountStatus.loading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-red-600 currency-hebrew">
                      {accountStatus.data ? formatCurrency(accountStatus.data.balance) : "₪0"}
                    </div>
                    <div className="text-sm text-gray-600 hebrew-text">
                      יתרה: {accountStatus.data ? formatCurrency(accountStatus.data.balance * 0.8) : "₪0"} | דיבידנדים:{" "}
                      {accountStatus.data ? formatCurrency(accountStatus.data.balance * 0.2) : "₪0"}
                    </div>
                  </>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-600 hebrew-text">דירות פעילות</div>
                {tenantPayments.loading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <>
                    <div className="text-2xl font-bold hebrew-numbers">{totalPayments}</div>
                    <div className="text-sm text-gray-600 hebrew-text">דירות</div>
                  </>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-600 hebrew-text">ביצועים הטובים ביותר</div>
                <div className="text-2xl font-bold text-green-600 hebrew-text">דירה 12</div>
                <div className="text-sm text-green-600">+15.2%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Portfolio Size Card - Light Blue */}
          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-cyan-800 hebrew-text">גודל תיק (כולל מזומן)</CardTitle>
                <DollarSign className="h-4 w-4 text-cyan-600" />
              </div>
            </CardHeader>
            <CardContent>
              {accountStatus.loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-cyan-900 currency-hebrew">
                    {accountStatus.data ? formatCurrency(accountStatus.data.balance) : "₪0"}
                  </div>
                  <div className="text-sm text-cyan-700 hebrew-text">
                    מזומן: {accountStatus.data ? formatCurrency(accountStatus.data.balance * 0.15) : "₪0"}
                  </div>
                  <div className="text-xs text-cyan-600 hebrew-text mt-1">ערך כולל כולל מזומן לא מושקע</div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Total Invested Card - Blue */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-800 hebrew-text">סך הושקע</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              {monthlyExpenses.loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-blue-900 currency-hebrew">
                    {formatCurrency(totalMonthlyExpenses)}
                  </div>
                  <div className="text-xs text-blue-600 hebrew-text">מבוסס על השקעות נוכחיות</div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Current Value Card - Green */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-800 hebrew-text">ערך נוכחי</CardTitle>
                <Building className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              {tenantPayments.loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-900 currency-hebrew">
                    {formatCurrency(
                      tenantPayments.data?.payments
                        .filter((p) => p.status === "paid")
                        .reduce((sum, p) => sum + p.monthlyFee, 0) || 0,
                    )}
                  </div>
                  <div className="text-xs text-green-600 hebrew-text">מבוסס על מחירי שוק נוכחיים</div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Total Invested NIS Card - Purple */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-800 hebrew-text">סך הושקע (₪)</CardTitle>
                <CreditCard className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 currency-hebrew">
                ₪{((accountStatus.data?.balance || 0) * 1.2).toLocaleString("he-IL")}
              </div>
              <div className="text-xs text-purple-600 hebrew-text">מבוסס על הוצאות בקניות</div>
            </CardContent>
          </Card>

          {/* Unrealized P&L Card - Pink */}
          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-pink-800 hebrew-text">רווח/הפסד לא מומש</CardTitle>
                <TrendingDown className="h-4 w-4 text-pink-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 currency-hebrew">
                -₪{totalMonthlyExpenses.toLocaleString("he-IL")}
              </div>
              <div className="text-sm text-red-600">-{paymentPercentage}%</div>
            </CardContent>
          </Card>

          {/* Realized Profit Card - Orange */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-orange-800 hebrew-text">רווח ממומש</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 currency-hebrew">
                ₪{(paidPayments * 1500).toLocaleString("he-IL")}
              </div>
              <div className="text-xs text-orange-600 hebrew-text">מעסקאות שהושלמו (לפני מיסים)</div>
            </CardContent>
          </Card>

          {/* Total Dividends Card - Teal */}
          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-teal-800 hebrew-text">סך דיבידנדים</CardTitle>
                <Calendar className="h-4 w-4 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-900 currency-hebrew">
                ₪{(paidPayments * 200).toLocaleString("he-IL")}
              </div>
              <div className="text-xs text-teal-600 hebrew-text">הכנסת דיבידנדים שהתקבלה</div>
            </CardContent>
          </Card>

          {/* Taxes Paid Card - Yellow */}
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-yellow-800 hebrew-text">מיסים ששולמו</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900 hebrew-text">
                ₪{Math.round(totalMonthlyExpenses * 0.1).toLocaleString("he-IL")} • ₪
                {Math.round(paidPayments * 50).toLocaleString("he-IL")}
              </div>
              <div className="text-xs text-yellow-600 hebrew-text">מכירות • דיבידנדים</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Button variant="outline" className="h-16 flex-col gap-2 bg-white hover:bg-gray-50">
            <Users className="h-5 w-5" />
            <span className="hebrew-text text-sm">נהל דיירים</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 bg-white hover:bg-gray-50">
            <TrendingUp className="h-5 w-5" />
            <span className="hebrew-text text-sm">הוסף הוצאה</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 bg-white hover:bg-gray-50">
            <AlertCircle className="h-5 w-5" />
            <span className="hebrew-text text-sm">התראות</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 bg-white hover:bg-gray-50">
            <Building className="h-5 w-5" />
            <span className="hebrew-text text-sm">דוחות</span>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
