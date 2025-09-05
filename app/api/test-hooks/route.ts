import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test all the API endpoints that the hooks use
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    const endpoints = [
      'account-status',
      'monthly-expenses', 
      'expected-expenses',
      'tenant-payments',
      'apartment-fees'
    ]
    
    const results: Record<string, any> = {}
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}/api/sheets/${endpoint}`)
        const data = await response.json()
        results[endpoint] = {
          success: response.ok,
          isConnected: data.isConnected,
          source: data.source,
          dataLength: Array.isArray(data.expenses) ? data.expenses.length : 
                     Array.isArray(data.payments) ? data.payments.length :
                     Array.isArray(data.fees) ? data.fees.length : 
                     data.balance !== undefined ? 1 : 0,
          sampleData: Array.isArray(data.expenses) ? data.expenses[0] : 
                     Array.isArray(data.payments) ? data.payments[0] :
                     Array.isArray(data.fees) ? data.fees[0] : 
                     data
        }
      } catch (error) {
        results[endpoint] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      results
    })
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}