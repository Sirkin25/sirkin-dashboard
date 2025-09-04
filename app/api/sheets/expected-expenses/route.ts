import { NextResponse } from "next/server"
import { sheetsClient } from "@/lib/sheets-client"
import { mockExpectedExpenses } from "@/lib/mock-data"

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
      const [descriptionStr, categoryStr, amountStr, dueDateStr, priorityStr, recurringStr] = row

      return {
        id: `expected-${index + 1}`,
        description: descriptionStr || "",
        category: categoryStr || "כללי",
        amount: sheetsClient.parseHebrewCurrency(amountStr || "0"),
        dueDate: sheetsClient.parseHebrewDate(dueDateStr || ""),
        priority: (priorityStr?.toLowerCase() as "low" | "medium" | "high") || "medium",
        recurring: recurringStr?.toLowerCase() === "true" || recurringStr === "כן",
      }
    })
    .filter((row) => row.description && row.amount > 0)
}

export async function GET() {
  try {
    const result = await sheetsClient.fetchSheetData(
      EXPECTED_EXPENSES_CONFIG,
      parseExpectedExpensesData,
      mockExpectedExpenses,
    )

    return NextResponse.json({
      expenses: result.data,
      isConnected: result.status === "connected",
      source: result.source,
      lastFetched: result.lastUpdated,
    })
  } catch (error) {
    console.error("Expected expenses API error:", error)

    return NextResponse.json({
      expenses: mockExpectedExpenses,
      isConnected: false,
      source: "Mock Data (API Error)",
      lastFetched: new Date(),
    })
  }
}

export async function POST() {
  return GET()
}
