"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface DebugResult {
  timestamp: string
  environment: {
    hasPrivateKey: boolean
    privateKeyLength: number
    privateKeyStartsCorrectly: boolean
    privateKeyEndsCorrectly: boolean
    hasClientEmail: boolean
    clientEmail: string
    hasSpreadsheetId: boolean
    spreadsheetId: string
    gids: Record<string, string>
  }
  validation: {
    passed: boolean
    error: string | null
  }
  connection: {
    success: boolean
    spreadsheetTitle?: string
    sheetCount?: number
    sheets?: Array<{
      title: string
      sheetId: number
      gridProperties: any
    }>
    error?: string
  } | null
  recommendations: string[]
}

export default function DebugPage() {
  const [result, setResult] = useState<DebugResult | null>(null)
  const [loading, setLoading] = useState(false)

  const runDebug = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/sheets')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Debug failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Google Sheets Debug</h1>
        <Button onClick={runDebug} disabled={loading}>
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Run Debug Test
        </Button>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(result.environment.hasPrivateKey && result.environment.hasClientEmail && result.environment.hasSpreadsheetId)}
                Environment Variables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.environment.hasPrivateKey)}
                  <span>Private Key Present</span>
                  <Badge variant={result.environment.hasPrivateKey ? "default" : "destructive"}>
                    {result.environment.privateKeyLength} chars
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.environment.privateKeyStartsCorrectly && result.environment.privateKeyEndsCorrectly)}
                  <span>Private Key Format</span>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(result.environment.hasClientEmail)}
                  <span>Client Email</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {result.environment.clientEmail || 'Missing'}
                  </code>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(result.environment.hasSpreadsheetId)}
                  <span>Spreadsheet ID</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {result.environment.spreadsheetId || 'Missing'}
                  </code>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Sheet GIDs:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(result.environment.gids).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key}:</span>
                      <code className="bg-muted px-1 rounded">{value || 'Missing'}</code>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(result.validation.passed)}
                Environment Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.validation.passed ? (
                <div className="text-green-600">All required environment variables are present</div>
              ) : (
                <div className="text-red-600">{result.validation.error}</div>
              )}
            </CardContent>
          </Card>

          {/* Connection Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.connection ? getStatusIcon(result.connection.success) : <AlertCircle className="h-5 w-5 text-yellow-500" />}
                Google Sheets Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.connection ? (
                result.connection.success ? (
                  <div className="space-y-2">
                    <div className="text-green-600">✅ Successfully connected to Google Sheets!</div>
                    <div><strong>Spreadsheet:</strong> {result.connection.spreadsheetTitle}</div>
                    <div><strong>Sheet Count:</strong> {result.connection.sheetCount}</div>
                    
                    {result.connection.sheets && (
                      <div>
                        <h4 className="font-medium mt-4 mb-2">Available Sheets:</h4>
                        <div className="space-y-1">
                          {result.connection.sheets.map((sheet, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Badge variant="outline">{sheet.sheetId}</Badge>
                              <span>{sheet.title}</span>
                              <span className="text-muted-foreground">
                                ({sheet.gridProperties?.rowCount || 0} rows × {sheet.gridProperties?.columnCount || 0} cols)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600">❌ Connection failed: {result.connection.error}</div>
                )
              ) : (
                <div className="text-yellow-600">⚠️ Connection test not run</div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground">
            Last run: {new Date(result.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}
