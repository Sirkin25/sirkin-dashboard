import { NextResponse } from "next/server"
import { env, validateEnv } from "@/lib/env"

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      hasPrivateKey: !!process.env.GOOGLE_SHEETS_PRIVATE_KEY,
      privateKeyLength: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.length || 0,
      privateKeyStartsCorrectly: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.startsWith('-----BEGIN PRIVATE KEY-----'),
      privateKeyEndsCorrectly: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.endsWith('-----END PRIVATE KEY-----'),
      hasClientEmail: !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      hasSpreadsheetId: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      gids: {
        apartmentFees: process.env.APARTMENT_FEES_GID,
        tenantPayments: process.env.TENANT_PAYMENTS_GID,
        expectedExpenses: process.env.EXPECTED_EXPENSES_GID,
        monthlyExpenses: process.env.MONTHLY_EXPENSES_GID,
        accountStatus: process.env.ACCOUNT_STATUS_GID,
      }
    }

    // Test environment validation
    let validationError = null
    try {
      validateEnv()
    } catch (error) {
      validationError = error instanceof Error ? error.message : 'Unknown validation error'
    }

    // Test Google Sheets API connection
    let connectionTest = null
    try {
      const { GoogleAuth } = await import('google-auth-library')
      const { google } = await import('googleapis')
      
      const auth = new GoogleAuth({
        credentials: {
          client_email: env.googleSheets.clientEmail,
          private_key: env.googleSheets.privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      })

      const sheets = google.sheets({ version: 'v4', auth })
      
      // Try to get spreadsheet metadata
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: env.googleSheets.spreadsheetId,
      })

      connectionTest = {
        success: true,
        spreadsheetTitle: spreadsheet.data.properties?.title,
        sheetCount: spreadsheet.data.sheets?.length || 0,
        sheets: spreadsheet.data.sheets?.map(sheet => ({
          title: sheet.properties?.title,
          sheetId: sheet.properties?.sheetId,
          gridProperties: sheet.properties?.gridProperties,
        })) || []
      }
    } catch (error) {
      connectionTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      validation: {
        passed: !validationError,
        error: validationError
      },
      connection: connectionTest,
      recommendations: getRecommendations(envCheck, validationError, connectionTest)
    })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

function getRecommendations(envCheck: any, validationError: string | null, connectionTest: any): string[] {
  const recommendations: string[] = []

  if (!envCheck.hasPrivateKey) {
    recommendations.push("Missing GOOGLE_SHEETS_PRIVATE_KEY environment variable")
  } else if (!envCheck.privateKeyStartsCorrectly || !envCheck.privateKeyEndsCorrectly) {
    recommendations.push("GOOGLE_SHEETS_PRIVATE_KEY format is incorrect - should start with '-----BEGIN PRIVATE KEY-----' and end with '-----END PRIVATE KEY-----'")
  }

  if (!envCheck.hasClientEmail) {
    recommendations.push("Missing GOOGLE_SHEETS_CLIENT_EMAIL environment variable")
  }

  if (!envCheck.hasSpreadsheetId) {
    recommendations.push("Missing GOOGLE_SHEETS_SPREADSHEET_ID environment variable")
  }

  if (validationError) {
    recommendations.push(`Environment validation failed: ${validationError}`)
  }

  if (connectionTest && !connectionTest.success) {
    recommendations.push(`Google Sheets API connection failed: ${connectionTest.error}`)
    
    if (connectionTest.error?.includes('permission')) {
      recommendations.push("Check that your service account has access to the spreadsheet")
    }
    
    if (connectionTest.error?.includes('not found')) {
      recommendations.push("Check that the spreadsheet ID is correct and the sheet exists")
    }
  }

  if (recommendations.length === 0) {
    recommendations.push("All checks passed! Your Google Sheets integration should be working.")
  }

  return recommendations
}