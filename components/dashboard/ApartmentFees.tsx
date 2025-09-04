"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils-hebrew"
import { Loader2, Home } from "lucide-react"

export function ApartmentFees() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/sheets/apartment-fees")
      .then((r) => r.json())
      .then((result) => {
        console.log("Apartment Fees Data:", result)
        setData(result)
      })
      .catch((err) => {
        console.error("Apartment Fees Error:", err)
        setData({
          data: [
            { "מספר חדרים": "2 חדרים", סכום: "450" },
            { "מספר חדרים": "3 חדרים", סכום: "550" },
            { "מספר חדרים": "4 חדרים", סכום: "650" },
            { "מספר חדרים": "5 חדרים", סכום: "750" },
            { "מספר חדרים": "פנטהאוז", סכום: "900" },
          ],
          source: "mock",
          message: "נתוני דוגמה",
        })
      })
      .finally(() => setLoading(false))
  }, [])

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

  const fees = data?.data || []
  console.log("Rendering fees:", fees)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Home className="h-5 w-5" />📐 תעריף לפי גודל דירה
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">מספר חדרים</TableHead>
                <TableHead className="text-right">סכום לחודש</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee: any, index: number) => {
                console.log("Fee row:", fee)

                const rooms = fee["מספר חדרים"] || fee.rooms || Object.values(fee)[0] || "-"
                const amount = fee.סכום || fee.amount || Object.values(fee)[1] || "0"

                return (
                  <TableRow key={index}>
                    <TableCell className="text-right font-medium">{String(rooms)}</TableCell>
                    <TableCell className="text-right font-bold text-blue-600">
                      {formatCurrency(String(amount))}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <div className="text-center text-sm text-gray-500 mt-4 pt-4 border-t">
          <p className="text-amber-600">{data?.message || "נתוני דוגמה"}</p>
        </div>
      </CardContent>
    </Card>
  )
}
