"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"
import { HEBREW_MONTHS } from "@/lib/constants/hebrew"
import { formatPaymentStatus } from "@/lib/formatters"
import { NoDataAvailable } from "@/components/ui/no-data-available"
import { ConnectionError } from "@/components/ui/connection-error"
import { LoadingSpinner, RefreshIndicator } from "@/components/ui/loading-states"
import type { TenantPaymentsResponse, ApiResponse, ErrorState } from "@/lib/types/api"

export function TenantPayments() {
  const [response, setResponse] = useState<ApiResponse<TenantPaymentsResponse> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ErrorState | null>(null)
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1 // 1-12
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const initialHalfYear = currentMonth >= 7 ? 2 : 1 // Jul-Dec = 2, Jan-Jun = 1
  const [selectedHalfYear, setSelectedHalfYear] = useState<1 | 2>(initialHalfYear)

  const fetchData = async (year: number, halfYear: 1 | 2) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/sheets/tenant-payments?year=${year}&halfYear=${halfYear}`)
      const result: ApiResponse<TenantPaymentsResponse> = await res.json()
      
      if (!res.ok) {
        setError(result.error || {
          type: 'unknown_error',
          message: 'API request failed',
          hebrewMessage: 'שגיאה לא ידועה',
          canRetry: true
        })
      } else {
        setResponse(result)
      }
    } catch (err) {
      console.error("Tenant Payments Fetch Error:", err)
      setError({
        type: 'network_error',
        message: err instanceof Error ? err.message : 'Unknown error',
        hebrewMessage: 'שגיאת רשת - בדוק את החיבור לאינטרנט',
        canRetry: true
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    fetchData(selectedYear, selectedHalfYear)
  }

  useEffect(() => {
    fetchData(selectedYear, selectedHalfYear)
  }, [selectedYear, selectedHalfYear])



  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-bold hebrew-text">
            💸 סטטוס תשלומי דיירים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner size="lg" message="טוען נתוני תשלומים..." />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <ConnectionError
        hebrewMessage={error.hebrewMessage}
        errorCode={error.type}
        onRetry={handleRetry}
        canRetry={error.canRetry}
      />
    )
  }

  if (!response || !response.data) {
    return (
      <NoDataAvailable
        title="אין נתוני תשלומים"
        hebrewMessage="לא ניתן לטעון נתוני תשלומי דיירים מגוגל שיטס"
        onRetry={handleRetry}
        isConnected={false}
      />
    )
  }

  const { data: paymentsData, meta } = response
  const { data: tenants, statistics, actualMonths } = paymentsData

  // Always show 6 months based on traditional calendar half-year structure
  const monthNumbers = selectedHalfYear === 1 ? [1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11, 12] // Jan-Jun or Jul-Dec
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  // Create display data for the 6 months of the selected half-year
  const displayMonthData: { monthName: string; actualMonth: string | null; dataIndex: number | null }[] = []
  
  monthNumbers.forEach(monthNum => {
    const monthName = monthNames[monthNum - 1] // Convert 1-12 to 0-11 index
    const expectedMonthFormat = `${monthName}-${selectedYear.toString().slice(-2)}` // e.g., "Jan-25"
    
    // Find if we have actual data for this month
    let actualMonth: string | null = null
    let dataIndex: number | null = null
    
    if (actualMonths && actualMonths.length > 0) {
      const foundIndex = actualMonths.findIndex(month => month === expectedMonthFormat)
      if (foundIndex !== -1) {
        actualMonth = actualMonths[foundIndex]
        dataIndex = foundIndex
      }
    }
    
    displayMonthData.push({
      monthName: expectedMonthFormat,
      actualMonth,
      dataIndex
    })
  })
  
  const displayMonthNames = displayMonthData.map(item => item.monthName)
  const displayMonthIndices = displayMonthData.map(item => item.dataIndex)


  // Always show previous year, current year, next year
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold hebrew-text">
              💸 סטטוס תשלומי דיירים
            </CardTitle>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${meta.isConnected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-xs text-muted-foreground">
                {meta.isConnected ? "מחובר" : "לא מחובר"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedHalfYear.toString()}
              onValueChange={(value) => setSelectedHalfYear(Number(value) as 1 | 2)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">מחצית ראשונה</SelectItem>
                <SelectItem value="2">מחצית שנייה</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg text-center border border-green-200 dark:border-green-800">
            <p className="text-sm text-muted-foreground hebrew-text">אחוז תשלומים</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statistics.paymentRate}%</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-center border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-muted-foreground hebrew-text">סה"כ תשלומים</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {statistics.totalPayments}/{statistics.totalPossible}
            </p>
          </div>
        </div>

        <RefreshIndicator
          isRefreshing={false}
          onRefresh={handleRetry}
          lastUpdated={new Date(meta.lastFetched)}
          className="mt-2"
        />
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto table-rtl" dir="rtl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right font-bold sticky-right hebrew-text">
                  דירה
                </TableHead>
                {displayMonthNames.map((month) => (
                  <TableHead key={month} className="text-center font-bold min-w-[80px] hebrew-text">
                    {month}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant, index) => {
                const apartment = tenant.apartment?.toString().trim()
                if (!apartment) {
                  console.warn("Skipping row with missing apartment:", tenant)
                  return null
                }
                return (
                  <TableRow key={index}>
                    <TableCell className="text-right font-medium sticky-right hebrew-text">
                      {apartment}
                    </TableCell>
                    {displayMonthIndices.map((monthIndex, i) => {
                      let rawValue = ""
                      
                      if (monthIndex !== null) {
                        // We have actual data for this month
                        const monthKey = `month_${monthIndex + 1}` as keyof typeof tenant
                        rawValue = tenant[monthKey] as string
                      }
                      // If monthIndex is null, rawValue stays empty, which will show ✗
                      
                      const status = formatPaymentStatus(rawValue?.toString().toLowerCase().trim() || "")
                      return (
                        <TableCell key={i} className="text-center">
                          <span 
                            className={`text-lg ${status.color}`}
                            title={status.text}
                          >
                            {status.icon}
                          </span>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t">
          <p className={`hebrew-text ${meta.isConnected ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
            {meta.message}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
