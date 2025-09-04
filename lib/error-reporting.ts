// Error reporting and logging utilities

import React from 'react'

interface ErrorReport {
  error: Error
  errorInfo?: React.ErrorInfo
  timestamp: Date
  userAgent: string
  url: string
  userId?: string
  context?: Record<string, any>
}

class ErrorReporter {
  private reports: ErrorReport[] = []
  private maxReports = 100

  report(error: Error, errorInfo?: React.ErrorInfo, context?: Record<string, any>) {
    const report: ErrorReport = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as Error,
      errorInfo,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      context,
    }

    this.reports.unshift(report)
    
    // Keep only the most recent reports
    if (this.reports.length > this.maxReports) {
      this.reports = this.reports.slice(0, this.maxReports)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Report')
      console.error('Error:', error)
      if (errorInfo) {
        console.error('Error Info:', errorInfo)
      }
      if (context) {
        console.error('Context:', context)
      }
      console.groupEnd()
    }

    // In production, you might want to send to an error tracking service
    // this.sendToErrorService(report)
  }

  getReports(): ErrorReport[] {
    return [...this.reports]
  }

  clearReports() {
    this.reports = []
  }

  private async sendToErrorService(report: ErrorReport) {
    // Implement error service integration here
    // Examples: Sentry, LogRocket, Bugsnag, etc.
    try {
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report)
      // })
    } catch (sendError) {
      console.error('Failed to send error report:', sendError)
    }
  }
}

export const errorReporter = new ErrorReporter()

// Global error handlers
export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorReporter.report(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      undefined,
      { type: 'unhandledrejection', reason: event.reason }
    )
  })

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    errorReporter.report(
      event.error || new Error(event.message),
      undefined,
      { 
        type: 'javascript',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    )
  })
}

// Helper function to wrap async functions with error handling
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      errorReporter.report(
        error as Error,
        undefined,
        { context, functionName: fn.name, args }
      )
      throw error
    }
  }) as T
}

// Helper function to create error boundary wrapper info
export function createErrorBoundaryWrapper(componentName?: string) {
  return {
    componentName: componentName || 'Unknown Component',
    shouldWrap: true,
  }
}

// Type for error boundary wrapper configuration
export interface ErrorBoundaryWrapperConfig {
  componentName: string
  shouldWrap: boolean
}