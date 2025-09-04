import { NextResponse } from "next/server"

export async function GET() {
  try {
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY
    
    if (!privateKey) {
      return NextResponse.json({ error: "No private key found" })
    }
    
    console.log("Raw private key length:", privateKey.length)
    console.log("Raw private key first 100 chars:", privateKey.substring(0, 100))
    console.log("Raw private key last 100 chars:", privateKey.substring(-100))
    
    // Process the key
    const processedKey = privateKey.replace(/\\n/g, '\n')
    console.log("Processed key length:", processedKey.length)
    console.log("Processed key lines:", processedKey.split('\n').length)
    console.log("Processed key first line:", processedKey.split('\n')[0])
    console.log("Processed key last line:", processedKey.split('\n').slice(-1)[0])
    
    // Check if it looks like a valid private key
    const isValidFormat = processedKey.includes('-----BEGIN PRIVATE KEY-----') && 
                         processedKey.includes('-----END PRIVATE KEY-----')
    
    return NextResponse.json({
      rawLength: privateKey.length,
      processedLength: processedKey.length,
      lines: processedKey.split('\n').length,
      isValidFormat,
      firstLine: processedKey.split('\n')[0],
      lastLine: processedKey.split('\n').slice(-1)[0],
      hasNewlines: processedKey.includes('\n'),
      hasBackslashN: privateKey.includes('\\n')
    })
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}