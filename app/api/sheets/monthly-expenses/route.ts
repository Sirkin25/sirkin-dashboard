import { NextResponse } from "next/server"
import { sheetsClient } from "@/lib/sheets-client"
import { mockExpenses } from "@/lib/mock-data"

const MONTHLY_EXPENSES_CONFIG = {
  sheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  gid: process.env.MONTHLY_EXPENSES_GID || "1",
}

interface ExpenseRow {
  id: string
  description: string
  category: string
  amount: number
  date: Date
  status: "paid" | "pending" | "overdue"
}

function parseMonthlyExpensesData(csvData: string): ExpenseRow[] {
  const rows = sheetsClient.parseCSV(csvData)

  // Skip header row
  const dataRows = rows.slice(1)

  return dataRows
    .map((row, index) => {
      const [descriptionStr, categoryStr, amountStr, dateStr, statusStr] = row

      return {
        id: `expense-${index + 1}`,
        description: descriptionStr || "",
        category: categoryStr || "כללי",
        amount: sheetsClient.parseHebrewCurrency(amountStr || "0"),
        date: sheetsClient.parseHebrewDate(dateStr || ""),
        status: (statusStr?.toLowerCase() as "paid" | "pending" | "overdue") || "pending",
      }
    })
    .filter((row) => row.description && row.amount > 0)
}

export async function GET() {
  try {
    const result = await sheetsClient.fetchSheetData(MONTHLY_EXPENSES_CONFIG, parseMonthlyExpensesData, mockExpenses)

    return NextResponse.json({
      expenses: result.data,
      totalBudget: 12000, // This could also come from sheets
      isConnected: result.status === "connected",
      source: result.source,
      lastFetched: result.lastUpdated,
    })
  } catch (error) {
    console.error("Monthly expenses API error:", error)

    return NextResponse.json({
      expenses: mockExpenses,
      totalBudget: 12000,
      isConnected: false,
      source: "Mock Data (API Error)",
      lastFetched: new Date(),
    })
  }
}

export async function POST() {
  return GET()
}
