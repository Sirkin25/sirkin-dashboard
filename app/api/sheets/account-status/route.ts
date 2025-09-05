import { NextResponse } from "next/server"
import { sheetsClient } from "@/lib/sheets-client"
import { handleApiError } from "@/lib/errors"
import { formatAccountStatus, parseHebrewCurrency, parseHebrewDate } from "@/lib/formatters"
import type { AccountStatusData, ApiResponse } from "@/lib/types/api"

// Sheet configuration for account status
const ACCOUNT_STATUS_CONFIG = {
  sheetId: process.env.GOOGLE_SHEETS_ID || "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  gid: process.env.ACCOUNT_STATUS_GID || "0",
}

function parseAccountStatusData(csvData: string): AccountStatusData[] {
  const rows = sheetsClient.parseCSV(csvData)

  // Skip header row
  const dataRows = rows.slice(1)

  return dataRows
    .map((row) => {
      // Correct column order: [dateStr, balanceStr, changeStr]
      const [dateStr, balanceStr, changeStr] = row

      const balance = parseHebrewCurrency(balanceStr || "0")
      const lastUpdated = parseHebrewDate(dateStr || "")
      const monthlyChange = Number.parseFloat(changeStr || "0")
      const status = formatAccountStatus(balance)

      return {
        balance,
        lastUpdated: lastUpdated.toISOString(),
        monthlyChange,
        status,
      }
    })
    .filter((row) => row.balance >= 0) // Include zero balance but filter out negative parsing errors
}

export async function GET() {
  try {
    const result = await sheetsClient.fetchSheetData(
      ACCOUNT_STATUS_CONFIG, 
      parseAccountStatusData
    )

    // Return the most recent account status
    const accountStatus = result.data[0]
    
    if (!accountStatus) {
      throw new Error("No account status data available")
    }

    const response: ApiResponse<AccountStatusData> = {
      data: accountStatus,
      meta: {
        isConnected: result.status === "connected",
        source: result.source as 'sheets' | 'error',
        lastFetched: result.lastUpdated.toISOString(),
        message: "נתונים נטענו מגוגל שיטס"
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Account status API error:", error)
    
    const errorState = handleApiError(error as Error)
    
    const response: ApiResponse<AccountStatusData> = {
      data: null,
      meta: {
        isConnected: false,
        source: "error",
        lastFetched: new Date().toISOString(),
        message: "שגיאה בטעינת נתונים מגוגל שיטס"
      },
      error: {
        code: errorState.type,
        message: errorState.message,
        hebrewMessage: errorState.hebrewMessage
      }
    }

    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
