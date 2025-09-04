"use client"

import { useState, useEffect, useCallback } from "react"

interface UseSheetDataOptions {
  refreshInterval?: number // in milliseconds
  autoRefresh?: boolean
}

interface SheetDataState<T> {
  data: T | null
  loading: boolean
  error: string | null
  isConnected: boolean
  source: string
  lastFetched: Date | null
}

export function useSheetData<T>(
  endpoint: string,
  options: UseSheetDataOptions = {},
): SheetDataState<T> & { refresh: () => Promise<void> } {
  const { refreshInterval = 300000, autoRefresh = false } = options // Default 5 minutes

  const [state, setState] = useState<SheetDataState<T>>({
    data: null,
    loading: true,
    error: null,
    isConnected: false,
    source: "",
    lastFetched: null,
  })

  const fetchData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const response = await fetch(`/api/sheets/${endpoint}?t=${Date.now()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      setState({
        data: result,
        loading: false,
        error: null,
        isConnected: result.isConnected || false,
        source: result.source || "Unknown",
        lastFetched: new Date(result.lastFetched || new Date()),
      })
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }))
    }
  }, [endpoint])

  const refresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchData])

  return {
    ...state,
    refresh,
  }
}

// Specific hooks for each data type
export function useAccountStatus(options?: UseSheetDataOptions) {
  return useSheetData("account-status", options)
}

export function useMonthlyExpenses(options?: UseSheetDataOptions) {
  return useSheetData("monthly-expenses", options)
}

export function useExpectedExpenses(options?: UseSheetDataOptions) {
  return useSheetData("expected-expenses", options)
}

export function useTenantPayments(options?: UseSheetDataOptions) {
  return useSheetData("tenant-payments", options)
}

export function useApartmentFees(options?: UseSheetDataOptions) {
  return useSheetData("apartment-fees", options)
}
