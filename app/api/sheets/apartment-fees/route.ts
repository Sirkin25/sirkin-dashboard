import { NextResponse } from "next/server"
import { sheetsClient } from "@/lib/sheets-client"
import { mockApartmentFees } from "@/lib/mock-data"

const APARTMENT_FEES_CONFIG = {
  sheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
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

    const buildingTotalArea = result.data.reduce((sum, fee) => sum + fee.apartmentSize, 0)

    return NextResponse.json({
      fees: result.data,
      buildingTotalArea,
      isConnected: result.status === "connected",
      source: result.source,
      lastFetched: result.lastUpdated,
    })
  } catch (error) {
    console.error("Apartment fees API error:", error)

    const buildingTotalArea = mockApartmentFees.reduce((sum, fee) => sum + fee.apartmentSize, 0)

    return NextResponse.json({
      fees: mockApartmentFees,
      buildingTotalArea,
      isConnected: false,
      source: "Mock Data (API Error)",
      lastFetched: new Date(),
    })
  }
}

export async function POST() {
  return GET()
}
