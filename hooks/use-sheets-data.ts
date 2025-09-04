"use client"

import { useState, useEffect, useCallback } from "react"
import { handleApiError, classifyError } from "@/lib/errors"
import type { ErrorState, LoadingState, ApiResponse } from "@/lib/types/api"

interface UseSheetDataOptions {
  refreshInterval?: number // in milliseconds
  autoRefresh?: boolean
  retryAttempts?: number
  retryDelay?: number
}

interface UseDataHookResult<T> {
  data: T | null
  loading: boolean
  error: ErrorState | null
  isConnected: boolean
  source: string
  lastFetched: Date | null
  loadingState: LoadingState
  refresh: () => Promise<void>
  clearError: () => void
}

export function useSheetData<T>(
  endpoint: string,
  options: UseSheetDataOptions = {},
): UseDataHookResult<T> {
  const { 
    refreshInterval = 300000, 
    autoRefresh = false,
    retryAttempts = 3,
    retryDelay = 2000
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ErrorState | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [source, setSource] = useState("")
  const [lastFetched, setLastFetched] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true)
      } else {
        setIsRefreshing(true)
      }
      setError(null)

      const response = await fetch(`/api/sheets/${endpoint}?t=${Date.now()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      })

      const result: ApiResponse<T> = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      setData(result.data)
      setIsConnected(result.meta.isConnected)
      setSource(result.meta.source)
      setLastFetched(new Date(result.meta.lastFetched))
      setError(null)
    } catch (fetchError) {
      console.error(`Error fetching ${endpoint}:`, fetchError)
      
      const errorState = handleApiError(
        fetchError as Error,
        () => fetchData(true)
      )
      
      setError(errorState)
      setIsConnected(false)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [endpoint])

  const refresh = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Retry logic with exponential backoff
  const retryWithBackoff = useCallback(async (attempt: number = 1) => {
    if (attempt > retryAttempts) {
      return
    }

    const delay = retryDelay * Math.pow(2, attempt - 1)
    await new Promise(resolve => setTimeout(resolve, delay))
    
    try {
      await fetchData(true)
    } catch (retryError) {
      if (attempt < retryAttempts) {
        await retryWithBackoff(attempt + 1)
      }
    }
  }, [fetchData, retryAttempts, retryDelay])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      if (!loading && !isRefreshing) {
        fetchData(true)
      }
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchData, loading, isRefreshing])

  // Auto retry on certain errors
  useEffect(() => {
    if (error && error.type === 'network_error' && error.canRetry) {
      const timeoutId = setTimeout(() => {
        retryWithBackoff()
      }, retryDelay)
      
      return () => clearTimeout(timeoutId)
    }
  }, [error, retryWithBackoff, retryDelay])

  const loadingState: LoadingState = {
    isLoading: loading,
    isRefreshing,
    message: isRefreshing ? "מרענן נתונים..." : "טוען נתונים..."
  }

  return {
    data,
    loading,
    error,
    isConnected,
    source,
    lastFetched,
    loadingState,
    refresh,
    clearError,
  }
}

// Specific hooks for each data type with proper typing
export function useAccountStatus(options?: UseSheetDataOptions) {
  return useSheetData<import('@/lib/types/api').AccountStatusData>("account-status", options)
}

export function useMonthlyExpenses(options?: UseSheetDataOptions) {
  return useSheetData<import('@/lib/types/api').ExpenseItem[]>("monthly-expenses", options)
}

export function useExpectedExpenses(options?: UseSheetDataOptions) {
  return useSheetData<import('@/lib/types/api').ExpectedExpenseItem[]>("expected-expenses", options)
}

export function useTenantPayments(options?: UseSheetDataOptions) {
  return useSheetData<import('@/lib/types/api').TenantPaymentsResponse>("tenant-payments", options)
}

export function useApartmentFees(options?: UseSheetDataOptions) {
  return useSheetData<import('@/lib/types/api').ApartmentFeesResponse>("apartment-fees", options)
}
