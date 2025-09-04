import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("=== Simple Environment Test ===")
    
    // Check environment variables
    const envVars = {
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      privateKeyLength: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.length || 0,
      privateKeyStart: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.substring(0, 50),
      privateKeyEnd: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.substring(-50),
    }
    
    console.log("Environment variables:", envVars)
    
    // Check if private key has proper format
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY
    if (!privateKey) {
      throw new Error("GOOGLE_SHEETS_PRIVATE_KEY is missing")
    }
    
    if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      throw new Error("Private key doesn't start with proper header")
    }
    
    if (!privateKey.includes("-----END PRIVATE KEY-----")) {
      throw new Error("Private key doesn't end with proper footer")
    }
    
    // Process the private key
    const processedKey = privateKey.replace(/\\n/g, '\n')
    console.log("Processed key length:", processedKey.length)
    console.log("Processed key lines:", processedKey.split('\n').length)
    
    // Try to create a simple JWT to test the key
    const { GoogleAuth } = await import('google-auth-library')
    
    console.log("Creating GoogleAuth instance...")
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: processedKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })
    
    console.log("Getting access token...")
    const client = await auth.getClient()
    const accessToken = await client.getAccessToken()
    
    console.log("Access token obtained successfully!")
    
    return NextResponse.json({
      success: true,
      message: "Authentication successful!",
      hasAccessToken: !!accessToken.token,
      environment: {
        spreadsheetId: !!envVars.spreadsheetId,
        clientEmail: !!envVars.clientEmail,
        privateKeyLength: envVars.privateKeyLength,
      }
    })
    
  } catch (error) {
    console.error("Simple test failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}