import { GoogleAuth } from 'google-auth-library'
import { sheets_v4, google } from 'googleapis'
import { env } from './env'

// Initialize Google Sheets API
export async function getGoogleSheetsClient(): Promise<sheets_v4.Sheets> {
  const auth = new GoogleAuth({
    credentials: {
      client_email: env.googleSheets.clientEmail,
      private_key: env.googleSheets.privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })
  return sheets
}

// Helper to get data from a specific sheet by GID
export async function getSheetData(gid: string, range?: string) {
  const sheets = await getGoogleSheetsClient()
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: env.googleSheets.spreadsheetId,
      range: range || `'${gid}'!A:Z`, // Default to all columns if no range specified
    })
    
    return response.data.values || []
  } catch (error) {
    console.error(`Error fetching data from sheet GID ${gid}:`, error)
    throw error
  }
}

// Helper functions for each sheet
export const sheetsAPI = {
  // דמי דירה (Apartment Fees)
  async getApartmentFees() {
    return getSheetData(env.googleSheets.gids.apartmentFees!)
  },

  // תשלומי דיירים (Tenant Payments)  
  async getTenantPayments() {
    return getSheetData(env.googleSheets.gids.tenantPayments!)
  },

  // הוצאות צפויות (Expected Expenses)
  async getExpectedExpenses() {
    return getSheetData(env.googleSheets.gids.expectedExpenses!)
  },

  // הוצאות חודשיות (Monthly Expenses)
  async getMonthlyExpenses() {
    return getSheetData(env.googleSheets.gids.monthlyExpenses!)
  },

  // מצב חשבון (Account Status)
  async getAccountStatus() {
    return getSheetData(env.googleSheets.gids.accountStatus!)
  },

  // Update data in a specific sheet
  async updateSheetData(gid: string, range: string, values: any[][]) {
    const sheets = await getGoogleSheetsClient()
    
    try {
      const response = await sheets.spreadsheets.values.update({
        spreadsheetId: env.googleSheets.spreadsheetId,
        range: `'${gid}'!${range}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      })
      
      return response.data
    } catch (error) {
      console.error(`Error updating sheet GID ${gid}:`, error)
      throw error
    }
  },

  // Append data to a specific sheet
  async appendSheetData(gid: string, values: any[][]) {
    const sheets = await getGoogleSheetsClient()
    
    try {
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: env.googleSheets.spreadsheetId,
        range: `'${gid}'!A:Z`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      })
      
      return response.data
    } catch (error) {
      console.error(`Error appending to sheet GID ${gid}:`, error)
      throw error
    }
  },
}
