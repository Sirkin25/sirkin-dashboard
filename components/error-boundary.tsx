"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
  error?: Error
  resetError: () => void
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          errorInfo={this.state.errorInfo}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive hebrew-text">
          <AlertTriangle className="h-6 w-6" />
          שגיאה במערכת
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-destructive hebrew-text font-medium">
            אירעה שגיאה בלתי צפויה במערכת
          </p>
          <p className="text-sm text-muted-foreground hebrew-text">
            אנא נסה לרענן את הדף או פנה למנהל המערכת
          </p>
          {error && (
            <details className="text-left mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                פרטי השגיאה (למפתחים)
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>

        <div className="flex justify-center gap-2">
          <Button onClick={resetError} className="hebrew-text">
            <RefreshCw className="h-4 w-4 ml-2" />
            נסה שוב
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="hebrew-text"
          >
            <Home className="h-4 w-4 ml-2" />
            חזור לדף הבית
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Specialized error boundaries for different parts of the app
export function DashboardErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={DashboardErrorFallback}
      onError={(error, errorInfo) => {
        // Log dashboard-specific errors
        console.error('Dashboard Error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function DashboardErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive hebrew-text">
            <AlertTriangle className="h-6 w-6" />
            שגיאה בלוח הבקרה
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-destructive hebrew-text">
              לא ניתן לטעון את לוח הבקרה
            </p>
            <p className="text-sm text-muted-foreground hebrew-text">
              נסה לרענן את הדף או פנה למנהל המערכת
            </p>
          </div>

          <div className="flex justify-center gap-2">
            <Button onClick={resetError} className="hebrew-text">
              <RefreshCw className="h-4 w-4 ml-2" />
              נסה שוב
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="hebrew-text"
            >
              רענן דף
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ComponentErrorBoundary({ 
  children, 
  componentName 
}: { 
  children: React.ReactNode
  componentName: string 
}) {
  return (
    <ErrorBoundary
      fallback={(props) => <ComponentErrorFallback {...props} componentName={componentName} />}
      onError={(error, errorInfo) => {
        console.error(`${componentName} Error:`, error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function ComponentErrorFallback({ 
  error, 
  resetError, 
  componentName 
}: ErrorFallbackProps & { componentName: string }) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
          <div>
            <p className="text-destructive hebrew-text font-medium">
              שגיאה ברכיב {componentName}
            </p>
            <p className="text-sm text-muted-foreground hebrew-text mt-1">
              לא ניתן לטעון את הרכיב
            </p>
          </div>
          <Button onClick={resetError} size="sm" className="hebrew-text">
            <RefreshCw className="h-4 w-4 ml-2" />
            נסה שוב
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}