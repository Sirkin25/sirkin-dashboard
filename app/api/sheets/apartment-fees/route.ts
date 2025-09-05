import { NextResponse } from "next/server"
import { sheetsClient } from "@/lib/sheets-client"
import { mockApartmentFees } from "@/lib/mock-data"

const APARTMENT_FEES_CONFIG = {
  sheetId: process.env.GOOGLE_SHEETS_ID || "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  gid: process.env.APARTMENT_FEES_GID || "4",
}

interface ApartmentFeeRow {
  apartmentNumber: number
  ownerName: string
  apartmentSize: number
  baseFee: number
  maintenanceFee: number
  elevatorFee: number
  cleaningFee: number
  insuranceFee: number
  totalMonthlyFee: number
  specialAssessments: number
  feeType: "owner" | "renter"
}

function parseApartmentFeesData(csvData: string): ApartmentFeeRow[] {
  const rows = sheetsClient.parseCSV(csvData)

  // Skip header row and summary row at the end
  const dataRows = rows.slice(1).filter(row => {
    const firstCol = row[0]
    return firstCol && !firstCol.includes('סה״כ') && !firstCol.includes('תקציב') && !firstCol.includes('ממוצע')
  })

  return dataRows
    .map((row) => {
      // Your sheet format: מספר דירה,תת חלקה,מ״ר בטאבו,סכום לחודש
      const [aptNumStr, subParcelStr, sizeStr, monthlyFeeStr] = row

      const aptNum = Number.parseInt(aptNumStr || "0")
      const size = Number.parseFloat(sizeStr || "0")
      const monthlyFee = sheetsClient.parseHebrewCurrency(monthlyFeeStr || "0")

      // Skip invalid rows
      if (aptNum <= 0 || monthlyFee <= 0) {
        return null
      }

      return {
        apartmentNumber: aptNum,
        ownerName: `בעל דירה ${aptNum}`, // "Apartment Owner X"
        apartmentSize: size,
        baseFee: monthlyFee * 0.6, // Estimate breakdown
        maintenanceFee: monthlyFee * 0.2,
        elevatorFee: monthlyFee * 0.1,
        cleaningFee: monthlyFee * 0.05,
        insuranceFee: monthlyFee * 0.05,
        totalMonthlyFee: monthlyFee,
        specialAssessments: 0,
        feeType: "owner" as const,
      }
    })
    .filter((row) => row !== null)
}

export async function GET() {
  try {
    const result = await sheetsClient.fetchSheetData(APARTMENT_FEES_CONFIG, parseApartmentFeesData, mockApartmentFees)

    const totalRevenue = result.data.reduce((sum, fee) => sum + fee.totalMonthlyFee, 0)
    const averageFee = result.data.length > 0 ? totalRevenue / result.data.length : 0

    const response = {
      data: {
        apartments: result.data,
        totalRevenue,
        averageFee
      },
      meta: {
        isConnected: result.status === "connected",
        source: result.source as 'sheets' | 'mock' | 'error',
        lastFetched: result.lastUpdated.toISOString(),
        message: result.status === "connected" ? "נתונים נטענו מגוגל שיטס" : "נתוני דוגמה"
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Apartment fees API error:", error)

    const totalRevenue = mockApartmentFees.reduce((sum, fee) => sum + fee.totalMonthlyFee, 0)
    const averageFee = mockApartmentFees.length > 0 ? totalRevenue / mockApartmentFees.length : 0

    const response = {
      data: {
        apartments: mockApartmentFees,
        totalRevenue,
        averageFee
      },
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
