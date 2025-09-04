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

  // Skip header row
  const dataRows = rows.slice(1)

  return dataRows
    .map((row) => {
      const [
        aptNumStr,
        ownerStr,
        sizeStr,
        baseStr,
        maintenanceStr,
        elevatorStr,
        cleaningStr,
        insuranceStr,
        totalStr,
        specialStr,
        typeStr,
      ] = row

      return {
        apartmentNumber: Number.parseInt(aptNumStr || "0"),
        ownerName: ownerStr || "",
        apartmentSize: Number.parseFloat(sizeStr || "0"),
        baseFee: sheetsClient.parseHebrewCurrency(baseStr || "0"),
        maintenanceFee: sheetsClient.parseHebrewCurrency(maintenanceStr || "0"),
        elevatorFee: sheetsClient.parseHebrewCurrency(elevatorStr || "0"),
        cleaningFee: sheetsClient.parseHebrewCurrency(cleaningStr || "0"),
        insuranceFee: sheetsClient.parseHebrewCurrency(insuranceStr || "0"),
        totalMonthlyFee: sheetsClient.parseHebrewCurrency(totalStr || "0"),
        specialAssessments: sheetsClient.parseHebrewCurrency(specialStr || "0"),
        feeType: typeStr?.toLowerCase() === "renter" || typeStr === "שוכר" ? "renter" : "owner",
      }
    })
    .filter((row) => row.apartmentNumber > 0 && row.ownerName)
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
