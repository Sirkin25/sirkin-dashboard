"use client"

import { useState, useEffect } from 'react'

interface UseVisibilityDetectionResult {
  isVisible: boolean
  isOnline: boolean
  isIdle: boolean
}

export function useVisibilityDetection(): UseVisibilityDetectionResult {
  const [isVisible, setIsVisible] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [isIdle, setIsIdle] = useState(false)

  useEffect(() => {
    // Page visibility detection
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    // Network status detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // User activity detection for idle state
    let idleTimer: NodeJS.Timeout
    const IDLE_TIME = 5 * 60 * 1000 // 5 minutes

    const resetIdleTimer = () => {
      setIsIdle(false)
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        setIsIdle(true)
      }, IDLE_TIME)
    }

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']

    // Set initial states
    setIsVisible(!document.hidden)
    setIsOnline(navigator.onLine)

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Add activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true)
    })

    // Start idle timer
    resetIdleTimer()

    return () => {
      // Cleanup
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true)
      })
      
      clearTimeout(idleTimer)
    }
  }, [])

  return {
    isVisible,
    isOnline,
    isIdle
  }
}