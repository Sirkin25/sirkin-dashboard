import { NextResponse } from "next/server"
import { sheetsClient } from "@/lib/sheets-client"
import { handleApiError } from "@/lib/errors"
import { HEBREW_MONTHS } from "@/lib/constants/hebrew"
import type { TenantPaymentRow, TenantPaymentsResponse, ApiResponse } from "@/lib/types/api"

const TENANT_PAYMENTS_CONFIG = {
  sheetId: process.env.GOOGLE_SHEETS_ID || "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  gid: process.env.TENANT_PAYMENTS_GID || "3",
}

interface ParsedTenantPaymentsData {
  tenantPayments: TenantPaymentRow[]
  actualMonths: string[] // The actual month names from CSV like ["Jul-25", "Aug-25"]
}

function parseTenantPaymentsData(csvData: string): ParsedTenantPaymentsData {
  const rows = sheetsClient.parseCSV(csvData)
  
  if (rows.length < 2) return { tenantPayments: [], actualMonths: [] }
  
  // First row has apartment numbers: חודש/דירה,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16
  const headerRow = rows[0]
  const apartmentNumbers = headerRow.slice(1) // Skip first column "חודש/דירה"
  
  // Remaining rows contain month data: Jul-25,TRUE,TRUE,TRUE...
  const monthRows = rows.slice(1)
  
  // Extract actual month names from the first column of each month row
  const actualMonths = monthRows.map(row => row[0] || "").filter(month => month.trim() !== "")
  

  
  // Convert to tenant payment records with month-by-month data
  const tenantPayments: TenantPaymentRow[] = []
  
  for (let i = 0; i < apartmentNumbers.length; i++) {
    const aptNum = apartmentNumbers[i]
    if (!aptNum || aptNum.trim() === '') continue
    
    const paymentRow: any = {
      apartment: `דירה ${aptNum}`
    }
    
    // Fill in payment data for each actual month
    for (let monthIndex = 0; monthIndex < actualMonths.length; monthIndex++) {
      const monthKey = `month_${monthIndex + 1}`
      
      // Find payment status for this apartment and month
      let paymentStatus = "✗" // Default to unpaid
      
      if (monthRows[monthIndex] && monthRows[monthIndex][i + 1]) {
        const cellValue = monthRows[monthIndex][i + 1].toString().trim().toLowerCase()
        if (cellValue === 'true' || cellValue === '✓' || cellValue === 'שולם') {
          paymentStatus = "✓"
        } else if (cellValue === 'false' || cellValue === '✗' || cellValue === 'לא שולם') {
          paymentStatus = "✗"
        } else if (cellValue === 'pending' || cellValue === 'ממתין') {
          paymentStatus = "⏳"
        }
      }
      
      paymentRow[monthKey] = paymentStatus
    }
    
    // Fill remaining months up to 12 with default unpaid status if we have fewer months
    for (let monthIndex = actualMonths.length; monthIndex < 12; monthIndex++) {
      const monthKey = `month_${monthIndex + 1}`
      paymentRow[monthKey] = "✗"
    }
    
    tenantPayments.push(paymentRow as TenantPaymentRow)
  }
  
  return { tenantPayments, actualMonths }
}



function calculateStatistics(data: TenantPaymentRow[], halfYear: 1 | 2): {
  totalPayments: number
  totalPossible: number
  paymentRate: number
} {
  const monthIndices = halfYear === 1 ? [1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11, 12]
  
  let totalPayments = 0
  let totalPossible = 0
  
  data.forEach(tenant => {
    monthIndices.forEach(monthIndex => {
      const monthKey = `month_${monthIndex}` as keyof TenantPaymentRow
      const paymentStatus = tenant[monthKey] as string
      totalPossible++
      if (paymentStatus === "✓") {
        totalPayments++
      }
    })
  })
  
  const paymentRate = totalPossible > 0 ? (totalPayments / totalPossible) * 100 : 0
  
  return {
    totalPayments,
    totalPossible,
    paymentRate: Math.round(paymentRate * 10) / 10 // Round to 1 decimal
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const halfYear = parseInt(searchParams.get('halfYear') || '1') as 1 | 2
    
    // Store the actual months in a variable that can be accessed after parsing
    let actualMonths: string[] = []
    
    const result = await sheetsClient.fetchSheetData(
      TENANT_PAYMENTS_CONFIG,
      (csvData: string) => {
        const parsed = parseTenantPaymentsData(csvData)
        actualMonths = parsed.actualMonths // Store the actual months
        return parsed.tenantPayments // Return only the tenant payments for the sheets client
      }
    )

    const tenantPayments = result.data
    const statistics = calculateStatistics(tenantPayments, halfYear)

    const response: ApiResponse<TenantPaymentsResponse> = {
      data: {
        data: tenantPayments,
        year,
        halfYear,
        actualMonths,
        statistics
      },
      meta: {
        isConnected: result.status === "connected",
        source: result.source as 'sheets' | 'error',
        lastFetched: result.lastUpdated.toISOString(),
        message: "נתונים נטענו מגוגל שיטס"
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Tenant payments API error:", error)
    
    const errorState = handleApiError(error as Error)
    const year = new Date().getFullYear()
    const halfYear = 1

    const response: ApiResponse<TenantPaymentsResponse> = {
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

export async function POST(request: Request) {
  return GET(request)
}
