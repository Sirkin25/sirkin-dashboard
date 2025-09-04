"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPaymentStatus, HEBREW_MONTHS } from "@/lib/utils-hebrew"
import { Loader2, AlertCircle, CheckCircle, Filter } from "lucide-react"

interface TenantPaymentData {
  apartment: string
  [key: `month_${number}`]: string // month_1, month_2, ..., month_12
}

interface ApiResponse {
  data: TenantPaymentData[]
  source: "mock" | "sheets"
  message: string
  year: number
  halfYear: 1 | 2
}

export function TenantPayments() {
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  // Determine current half-year: 1 for Jan-Jun, 2 for Jul-Dec
  const initialHalfYear = new Date().getMonth() >= 6 ? 2 : 1
  const [selectedHalfYear, setSelectedHalfYear] = useState<1 | 2>(initialHalfYear)

  const fetchData = async (year: number) => {
    setLoading(true)
    try {
      // API now returns full year data for the selected year
      const res = await fetch(`/api/sheets/tenant-payments?year=${year}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const result = await res.json()
      setResponse(result)
    } catch (err) {
      console.error("Tenant Payments Fetch Error:", err)
      // Generate mock data for 16 apartments and 12 months
      const mockData = Array.from({ length: 16 }, (_, i) => {
        const row: any = { apartment: `דירה ${i + 1}` }
        HEBREW_MONTHS.forEach((_, index) => {
          row[`month_${index + 1}`] = Math.random() > 0.3 ? "✓" : "✗" // Use ✓/✗ for consistency
        })
        return row
      })

      setResponse({
        data: mockData,
        source: "mock",
        message: "נתוני דוגמה - שגיאה בחיבור",
        year,
        halfYear: selectedHalfYear, // Keep halfYear for consistency, though it's client-side
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(selectedYear)
  }, [selectedYear])

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin ml-2" />
          <span>טוען נתונים...</span>
        </CardContent>
      </Card>
    )
  }

  const tenants = response?.data || []
  const source = response?.source || "mock"
  const message = response?.message || ""

  // Determine which months to display based on selectedHalfYear
  const displayMonthIndices = selectedHalfYear === 1 ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11]
  const displayMonthNames = displayMonthIndices.map((index) => HEBREW_MONTHS[index])

  // Calculate statistics based on the displayed months
  const totalPayments = tenants.reduce((total, tenant) => {
    return (
      total +
      displayMonthIndices.reduce((monthTotal, monthIndex) => {
        // Check the actual month_X key from the tenant object
        return monthTotal + (tenant[`month_${monthIndex + 1}`] === "✓" ? 1 : 0)
      }, 0)
    )
  }, 0)

  const totalPossible = tenants.length * displayMonthNames.length
  const paymentRate = totalPossible > 0 ? ((totalPayments / totalPossible) * 100).toFixed(1) : "0"

  const currentYear = new Date().getFullYear()
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            💸 סטטוס תשלומי דיירים
            {source === "sheets" ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-600" />
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
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
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-600">אחוז תשלומים</p>
            <p className="text-2xl font-bold text-green-600">{paymentRate}%</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-600">סה"כ תשלומים</p>
            <p className="text-2xl font-bold text-blue-600">
              {totalPayments}/{totalPossible}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto" dir="rtl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right font-bold sticky right-0 bg-white z-10">דירה</TableHead>
                {displayMonthNames.map((month, index) => (
                  <TableHead key={month} className="text-center font-bold min-w-[80px]">
                    {month} {selectedYear % 100} {/* Display year suffix in header */}
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
                    <TableCell className="text-right font-medium sticky right-0 bg-white z-10">{apartment}</TableCell>
                    {displayMonthIndices.map((monthIndex) => {
                      // Access the month data using the month_X key
                      const rawValue = tenant[`month_${monthIndex + 1}`]
                      const status = getPaymentStatus(rawValue?.toString().toLowerCase().trim() || "")
                      return (
                        <TableCell key={monthIndex} className="text-center">
                          <span className={`text-lg ${status.color}`}>{status.icon}</span>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        <div className="text-center text-sm text-gray-500 mt-4 pt-4 border-t">
          <p className={source === "sheets" ? "text-green-600" : "text-amber-600"}>{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}
