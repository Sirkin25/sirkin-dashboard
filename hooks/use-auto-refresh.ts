"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useVisibilityDetection } from './use-visibility-detection'
import { useRefreshManager } from './use-refresh-manager'
import { useAutoRefreshPreference } from './use-preferences'

interface AutoRefreshOptions {
  interval?: number // in milliseconds
  pauseWhenHidden?: boolean
  pauseWhenOffline?: boolean
  pauseWhenIdle?: boolean
  maxRetries?: number
  retryDelay?: number
}

interface UseAutoRefreshResult {
  isEnabled: boolean
  isRunning: boolean
  isPaused: boolean
  nextRefreshIn: number
  failedAttempts: number
  enable: () => void
  disable: () => void
  pause: () => void
  resume: () => void
  forceRefresh: () => Promise<void>
  resetFailures: () => void
}

export function useAutoRefresh(options: AutoRefreshOptions = {}): UseAutoRefreshResult {
  const {
    interval = 30000, // 30 seconds default
    pauseWhenHidden = true,
    pauseWhenOffline = true,
    pauseWhenIdle = true,
    maxRetries = 3,
    retryDelay = 5000
  } = options

  const { autoRefreshEnabled, setAutoRefreshEnabled } = useAutoRefreshPreference()
  const { isVisible, isOnline, isIdle } = useVisibilityDetection()
  const { refreshCurrentTab, isRefreshing } = useRefreshManager()

  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [nextRefreshIn, setNextRefreshIn] = useState(0)
  const [failedAttempts, setFailedAttempts] = useState(0)

  const timerRef = useRef<NodeJS.Timeout>()
  const countdownRef = useRef<NodeJS.Timeout>()
  const retryTimeoutRef = useRef<NodeJS.Timeout>()

  // Determine if auto-refresh should be paused based on conditions
  const shouldPause = useCallback(() => {
    if (!autoRefreshEnabled) return true
    if (pauseWhenHidden && !isVisible) return true
    if (pauseWhenOffline && !isOnline) return true
    if (pauseWhenIdle && isIdle) return true
    if (isRefreshing) return true // Don't start new refresh while one is in progress
    if (failedAttempts >= maxRetries) return true
    return false
  }, [
    autoRefreshEnabled,
    pauseWhenHidden,
    isVisible,
    pauseWhenOffline,
    isOnline,
    pauseWhenIdle,
    isIdle,
    isRefreshing,
    failedAttempts,
    maxRetries
  ])

  // Start countdown timer
  const startCountdown = useCallback((duration: number) => {
    setNextRefreshIn(duration)
    
    const startTime = Date.now()
    const updateCountdown = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, duration - elapsed)
      setNextRefreshIn(remaining)
      
      if (remaining > 0) {
        countdownRef.current = setTimeout(updateCountdown, 1000)
      }
    }
    
    updateCountdown()
  }, [])

  // Stop countdown timer
  const stopCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearTimeout(countdownRef.current)
      countdownRef.current = undefined
    }
    setNextRefreshIn(0)
  }, [])

  // Execute refresh with error handling
  const executeRefresh = useCallback(async () => {
    try {
      await refreshCurrentTab()
      setFailedAttempts(0) // Reset failures on success
    } catch (error) {
      console.error('Auto-refresh failed:', error)
      setFailedAttempts(prev => prev + 1)
      
      // If we haven't exceeded max retries, schedule a retry
      if (failedAttempts + 1 < maxRetries) {
        retryTimeoutRef.current = setTimeout(() => {
          executeRefresh()
        }, retryDelay)
      }
    }
  }, [refreshCurrentTab, failedAttempts, maxRetries, retryDelay])

  // Start auto-refresh timer
  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    const scheduleNext = () => {
      if (shouldPause()) {
        setIsRunning(false)
        setIsPaused(true)
        stopCountdown()
        return
      }

      setIsRunning(true)
      setIsPaused(false)
      startCountdown(interval)

      timerRef.current = setTimeout(async () => {
        await executeRefresh()
        scheduleNext() // Schedule next refresh
      }, interval)
    }

    scheduleNext()
  }, [shouldPause, interval, executeRefresh, startCountdown, stopCountdown])

  // Stop auto-refresh timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = undefined
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = undefined
    }
    stopCountdown()
    setIsRunning(false)
    setIsPaused(false)
  }, [stopCountdown])

  // Public methods
  const enable = useCallback(() => {
    setAutoRefreshEnabled(true)
  }, [setAutoRefreshEnabled])

  const disable = useCallback(() => {
    setAutoRefreshEnabled(false)
    stopTimer()
  }, [setAutoRefreshEnabled, stopTimer])

  const pause = useCallback(() => {
    setIsPaused(true)
    stopTimer()
  }, [stopTimer])

  const resume = useCallback(() => {
    if (autoRefreshEnabled) {
      setIsPaused(false)
      startTimer()
    }
  }, [autoRefreshEnabled, startTimer])

  const forceRefresh = useCallback(async () => {
    // Stop current timer and execute immediate refresh
    stopTimer()
    await executeRefresh()
    // Restart timer after manual refresh
    if (autoRefreshEnabled && !shouldPause()) {
      startTimer()
    }
  }, [stopTimer, executeRefresh, autoRefreshEnabled, shouldPause, startTimer])

  const resetFailures = useCallback(() => {
    setFailedAttempts(0)
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = undefined
    }
  }, [])

  // Effect to start/stop timer based on conditions
  useEffect(() => {
    if (autoRefreshEnabled && !shouldPause()) {
      startTimer()
    } else {
      stopTimer()
    }

    return stopTimer
  }, [autoRefreshEnabled, shouldPause, startTimer, stopTimer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer()
    }
  }, [stopTimer])

  return {
    isEnabled: autoRefreshEnabled,
    isRunning,
    isPaused: isPaused || shouldPause(),
    nextRefreshIn,
    failedAttempts,
    enable,
    disable,
    pause,
    resume,
    forceRefresh,
    resetFailures
  }
}