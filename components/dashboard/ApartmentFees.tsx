"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/formatters"
import { Home, Building, TrendingUp } from "lucide-react"
import { useApartmentFees } from "@/hooks/use-sheets-data"
import { LoadingSpinner } from "@/components/ui/loading-states"
import { NoDataAvailable } from "@/components/ui/no-data-available"
import { ConnectionError } from "@/components/ui/connection-error"

export function ApartmentFees() {
  const { data: feesData, loading, error, isConnected, source, refresh } = useApartmentFees({ autoRefresh: true })

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2 hebrew-text">
            <Home className="h-5 w-5" />
            תעריפי דירות
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <LoadingSpinner size="lg" message="טוען תעריפי דירות..." />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <ConnectionError
        hebrewMessage={error.hebrewMessage || "שגיאה בטעינת תעריפי דירות"}
        onRetry={refresh}
        canRetry={error.canRetry}
      />
    )
  }

  if (!feesData) {
    return (
      <NoDataAvailable
        title="אין נתוני תעריפים"
        hebrewMessage="לא ניתן לטעון תעריפי דירות מגוגל שיטס"
        onRetry={refresh}
        isConnected={isConnected}
      />
    )
  }

  const { apartments, totalRevenue, averageFee } = feesData

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground hebrew-text">סך הכנסות חודשיות</p>
                <p className="text-2xl font-bold currency-hebrew">{formatCurrency(totalRevenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground hebrew-text">ממוצע תשלום</p>
                <p className="text-2xl font-bold currency-hebrew">{formatCurrency(averageFee)}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground hebrew-text">מספר דירות</p>
                <p className="text-2xl font-bold hebrew-numbers">{apartments.length}</p>
              </div>
              <Home className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Apartment Fees Table */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2 hebrew-text">
              <Home className="h-5 w-5" />
              תעריפי דירות
            </CardTitle>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-xs text-muted-foreground">
                {isConnected ? "מחובר" : "לא מחובר"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right text-foreground">מספר דירה</TableHead>
                  <TableHead className="text-right text-foreground">בעל הדירה</TableHead>
                  <TableHead className="text-right text-foreground">גודל (מ"ר)</TableHead>
                  <TableHead className="text-right text-foreground">תשלום חודשי</TableHead>
                  <TableHead className="text-right text-foreground">סוג</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apartments.map((apartment) => (
                  <TableRow key={apartment.apartmentNumber}>
                    <TableCell className="text-right font-medium hebrew-numbers">
                      {apartment.apartmentNumber}
                    </TableCell>
                    <TableCell className="text-right hebrew-text">
                      {apartment.ownerName}
                    </TableCell>
                    <TableCell className="text-right hebrew-numbers">
                      {apartment.apartmentSize}
                    </TableCell>
                    <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400 currency-hebrew">
                      {formatCurrency(apartment.totalMonthlyFee)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={apartment.feeType === 'owner' ? 'default' : 'secondary'}>
                        {apartment.feeType === 'owner' ? 'בעלים' : 'שוכר'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
