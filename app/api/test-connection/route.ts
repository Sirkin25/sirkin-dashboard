import { NextResponse } from "next/server"
import { env } from "@/lib/env"

export async function GET() {
  try {
    console.log("=== Testing Google Sheets Connection ===")
    console.log("Environment variables:")
    console.log("- GOOGLE_SHEETS_SPREADSHEET_ID:", process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? "✓ Set" : "✗ Missing")
    console.log("- GOOGLE_SHEETS_CLIENT_EMAIL:", process.env.GOOGLE_SHEETS_CLIENT_EMAIL ? "✓ Set" : "✗ Missing")
    console.log("- GOOGLE_SHEETS_PRIVATE_KEY:", process.env.GOOGLE_SHEETS_PRIVATE_KEY ? `✓ Set (${process.env.GOOGLE_SHEETS_PRIVATE_KEY.length} chars)` : "✗ Missing")
    console.log("- EXPECTED_EXPENSES_GID:", process.env.EXPECTED_EXPENSES_GID || "✗ Missing")

    // Test Google Sheets API connection
    const { GoogleAuth } = await import('google-auth-library')
    const { google } = await import('googleapis')
    
    console.log("Initializing Google Auth...")
    const auth = new GoogleAuth({
      credentials: {
        client_email: env.googleSheets.clientEmail,
        private_key: env.googleSheets.privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    console.log("Creating Sheets client...")
    const sheets = google.sheets({ version: 'v4', auth })
    
    console.log("Fetching spreadsheet metadata...")
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: env.googleSheets.spreadsheetId,
    })

    console.log("Spreadsheet found:", spreadsheet.data.properties?.title)
    console.log("Available sheets:")
    spreadsheet.data.sheets?.forEach(sheet => {
      console.log(`- ${sheet.properties?.title} (ID: ${sheet.properties?.sheetId})`)
    })

    // Try to fetch some actual data from the expected expenses sheet
    console.log("Fetching data from Expected Expenses sheet...")
    const gid = env.googleSheets.gids.expectedExpenses
    console.log("Using GID:", gid)

    // Find the sheet by GID
    const targetSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.sheetId?.toString() === gid
    )

    if (!targetSheet) {
      throw new Error(`Sheet with GID ${gid} not found`)
    }

    console.log("Target sheet found:", targetSheet.properties?.title)

    const range = `${targetSheet.properties?.title}!A:F`
    console.log("Fetching range:", range)

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: env.googleSheets.spreadsheetId,
      range,
    })

    const values = response.data.values || []
    console.log("Raw data fetched:")
    console.log("Rows:", values.length)
    values.slice(0, 5).forEach((row, index) => {
      console.log(`Row ${index}:`, row)
    })

    return NextResponse.json({
      success: true,
      spreadsheetTitle: spreadsheet.data.properties?.title,
      sheetCount: spreadsheet.data.sheets?.length || 0,
      targetSheet: targetSheet.properties?.title,
      dataRows: values.length,
      sampleData: values.slice(0, 3),
      environment: {
        spreadsheetId: env.googleSheets.spreadsheetId,
        clientEmail: env.googleSheets.clientEmail,
        hasPrivateKey: !!env.googleSheets.privateKey,
        gid: gid,
      }
    })

  } catch (error) {
    console.error("Connection test failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}