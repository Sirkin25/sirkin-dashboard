"use client"

import { useCallback, useRef, useEffect } from 'react'

export function useRequestCancellation() {
  const abortControllerRef = useRef<AbortController | null>(null)

  const createCancellableRequest = useCallback(<T>(
    requestFn: (signal: AbortSignal) => Promise<T>
  ): Promise<T> => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    const controller = new AbortController()
    abortControllerRef.current = controller

    return requestFn(controller.signal)
  }, [])

  const cancelCurrentRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const isRequestActive = useCallback(() => {
    return abortControllerRef.current !== null
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    createCancellableRequest,
    cancelCurrentRequest,
    isRequestActive
  }
}

// Enhanced fetch function with cancellation support
export function useCancellableFetch() {
  const { createCancellableRequest } = useRequestCancellation()

  const cancellableFetch = useCallback(
    (url: string, options: RequestInit = {}) => {
      return createCancellableRequest(async (signal) => {
        const response = await fetch(url, {
          ...options,
          signal
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return response.json()
      })
    },
    [createCancellableRequest]
  )

  return { cancellableFetch }
}