import { NextResponse } from "next/server"
import { sheetsClient } from "@/lib/sheets-client"

const EXPECTED_EXPENSES_CONFIG = {
  sheetId: process.env.GOOGLE_SHEETS_ID || "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  gid: process.env.EXPECTED_EXPENSES_GID || "2",
}

interface ExpectedExpenseRow {
  id: string
  description: string
  category: string
  amount: number
  dueDate: Date
  priority: "low" | "medium" | "high"
  recurring: boolean
}

function parseExpectedExpensesData(csvData: string): ExpectedExpenseRow[] {
  const rows = sheetsClient.parseCSV(csvData)

  // Skip header row
  const dataRows = rows.slice(1)

  return dataRows
    .map((row, index) => {
      // Correct column order: [category, amount, expectedMonth]
      const [categoryStr, amountStr, expectedMonthStr] = row

      // Use category as description for now
      const description = categoryStr || ""
      const amount = sheetsClient.parseHebrewCurrency(amountStr || "0")
      
      // Parse the expected month (like "Jul-25") into a date
      let dueDate = new Date()
      if (expectedMonthStr) {
        // Try to parse month-year format like "Jul-25"
        const monthMatch = expectedMonthStr.match(/(\w+)-(\d+)/)
        if (monthMatch) {
          const [, monthStr, yearStr] = monthMatch
          const year = 2000 + parseInt(yearStr) // Convert "25" to 2025
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          const monthIndex = monthNames.indexOf(monthStr)
          if (monthIndex !== -1) {
            dueDate = new Date(year, monthIndex, 1)
          }
        }
      }

      return {
        id: `expected-${index + 1}`,
        description,
        category: categoryStr || "כללי",
        amount,
        dueDate,
        priority: "medium" as const,
        recurring: false,
      }
    })
    .filter((row) => row.description && row.amount > 0)
}

export async function GET() {
  try {
    const result = await sheetsClient.fetchSheetData(
      EXPECTED_EXPENSES_CONFIG,
      parseExpectedExpensesData
    )

    const response = {
      data: result.data,
      meta: {
        isConnected: result.status === "connected",
        source: result.source as 'sheets' | 'error',
        lastFetched: result.lastUpdated.toISOString(),
        message: "נתונים נטענו מגוגל שיטס"
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Expected expenses API error:", error)

    const response = {
      data: null,
      meta: {
        isConnected: false,
        source: "error" as const,
        lastFetched: new Date().toISOString(),
        message: "שגיאה בטעינת נתונים מגוגל שיטס"
      },
      error: {
        code: "FETCH_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        hebrewMessage: "שגיאה בטעינת נתונים"
      }
    }

    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
