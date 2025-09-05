import { NextResponse } from "next/server"
import { sheetsClient } from "@/lib/sheets-client"
import { mockExpenses } from "@/lib/mock-data"

const MONTHLY_EXPENSES_CONFIG = {
  sheetId: process.env.GOOGLE_SHEETS_ID || "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
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
      // Your sheet format: תאריך,קטוגריה,סכום (Date, Category, Amount)
      const [dateStr, categoryStr, amountStr] = row

      // Skip empty rows
      if (!categoryStr || !amountStr) {
        return null
      }

      return {
        id: `expense-${index + 1}`,
        description: categoryStr || "", // Using category as description
        category: categoryStr || "כללי",
        amount: sheetsClient.parseHebrewCurrency(amountStr || "0"),
        date: sheetsClient.parseHebrewDate(dateStr || ""),
        status: "paid" as const, // Default to paid since these are recorded expenses
      }
    })
    .filter((row) => row !== null && row.description && row.amount > 0)
}

export async function GET() {
  try {
    const result = await sheetsClient.fetchSheetData(MONTHLY_EXPENSES_CONFIG, parseMonthlyExpensesData, mockExpenses)

    const response = {
      data: result.data,
      meta: {
        isConnected: result.status === "connected",
        source: result.source as 'sheets' | 'mock' | 'error',
        lastFetched: result.lastUpdated.toISOString(),
        message: result.status === "connected" ? "נתונים נטענו מגוגל שיטס" : "נתוני דוגמה"
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Monthly expenses API error:", error)

    const response = {
      data: mockExpenses,
      meta: {
        isConnected: false,
        source: "mock" as const,
        lastFetched: new Date().toISOString(),
        message: "נתוני דוגמה - שגיאה בחיבור"
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
