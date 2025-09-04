import { NextResponse } from "next/server"
import { sheetsClient } from "@/lib/sheets-client"
import { mockAccountStatus } from "@/lib/mock-data"

// Sheet configuration for account status
const ACCOUNT_STATUS_CONFIG = {
  sheetId: process.env.GOOGLE_SHEETS_ID || "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  gid: process.env.ACCOUNT_STATUS_GID || "0",
}

interface AccountStatusRow {
  balance: number
  lastUpdated: Date
  monthlyChange: number
  status: "healthy" | "warning" | "critical"
}

function parseAccountStatusData(csvData: string): AccountStatusRow[] {
  const rows = sheetsClient.parseCSV(csvData)

  // Skip header row
  const dataRows = rows.slice(1)

  return dataRows
    .map((row) => {
      const [balanceStr, dateStr, changeStr, statusStr] = row

      return {
        balance: sheetsClient.parseHebrewCurrency(balanceStr || "0"),
        lastUpdated: sheetsClient.parseHebrewDate(dateStr || ""),
        monthlyChange: Number.parseFloat(changeStr || "0"),
        status: (statusStr?.toLowerCase() as "healthy" | "warning" | "critical") || "healthy",
      }
    })
    .filter((row) => row.balance > 0) // Filter out empty rows
}

export async function GET() {
  try {
    const result = await sheetsClient.fetchSheetData(ACCOUNT_STATUS_CONFIG, parseAccountStatusData, [mockAccountStatus])

    // Return the most recent account status
    const accountStatus = result.data[0] || mockAccountStatus

    return NextResponse.json({
      ...accountStatus,
      isConnected: result.status === "connected",
      source: result.source,
      lastFetched: result.lastUpdated,
    })
  } catch (error) {
    console.error("Account status API error:", error)

    return NextResponse.json({
      ...mockAccountStatus,
      isConnected: false,
      source: "Mock Data (API Error)",
      lastFetched: new Date(),
    })
  }
}

export async function POST() {
  // Refresh data by calling GET
  return GET()
}
