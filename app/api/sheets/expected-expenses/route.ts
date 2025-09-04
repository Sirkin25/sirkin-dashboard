import { NextResponse } from "next/server"
import { sheetsClient } from "@/lib/sheets-client"
import { mockExpectedExpenses } from "@/lib/mock-data"

const EXPECTED_EXPENSES_CONFIG = {
  sheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
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
      // Your sheet format: קטגוריה, סכום מוערך, צפוי בחודש
      const [categoryStr, amountStr, dueDateStr] = row

      // Skip empty rows
      if (!categoryStr || !amountStr) {
        return null
      }

      return {
        id: `expected-${index + 1}`,
        description: categoryStr || "", // Using category as description for now
        category: "הוצאות צפויות", // Default category
        amount: sheetsClient.parseHebrewCurrency(amountStr || "0"),
        dueDate: sheetsClient.parseHebrewDate(dueDateStr || ""),
        priority: "medium" as const,
        recurring: false,
      }
    })
    .filter((row) => row !== null && row.description && row.amount > 0)
}

export async function GET() {
  try {
    console.log("=== Expected Expenses API Called ===")
    console.log("Config:", EXPECTED_EXPENSES_CONFIG)
    console.log("Environment check:")
    console.log("- GOOGLE_SHEETS_SPREADSHEET_ID:", process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? "✓" : "✗")
    console.log("- EXPECTED_EXPENSES_GID:", process.env.EXPECTED_EXPENSES_GID ? "✓" : "✗")

    const result = await sheetsClient.fetchSheetData(
      EXPECTED_EXPENSES_CONFIG,
      parseExpectedExpensesData,
      mockExpectedExpenses,
    )

    console.log("Fetch result:")
    console.log("- Status:", result.status)
    console.log("- Source:", result.source)
    console.log("- Data length:", result.data.length)

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
