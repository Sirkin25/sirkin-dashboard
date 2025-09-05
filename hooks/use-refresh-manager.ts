"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { refreshManager } from '@/lib/refresh/RefreshManager'
import { RefreshState, RefreshFunction } from '@/lib/refresh/types'

interface UseRefreshManagerResult {
  refreshState: RefreshState
  refreshCurrentTab: () => Promise<void>
  refreshTab: (tabId: string) => Promise<void>
  isRefreshing: boolean
  isTabRefreshing: (tabId: string) => boolean
  getTabError: (tabId: string) => string | null
  clearTabError: (tabId: string) => void
  registerTab: (tabId: string, refreshFunctions: RefreshFunction[]) => void
  unregisterTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
}

export function useRefreshManager(): UseRefreshManagerResult {
  const [refreshState, setRefreshState] = useState<RefreshState>(
    refreshManager.getRefreshState()
  )
  
  // Subscribe to refresh state changes
  useEffect(() => {
    const unsubscribe = refreshManager.subscribe(setRefreshState)
    return unsubscribe
  }, [])

  const refreshCurrentTab = useCallback(async () => {
    await refreshManager.refreshCurrentTab()
  }, [])

  const refreshTab = useCallback(async (tabId: string) => {
    await refreshManager.refreshTab(tabId)
  }, [])

  const isTabRefreshing = useCallback((tabId: string) => {
    return refreshManager.isTabRefreshing(tabId)
  }, [])

  const getTabError = useCallback((tabId: string) => {
    return refreshManager.getTabError(tabId)
  }, [])

  const clearTabError = useCallback((tabId: string) => {
    refreshManager.clearTabError(tabId)
  }, [])

  const registerTab = useCallback((tabId: string, refreshFunctions: RefreshFunction[]) => {
    refreshManager.registerTab(tabId, refreshFunctions)
  }, [])

  const unregisterTab = useCallback((tabId: string) => {
    refreshManager.unregisterTab(tabId)
  }, [])

  const setActiveTab = useCallback((tabId: string) => {
    refreshManager.setActiveTab(tabId)
  }, [])

  return {
    refreshState,
    refreshCurrentTab,
    refreshTab,
    isRefreshing: refreshState.isRefreshing,
    isTabRefreshing,
    getTabError,
    clearTabError,
    registerTab,
    unregisterTab,
    setActiveTab
  }
}

// Hook for registering a tab with refresh functions
export function useTabRefresh(
  tabId: string, 
  refreshFunctions: RefreshFunction[],
  isActive: boolean = false
) {
  const { registerTab, unregisterTab, setActiveTab } = useRefreshManager()
  const registeredRef = useRef(false)

  useEffect(() => {
    if (!registeredRef.current) {
      registerTab(tabId, refreshFunctions)
      registeredRef.current = true
    }

    return () => {
      if (registeredRef.current) {
        unregisterTab(tabId)
        registeredRef.current = false
      }
    }
  }, [tabId, registerTab, unregisterTab])

  // Update refresh functions when they change
  useEffect(() => {
    if (registeredRef.current) {
      registerTab(tabId, refreshFunctions)
    }
  }, [tabId, refreshFunctions, registerTab])

  // Set active tab when isActive changes
  useEffect(() => {
    if (isActive) {
      setActiveTab(tabId)
    }
  }, [isActive, tabId, setActiveTab])
}