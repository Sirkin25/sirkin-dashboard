// Environment configuration helper
// This file helps manage environment variables with type safety

export const env = {
  // Google Sheets Configuration
  googleSheets: {
    privateKey: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    gids: {
      apartmentFees: process.env.APARTMENT_FEES_GID,
      tenantPayments: process.env.TENANT_PAYMENTS_GID,
      expectedExpenses: process.env.EXPECTED_EXPENSES_GID,
      monthlyExpenses: process.env.MONTHLY_EXPENSES_GID,
      accountStatus: process.env.ACCOUNT_STATUS_GID,
    },
  },
  
  // Next.js Configuration
  nextAuth: {
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    secret: process.env.NEXTAUTH_SECRET,
  },
  
  // Public Configuration (available in browser)
  public: {
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'ועד הבית - ניהול בניין',
    appDescription: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'מערכת ניהול בניין מתקדמת לועדי בתים',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableDarkMode: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE === 'true',
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
    vercelAnalyticsId: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
  },
  
  // Development settings
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}

// Validation helper
export function validateEnv() {
  const required = [
    'GOOGLE_SHEETS_PRIVATE_KEY',
    'GOOGLE_SHEETS_CLIENT_EMAIL', 
    'GOOGLE_SHEETS_SPREADSHEET_ID',
    'APARTMENT_FEES_GID',
    'TENANT_PAYMENTS_GID',
    'EXPECTED_EXPENSES_GID',
    'MONTHLY_EXPENSES_GID',
    'ACCOUNT_STATUS_GID'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}