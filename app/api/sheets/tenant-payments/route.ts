import { NextResponse } from "next/server"
import { sheetsClient } from "@/lib/sheets-client"
import { mockTenantPayments } from "@/lib/mock-data"

const TENANT_PAYMENTS_CONFIG = {
  sheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  gid: process.env.TENANT_PAYMENTS_GID || "3",
}

interface TenantPaymentRow {
  apartmentNumber: number
  tenantName: string
  monthlyFee: number
  lastPaymentDate: Date | null
  status: "paid" | "pending" | "overdue"
  phone?: string
  email?: string
  balance: number
}

function parseTenantPaymentsData(csvData: string): TenantPaymentRow[] {
  const rows = sheetsClient.parseCSV(csvData)
  
  if (rows.length < 2) return []
  
  // First row has apartment numbers: דירה/חודש,1,2,3,4,5,6,7,8,9,10,11,12
  const headerRow = rows[0]
  const apartmentNumbers = headerRow.slice(1) // Skip first column "דירה/חודש"
  
  // Get the most recent month's data (second row)
  const latestMonthRow = rows[1]
  const monthName = latestMonthRow[0] // e.g., "Jul-25"
  const paymentStatuses = latestMonthRow.slice(1) // TRUE/FALSE values
  
  // Convert to tenant payment records
  const tenantPayments: TenantPaymentRow[] = []
  
  for (let i = 0; i < apartmentNumbers.length && i < paymentStatuses.length; i++) {
    const aptNum = Number.parseInt(apartmentNumbers[i])
    const isPaid = paymentStatuses[i]?.toUpperCase() === 'TRUE'
    
    if (aptNum > 0) {
      tenantPayments.push({
        apartmentNumber: aptNum,
        tenantName: `דירה ${aptNum}`, // "Apartment X"
        monthlyFee: 120, // Default fee, could be calculated from apartment fees sheet
        lastPaymentDate: isPaid ? new Date() : null,
        status: isPaid ? "paid" : "pending",
        balance: isPaid ? 0 : 120,
      })
    }
  }
  
  return tenantPayments
}

export async function GET() {
  try {
    const result = await sheetsClient.fetchSheetData(
      TENANT_PAYMENTS_CONFIG,
      parseTenantPaymentsData,
      mockTenantPayments,
    )

    const currentMonth = new Intl.DateTimeFormat("he-IL", {
      year: "numeric",
      month: "long",
    }).format(new Date())

    return NextResponse.json({
      payments: result.data,
      currentMonth,
      isConnected: result.status === "connected",
      source: result.source,
      lastFetched: result.lastUpdated,
    })
  } catch (error) {
    console.error("Tenant payments API error:", error)

    const currentMonth = new Intl.DateTimeFormat("he-IL", {
      year: "numeric",
      month: "long",
    }).format(new Date())

    return NextResponse.json({
      payments: mockTenantPayments,
      currentMonth,
      isConnected: false,
      source: "Mock Data (API Error)",
      lastFetched: new Date(),
    })
  }
}

export async function POST() {
  return GET()
}
