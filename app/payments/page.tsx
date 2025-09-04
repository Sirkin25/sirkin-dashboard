"use client"

import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { TenantPayments } from "@/components/dashboard/TenantPayments"
import { ApartmentFees } from "@/components/dashboard/ApartmentFees"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTenantPayments, useApartmentFees } from "@/hooks/use-sheets-data"
import { formatCurrency } from "@/lib/hebrew-utils"
import { RefreshCw, Download, Mail, CreditCard, Users, Building } from "lucide-react"

export default function PaymentsPage() {
  const tenantPayments = useTenantPayments({ autoRefresh: true })
  const apartmentFees = useApartmentFees()

  const handleRefresh = async () => {
    await Promise.all([tenantPayments.refresh(), apartmentFees.refresh()])
  }

  const totalCollected =
    tenantPayments.data?.payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.monthlyFee, 0) || 0

  const totalExpected = tenantPayments.data?.payments.reduce((sum, p) => sum + p.monthlyFee, 0) || 0

  const paidCount = tenantPayments.data?.payments.filter((p) => p.status === "paid").length || 0
  const totalCount = tenantPayments.data?.payments.length || 0

  return (
    <DashboardLayout currentPage="payments">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground hebrew-text">ניהול תשלומים</h1>
            <p className="text-muted-foreground hebrew-text">מעקב אחר תשלומי דיירים ודמי ועד הבית</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleRefresh}>
              <RefreshCw className={`h-4 w-4 ${tenantPayments.loading ? "animate-spin" : ""}`} />
              <span className="hebrew-text">רענן</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              <span className="hebrew-text">ייצא דוח</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Mail className="h-4 w-4" />
              <span className="hebrew-text">שלח תזכורות</span>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base hebrew-text flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-success" />
                נגבה החודש
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tenantPayments.loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-success currency-hebrew">{formatCurrency(totalCollected)}</div>
              )}
              <p className="text-sm text-muted-foreground hebrew-text">מתוך {formatCurrency(totalExpected)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base hebrew-text flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                דירות ששילמו
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tenantPayments.loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-primary hebrew-numbers">
                  {paidCount}/{totalCount}
                </div>
              )}
              <p className="text-sm text-muted-foreground hebrew-text">
                {totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0}% אחוז גביה
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base hebrew-text">נותר לגבות</CardTitle>
            </CardHeader>
            <CardContent>
              {tenantPayments.loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-destructive currency-hebrew">
                  {formatCurrency(totalExpected - totalCollected)}
                </div>
              )}
              <p className="text-sm text-muted-foreground hebrew-text">{totalCount - paidCount} דירות לא שילמו</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base hebrew-text flex items-center gap-2">
                <Building className="h-5 w-5 text-accent" />
                הכנסה חודשית
              </CardTitle>
            </CardHeader>
            <CardContent>
              {apartmentFees.loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-accent currency-hebrew">
                  {formatCurrency(apartmentFees.data?.fees.reduce((sum, fee) => sum + fee.totalMonthlyFee, 0) || 0)}
                </div>
              )}
              <p className="text-sm text-muted-foreground hebrew-text">הכנסה צפויה מלאה</p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Components */}
        <div className="space-y-6">
          {tenantPayments.loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : tenantPayments.data ? (
            <TenantPayments payments={tenantPayments.data.payments} currentMonth={tenantPayments.data.currentMonth} />
          ) : null}

          {apartmentFees.loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : apartmentFees.data ? (
            <ApartmentFees fees={apartmentFees.data.fees} buildingTotalArea={apartmentFees.data.buildingTotalArea} />
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  )
}
