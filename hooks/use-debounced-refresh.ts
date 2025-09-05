"use client"

import { useCallback, useRef } from 'react'

interface UseDebouncedRefreshOptions {
  delay?: number
  maxWait?: number
}

export function useDebouncedRefresh(
  refreshFunction: () => Promise<void>,
  options: UseDebouncedRefreshOptions = {}
) {
  const { delay = 1000, maxWait = 5000 } = options
  
  const timeoutRef = useRef<NodeJS.Timeout>()
  const maxTimeoutRef = useRef<NodeJS.Timeout>()
  const lastCallRef = useRef<number>(0)
  const pendingRef = useRef<boolean>(false)

  const debouncedRefresh = useCallback(async () => {
    const now = Date.now()
    
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // If we haven't called the function in maxWait time, call it immediately
    if (now - lastCallRef.current >= maxWait) {
      if (pendingRef.current) return // Prevent concurrent calls
      
      pendingRef.current = true
      try {
        await refreshFunction()
        lastCallRef.current = now
      } finally {
        pendingRef.current = false
      }
      return
    }
    
    // Otherwise, debounce the call
    timeoutRef.current = setTimeout(async () => {
      if (pendingRef.current) return // Prevent concurrent calls
      
      pendingRef.current = true
      try {
        await refreshFunction()
        lastCallRef.current = Date.now()
      } finally {
        pendingRef.current = false
      }
    }, delay)
    
    // Set max wait timeout if not already set
    if (!maxTimeoutRef.current) {
      maxTimeoutRef.current = setTimeout(async () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        if (pendingRef.current) return
        
        pendingRef.current = true
        try {
          await refreshFunction()
          lastCallRef.current = Date.now()
        } finally {
          pendingRef.current = false
        }
        
        maxTimeoutRef.current = undefined
      }, maxWait)
    }
  }, [refreshFunction, delay, maxWait])

  const cancelRefresh = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current)
      maxTimeoutRef.current = undefined
    }
  }, [])

  const isRefreshPending = useCallback(() => {
    return pendingRef.current || !!timeoutRef.current
  }, [])

  return {
    debouncedRefresh,
    cancelRefresh,
    isRefreshPending
  }
}