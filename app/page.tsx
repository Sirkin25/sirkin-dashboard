"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TenantPayments } from "@/components/dashboard/TenantPayments"
import { ApartmentFees } from "@/components/dashboard/ApartmentFees"
import { useAccountStatus, useMonthlyExpenses, useExpectedExpenses, useTenantPayments, useApartmentFees } from "@/hooks/use-sheets-data"
import { useTabPreference } from "@/hooks/use-preferences"
import { useTabRefresh } from "@/hooks/use-refresh-manager"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"
import { NoDataAvailable } from "@/components/ui/no-data-available"
import { ConnectionError } from "@/components/ui/connection-error"
import { CardLoading, LoadingSpinner } from "@/components/ui/loading-states"
import { formatCurrency, formatHebrewDate } from "@/lib/formatters"
import { TrendingUp, Users, Building, DollarSign, Calendar, BarChart3, Home } from "lucide-react"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  
  // Use preference management for active tab
  const { lastActiveTab, setLastActiveTab } = useTabPreference()
  const [activeTab, setActiveTab] = useState(lastActiveTab)

  // Data hooks
  const accountStatus = useAccountStatus()
  const monthlyExpenses = useMonthlyExpenses()
  const expectedExpenses = useExpectedExpenses()
  const tenantPayments = useTenantPayments()
  const apartmentFees = useApartmentFees()

  // Auto-refresh functionality
  useAutoRefresh({
    interval: 30000, // 30 seconds
    pauseWhenHidden: true,
    pauseWhenOffline: true,
    pauseWhenIdle: true
  })

  // Register tab refresh functions
  useTabRefresh('overview', [
    accountStatus.refresh,
    monthlyExpenses.refresh,
    expectedExpenses.refresh
  ], activeTab === 'overview')

  useTabRefresh('payments', [
    tenantPayments.refresh
  ], activeTab === 'payments')

  useTabRefresh('fees', [
    apartmentFees.refresh
  ], activeTab === 'fees')

  // Prevent hydration mismatch by only showing dynamic content after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update active tab and save preference
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setLastActiveTab(tabId)
  }

  const isLoading =
    accountStatus.loading || monthlyExpenses.loading || expectedExpenses.loading || tenantPayments.loading || apartmentFees.loading

  // Calculate data with null checks for no-data scenarios
  const totalMonthlyExpenses = monthlyExpenses.data?.reduce((sum, exp) => sum + exp.amount, 0) || 0
  const paymentStats = tenantPayments.data?.statistics
  const totalPayments = tenantPayments.data?.data?.length || 0
  const paymentPercentage = Math.round(paymentStats?.paymentRate || 0)
  const paidPayments = paymentStats?.totalPayments || 0
  const overduePayments = (paymentStats?.totalPossible || 0) - (paymentStats?.totalPayments || 0)
  
  // Use apartment fees data for real income calculation
  const totalMonthlyIncome = apartmentFees.data?.totalRevenue || 0
  const urgentExpenses = mounted ? 
    expectedExpenses.data?.filter((exp) => {
      const daysUntilDue = Math.ceil((new Date(exp.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilDue <= 30
    }).length || 0 : 0
  const totalExpectedExpenses = expectedExpenses.data?.reduce((sum, exp) => sum + exp.amount, 0) || 0

  const getConnectionStatus = () => {
    const connections = [accountStatus, monthlyExpenses, expectedExpenses, tenantPayments, apartmentFees]
    const connectedCount = connections.filter((conn) => conn.isConnected).length
    const totalCount = connections.length
    return { connectedCount, totalCount, isFullyConnected: connectedCount === totalCount }
  }

  const connectionStatus = getConnectionStatus()

  // Helper function to render data or error states
  const renderDataOrError = (hookResult: any, fallbackContent: React.ReactNode) => {
    if (hookResult.error) {
      return (
        <ConnectionError
          hebrewMessage={hookResult.error.hebrewMessage || "שגיאה בטעינת נתונים"}
          onRetry={hookResult.refresh}
          canRetry={hookResult.error.canRetry}
        />
      )
    }
    
    if (hookResult.loading) {
      return (
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner size="md" message="טוען נתונים..." />
        </div>
      )
    }
    
    if (!hookResult.data) {
      return (
        <NoDataAvailable
          hebrewMessage="אין נתונים זמינים מגוגל שיטס"
          onRetry={hookResult.refresh}
          isConnected={hookResult.isConnected}
        />
      )
    }
    
    return fallbackContent
  }

  const tabs = [
    { id: "overview", label: "סקירה כללית", icon: BarChart3 },
    { id: "payments", label: "תשלומי דיירים", icon: Users },
    { id: "fees", label: "תעריפי דירות", icon: Home },
  ]

  const OverviewContent = () => (
    <div className="space-y-6">
      <Card className="bg-muted/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            <CardTitle className="hebrew-text">סיכום ביצועים</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground hebrew-text">ביצועי הבניין הכלליים ומדדים עיקריים</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-muted-foreground hebrew-text">יתרת הבניין</div>
              {renderDataOrError(accountStatus, (
                <>
                  <div
                    className={`text-2xl font-bold currency-hebrew ${
                      (accountStatus.data?.balance || 0) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(accountStatus.data?.balance || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground hebrew-text">
                    הכנסות: {formatCurrency(totalMonthlyIncome)} | הוצאות: {formatCurrency(totalMonthlyExpenses)}
                  </div>
                </>
              ))}
            </div>

            <div>
              <div className="text-sm text-muted-foreground hebrew-text">דירות פעילות</div>
              {renderDataOrError(tenantPayments, (
                <>
                  <div className="text-2xl font-bold hebrew-numbers">{totalPayments}</div>
                  <div className="text-sm text-muted-foreground hebrew-text">דירות</div>
                </>
              ))}
            </div>

            <div>
              <div className="text-sm text-muted-foreground hebrew-text">אחוז תשלומים</div>
              {renderDataOrError(tenantPayments, (
                <>
                  <div className={`text-2xl font-bold ${paymentPercentage >= 80 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {paymentPercentage}%
                  </div>
                  <div className="text-sm text-muted-foreground hebrew-text">
                    {paidPayments} מתוך {totalPayments} שילמו
                  </div>
                </>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Account Balance Card - Cyan */}
        <Card className="gradient-card-cyan">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-cyan-800 dark:text-cyan-200 hebrew-text">יתרת הבניין</CardTitle>
              <DollarSign className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            {renderDataOrError(accountStatus, (
              <>
                <div
                  className={`text-2xl font-bold currency-hebrew ${
                    (accountStatus.data?.balance || 0) >= 0 ? "text-cyan-900 dark:text-cyan-100" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(accountStatus.data?.balance || 0)}
                </div>
                <div className="text-xs text-cyan-600 dark:text-cyan-400 hebrew-text">יתרה נוכחית בקופת הבניין</div>
              </>
            ))}
          </CardContent>
        </Card>

        {/* Monthly Income Card - Blue */}
        <Card className="gradient-card-blue">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200 hebrew-text">הכנסות חודשיות</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            {renderDataOrError(apartmentFees, (
              <>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 currency-hebrew">
                  {formatCurrency(totalMonthlyIncome)}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 hebrew-text">סך תשלומי ועד הבית החודשיים</div>
              </>
            ))}
          </CardContent>
        </Card>

        {/* Monthly Expenses Card - Green */}
        <Card className="gradient-card-green">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200 hebrew-text">הוצאות חודשיות</CardTitle>
              <Building className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            {renderDataOrError(monthlyExpenses, (
              <>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100 currency-hebrew">
                  {formatCurrency(totalMonthlyExpenses)}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 hebrew-text">סך ההוצאות החודשיות</div>
              </>
            ))}
          </CardContent>
        </Card>

        {/* Expected Expenses Card - Purple */}
        <Card className="gradient-card-purple">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200 hebrew-text">הוצאות צפויות</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            {renderDataOrError(expectedExpenses, (
              <>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 currency-hebrew">
                  {formatCurrency(totalExpectedExpenses)}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 hebrew-text">הוצאות מתוכננות לחודשים הקרובים</div>
              </>
            ))}
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
            {renderDataOrError(monthlyExpenses, (
              <div className="space-y-3">
                {monthlyExpenses.data?.slice(0, 5).map((expense, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="hebrew-text">{expense.description}</span>
                    <span className="font-semibold currency-hebrew">{formatCurrency(expense.amount)}</span>
                  </div>
                ))}
              </div>
            ))}
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
            {renderDataOrError(expectedExpenses, (
              <div className="space-y-3">
                {expectedExpenses.data?.slice(0, 5).map((expense, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="hebrew-text">{expense.description}</span>
                      <div className="text-xs text-muted-foreground hebrew-text">{expense.category}</div>
                    </div>
                    <span className="font-semibold currency-hebrew">{formatCurrency(expense.amount)}</span>
                  </div>
                ))}
              </div>
            ))}
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
            <p className="text-muted-foreground hebrew-text">מעקב אחר הוצאות ותשלומי דיירים</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded hebrew-text">
              {totalPayments > 0 ? `${totalPayments} דירות נטענו` : "טוען נתונים..."}
            </span>
            <span className="text-sm text-muted-foreground hebrew-text">
              עודכן:{" "}
              {mounted && accountStatus.lastFetched ? formatHebrewDate(accountStatus.lastFetched) : "לא זמין"}
            </span>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${connectionStatus.isFullyConnected ? "bg-green-500" : "bg-yellow-500"}`}
              />
              <span className="text-xs text-muted-foreground hebrew-text">
                {connectionStatus.isFullyConnected
                  ? "מחובר לגוגל שיטס"
                  : `${connectionStatus.connectedCount}/${connectionStatus.totalCount} מחובר`}
              </span>
            </div>
          </div>
        </div>

        <div className="border-b border-border" dir="rtl">
          <nav className="flex space-x-8 space-x-reverse">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
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
