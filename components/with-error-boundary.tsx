"use client"

import React from 'react'
import { ComponentErrorBoundary } from '@/components/error-boundary'

// Higher-order component to wrap components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const WrappedComponent: React.ComponentType<P> = (props: P) => {
    return (
      <ComponentErrorBoundary componentName={componentName || Component.name}>
        <Component {...props} />
      </ComponentErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withErrorBoundary(${componentName || Component.name})`
  return WrappedComponent
}

// Hook to use error boundary context
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return {
    captureError,
    resetError,
  }
}