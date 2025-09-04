// Google Sheets integration client with CSV parsing and Hebrew text support

import { GoogleAuth } from "google-auth-library"
import { type sheets_v4, google } from "googleapis"

interface SheetConfig {
  sheetId: string
  gid: string // Sheet tab ID
  range?: string
}

interface SheetResponse<T> {
  data: T[]
  status: "connected" | "mock" | "error"
  lastUpdated: Date
  source: string
}

class SheetsClient {
  private baseUrl = "https://docs.google.com/spreadsheets/d"
  private sheetsAPI: sheets_v4.Sheets | null = null
  private auth: GoogleAuth | null = null

  constructor() {
    this.initializeAuth()
  }

  /**
   * Initialize Google Sheets API authentication
   */
  private async initializeAuth() {
    try {
      if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        this.auth = new GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          },
          scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        })

        this.sheetsAPI = google.sheets({ version: "v4", auth: this.auth })
      }
    } catch (error) {
      console.warn("Failed to initialize Google Sheets API:", error)
    }
  }

  /**
   * Fetch data from Google Sheets via API or CSV fallback
   */
  async fetchSheetData<T>(
    config: SheetConfig,
    parser: (csvData: string) => T[],
    mockData: T[],
  ): Promise<SheetResponse<T>> {
    try {
      if (this.sheetsAPI) {
        try {
          const apiData = await this.fetchViaAPI(config)
          if (apiData) {
            const parsedData = parser(apiData)
            return {
              data: parsedData,
              status: "connected",
              lastUpdated: new Date(),
              source: "Google Sheets API",
            }
          }
        } catch (error) {
          console.warn("Google Sheets API failed, falling back to CSV:", error)
        }
      }

      // Fallback to CSV methods
      const methods = [
        () => this.fetchViaCsvExport(config),
        () => this.fetchViaPublicUrl(config),
        () => this.fetchViaAlternativeUrl(config),
      ]

      for (const method of methods) {
        try {
          const csvData = await method()
          if (csvData) {
            const parsedData = parser(csvData)
            return {
              data: parsedData,
              status: "connected",
              lastUpdated: new Date(),
              source: "Google Sheets CSV",
            }
          }
        } catch (error) {
          console.warn("Sheet fetch method failed:", error)
          continue
        }
      }

      // If all methods fail, return mock data
      return {
        data: mockData,
        status: "mock",
        lastUpdated: new Date(),
        source: "Mock Data",
      }
    } catch (error) {
      console.error("Sheets client error:", error)
      return {
        data: mockData,
        status: "error",
        lastUpdated: new Date(),
        source: "Mock Data (Error)",
      }
    }
  }

  /**
   * Fetch data via Google Sheets API
   */
  private async fetchViaAPI(config: SheetConfig): Promise<string> {
    if (!this.sheetsAPI) {
      throw new Error("Google Sheets API not initialized")
    }

    const spreadsheet = await this.sheetsAPI.spreadsheets.get({
      spreadsheetId: config.sheetId,
    })

    const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.sheetId?.toString() === config.gid)

    if (!sheet?.properties?.title) {
      throw new Error(`Sheet with GID ${config.gid} not found`)
    }

    const range = config.range || `${sheet.properties.title}!A:Z`

    const response = await this.sheetsAPI.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range,
    })

    const values = response.data.values || []
    return values
      .map((row) =>
        row
          .map((cell) => {
            const cellStr = String(cell || "")
            // Escape quotes and wrap in quotes if contains comma
            if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
              return `"${cellStr.replace(/"/g, '""')}"`
            }
            return cellStr
          })
          .join(","),
      )
      .join("\n")
  }

  /**
   * Primary method: CSV export
   */
  private async fetchViaCsvExport(config: SheetConfig): Promise<string> {
    const url = `${this.baseUrl}/${config.sheetId}/export?format=csv&gid=${config.gid}`
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BuildingManagement/1.0)",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.text()
  }

  /**
   * Fallback method: Public URL
   */
  private async fetchViaPublicUrl(config: SheetConfig): Promise<string> {
    const url = `${this.baseUrl}/${config.sheetId}/pub?gid=${config.gid}&single=true&output=csv`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.text()
  }

  /**
   * Alternative method: Different export format
   */
  private async fetchViaAlternativeUrl(config: SheetConfig): Promise<string> {
    const url = `${this.baseUrl}/${config.sheetId}/gviz/tq?tqx=out:csv&gid=${config.gid}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.text()
  }

  /**
   * Parse CSV with Hebrew text support
   */
  parseCSV(csvText: string): string[][] {
    const lines = csvText.split("\n").filter((line) => line.trim())
    const result: string[][] = []

    for (const line of lines) {
      const row: string[] = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          row.push(this.cleanCellValue(current))
          current = ""
        } else {
          current += char
        }
      }

      row.push(this.cleanCellValue(current))
      result.push(row)
    }

    return result
  }

  /**
   * Clean and normalize cell values for Hebrew text
   */
  private cleanCellValue(value: string): string {
    return value.trim().replace(/^"/, "").replace(/"$/, "").replace(/""/g, '"').normalize("NFC") // Normalize Hebrew characters
  }

  /**
   * Convert Hebrew date strings to Date objects
   */
  parseHebrewDate(dateStr: string): Date {
    // Handle empty or invalid input
    if (!dateStr || typeof dateStr !== "string" || dateStr.trim() === "") {
      return new Date()
    }

    const cleanDateStr = dateStr.trim()

    // Handle various Hebrew date formats
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
    ]

    for (const format of formats) {
      const match = cleanDateStr.match(format)
      if (match) {
        const [, first, second, third] = match
        let year: number, month: number, day: number

        // Assume DD/MM/YYYY or DD-MM-YYYY format for Hebrew
        if (format === formats[0] || format === formats[1]) {
          day = Number.parseInt(first)
          month = Number.parseInt(second) - 1 // Month is 0-indexed
          year = Number.parseInt(third)
        } else {
          // YYYY-MM-DD format
          year = Number.parseInt(first)
          month = Number.parseInt(second) - 1 // Month is 0-indexed
          day = Number.parseInt(third)
        }

        // Validate the parsed values
        if (year >= 1900 && year <= 2100 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
          const date = new Date(year, month, day)
          // Double-check that the date is valid
          if (!isNaN(date.getTime())) {
            return date
          }
        }
      }
    }

    // Try parsing as ISO string or other standard formats
    try {
      const date = new Date(cleanDateStr)
      if (!isNaN(date.getTime())) {
        return date
      }
    } catch (error) {
      // Ignore parsing errors
    }

    // Fallback to current date if all parsing fails
    return new Date()
  }

  /**
   * Parse Hebrew currency values
   */
  parseHebrewCurrency(currencyStr: string): number {
    // Remove Hebrew currency symbols and formatting
    const cleaned = currencyStr.replace(/[₪,\s]/g, "").replace(/[^\d.-]/g, "")

    const parsed = Number.parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }
}

export const sheetsClient = new SheetsClient()
export type { SheetResponse, SheetConfig }
