"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/formatters"
import { Home, Building, TrendingUp } from "lucide-react"
import { useApartmentFees } from "@/hooks/use-sheets-data"
import { LoadingSpinner } from "@/components/ui/loading-states"
import { ErrorDisplay, ConnectionStatus } from "@/components/ui/error-display"

export function ApartmentFees() {
  const { data: feesData, loading, error, isConnected, source, refresh } = useApartmentFees({ autoRefresh: true })

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Home className="h-5 w-5" />
            תעריפי דירות
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refresh} />
  }

  if (!feesData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Home className="h-5 w-5" />
            תעריפי דירות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground hebrew-text">אין נתונים זמינים</p>
          </div>
        </CardContent>
      </Card>
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
              <TrendingUp className="h-8 w-8 text-green-600" />
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
              <Building className="h-8 w-8 text-blue-600" />
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
              <Home className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Apartment Fees Table */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Home className="h-5 w-5" />
              תעריפי דירות
            </CardTitle>
            <ConnectionStatus isConnected={isConnected} source={source} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">מספר דירה</TableHead>
                  <TableHead className="text-right">בעל הדירה</TableHead>
                  <TableHead className="text-right">גודל (מ"ר)</TableHead>
                  <TableHead className="text-right">תשלום חודשי</TableHead>
                  <TableHead className="text-right">סוג</TableHead>
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
                    <TableCell className="text-right font-bold text-blue-600 currency-hebrew">
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
