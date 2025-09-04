import { NextResponse } from "next/server"
import { sheetsClient } from "@/lib/sheets-client"
import { mockTenantPayments } from "@/lib/mock-data"

const TENANT_PAYMENTS_CONFIG = {
  sheetId: process.env.GOOGLE_SHEETS_ID || "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
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

  // Skip header row
  const dataRows = rows.slice(1)

  return dataRows
    .map((row) => {
      const [aptNumStr, nameStr, feeStr, lastPaymentStr, statusStr, phoneStr, emailStr, balanceStr] = row

      return {
        apartmentNumber: Number.parseInt(aptNumStr || "0"),
        tenantName: nameStr || "",
        monthlyFee: sheetsClient.parseHebrewCurrency(feeStr || "0"),
        lastPaymentDate: lastPaymentStr ? sheetsClient.parseHebrewDate(lastPaymentStr) : null,
        status: (statusStr?.toLowerCase() as "paid" | "pending" | "overdue") || "pending",
        phone: phoneStr || undefined,
        email: emailStr || undefined,
        balance: sheetsClient.parseHebrewCurrency(balanceStr || "0"),
      }
    })
    .filter((row) => row.apartmentNumber > 0 && row.tenantName)
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
