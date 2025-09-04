"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TenantPayments } from "@/components/dashboard/TenantPayments"
import { ApartmentFees } from "@/components/dashboard/ApartmentFees"
import { useAccountStatus, useMonthlyExpenses, useExpectedExpenses, useTenantPayments } from "@/hooks/use-sheets-data"
import { formatCurrency, formatHebrewDate } from "@/lib/hebrew-utils"
import { TrendingUp, Users, Building, DollarSign, Calendar, RefreshCw, BarChart3, Home } from "lucide-react"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("overview")

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

  const totalMonthlyExpenses = monthlyExpenses.data?.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0
  const paidPayments = tenantPayments.data?.payments?.filter((p) => p.status === "paid").length || 0
  const overduePayments = tenantPayments.data?.payments?.filter((p) => p.status === "overdue").length || 0
  const totalPayments = tenantPayments.data?.payments?.length || 1
  const paymentPercentage = Math.round((paidPayments / totalPayments) * 100)
  const totalMonthlyIncome = tenantPayments.data?.payments?.reduce((sum, p) => sum + p.monthlyFee, 0) || 0
  const urgentExpenses =
    expectedExpenses.data?.expenses?.filter((exp) => {
      const daysUntilDue = Math.ceil((new Date(exp.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilDue <= 30
    }).length || 0
  const totalExpectedExpenses = expectedExpenses.data?.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0

  const getConnectionStatus = () => {
    const connections = [accountStatus, monthlyExpenses, expectedExpenses, tenantPayments]
    const connectedCount = connections.filter((conn) => conn.isConnected).length
    const totalCount = connections.length
    return { connectedCount, totalCount, isFullyConnected: connectedCount === totalCount }
  }

  const connectionStatus = getConnectionStatus()

  const tabs = [
    { id: "overview", label: "סקירה כללית", icon: BarChart3 },
    { id: "payments", label: "תשלומי דיירים", icon: Users },
    { id: "fees", label: "תעריפי דירות", icon: Home },
  ]

  const OverviewContent = () => (
    <div className="space-y-6">
      <Card className="bg-gray-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            <CardTitle className="hebrew-text">סיכום ביצועים</CardTitle>
          </div>
          <p className="text-sm text-gray-600 hebrew-text">ביצועי הבניין הכלליים ומדדים עיקריים</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 hebrew-text">יתרת הבניין</div>
              {accountStatus.loading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <>
                  <div
                    className={`text-2xl font-bold currency-hebrew ${
                      (accountStatus.data?.balance || 0) >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {accountStatus.data?.balance !== undefined ? formatCurrency(accountStatus.data.balance) : "₪0"}
                  </div>
                  <div className="text-sm text-gray-600 hebrew-text">
                    הכנסות: {formatCurrency(totalMonthlyIncome)} | הוצאות: {formatCurrency(totalMonthlyExpenses)}
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
              <div className="text-sm text-gray-600 hebrew-text">אחוז תשלומים</div>
              <div className={`text-2xl font-bold ${paymentPercentage >= 80 ? "text-green-600" : "text-red-600"}`}>
                {paymentPercentage}%
              </div>
              <div className="text-sm text-gray-600 hebrew-text">
                {paidPayments} מתוך {totalPayments} שילמו
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Account Balance Card - Cyan */}
        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-cyan-800 hebrew-text">יתרת הבניין</CardTitle>
              <DollarSign className="h-4 w-4 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            {accountStatus.loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div
                  className={`text-2xl font-bold currency-hebrew ${
                    (accountStatus.data?.balance || 0) >= 0 ? "text-cyan-900" : "text-red-600"
                  }`}
                >
                  {accountStatus.data?.balance !== undefined ? formatCurrency(accountStatus.data.balance) : "₪0"}
                </div>
                <div className="text-xs text-cyan-600 hebrew-text">יתרה נוכחית בקופת הבניין</div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Monthly Income Card - Blue */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-800 hebrew-text">הכנסות חודשיות</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {tenantPayments.loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-900 currency-hebrew">
                  {formatCurrency(totalMonthlyIncome)}
                </div>
                <div className="text-xs text-blue-600 hebrew-text">סך תשלומי ועד הבית החודשיים</div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Monthly Expenses Card - Green */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-800 hebrew-text">הוצאות חודשיות</CardTitle>
              <Building className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            {monthlyExpenses.loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-900 currency-hebrew">
                  {formatCurrency(totalMonthlyExpenses)}
                </div>
                <div className="text-xs text-green-600 hebrew-text">סך ההוצאות החודשיות</div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Expected Expenses Card - Purple */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-800 hebrew-text">הוצאות צפויות</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 currency-hebrew">
              {formatCurrency(totalExpectedExpenses)}
            </div>
            <div className="text-xs text-purple-600 hebrew-text">הוצאות מתוכננות לחודשים הקרובים</div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly + Expected Expenses Combined */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="hebrew-text flex items-center gap-2">
              <Building className="h-5 w-5" />
              הוצאות חודשיות
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyExpenses.loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-3">
                {monthlyExpenses.data?.expenses?.slice(0, 5).map((expense, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="hebrew-text">{expense.category}</span>
                    <span className="font-semibold currency-hebrew">{formatCurrency(expense.amount)}</span>
                  </div>
                )) || <div className="text-gray-500 hebrew-text">אין נתונים זמינים</div>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="hebrew-text flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              הוצאות צפויות
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expectedExpenses.loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-3">
                {expectedExpenses.data?.expenses?.slice(0, 5).map((expense, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="hebrew-text">{expense.category}</span>
                      <div className="text-xs text-gray-500 hebrew-text">{expense.expectedMonth}</div>
                    </div>
                    <span className="font-semibold currency-hebrew">{formatCurrency(expense.amount)}</span>
                  </div>
                )) || <div className="text-gray-500 hebrew-text">אין נתונים זמינים</div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold hebrew-text">לוח בקרה לניהול הבניין</h1>
            <p className="text-gray-600 hebrew-text">מעקב אחר הוצאות ותשלומי דיירים</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isLoading}
              className="flex items-center gap-2 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hebrew-text">רענן</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-blue-50 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded hebrew-text">
              {totalPayments} דירות נטענו
            </span>
            <span className="text-sm text-gray-600 hebrew-text">
              עודכן:{" "}
              {accountStatus.data?.lastFetched ? formatHebrewDate(new Date(accountStatus.data.lastFetched)) : "לא זמין"}
            </span>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${connectionStatus.isFullyConnected ? "bg-green-500" : "bg-yellow-500"}`}
              />
              <span className="text-xs text-gray-600 hebrew-text">
                {connectionStatus.isFullyConnected
                  ? "מחובר לגוגל שיטס"
                  : `${connectionStatus.connectedCount}/${connectionStatus.totalCount} מחובר`}
              </span>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200" dir="rtl">
          <nav className="flex space-x-8 space-x-reverse">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hebrew-text">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === "overview" && <OverviewContent />}
          {activeTab === "payments" && <TenantPayments />}
          {activeTab === "fees" && <ApartmentFees />}
        </div>
      </div>
    </DashboardLayout>
  )
}
