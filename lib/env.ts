// Environment variables configuration

export const env = {
  googleSheets: {
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    spreadsheetId: process.env.GOOGLE_SHEETS_ID || '',
    gids: {
      apartmentFees: process.env.APARTMENT_FEES_GID || '0',
      tenantPayments: process.env.TENANT_PAYMENTS_GID || '1',
      expectedExpenses: process.env.EXPECTED_EXPENSES_GID || '2',
      monthlyExpenses: process.env.MONTHLY_EXPENSES_GID || '3',
      accountStatus: process.env.ACCOUNT_STATUS_GID || '4',
    }
  },
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}