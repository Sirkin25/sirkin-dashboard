"use client"

import { useState, useEffect, useCallback } from 'react'

interface LoadingState {
  id: string
  isLoading: boolean
  message?: string
  progress?: number
}

interface UseLoadingCoordinatorResult {
  globalLoading: boolean
  loadingStates: LoadingState[]
  registerLoading: (id: string, isLoading: boolean, message?: string, progress?: number) => void
  unregisterLoading: (id: string) => void
  getLoadingState: (id: string) => LoadingState | undefined
  isAnyLoading: boolean
  getLoadingMessage: () => string
}

export function useLoadingCoordinator(): UseLoadingCoordinatorResult {
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingState>>(new Map())

  const registerLoading = useCallback((
    id: string, 
    isLoading: boolean, 
    message?: string, 
    progress?: number
  ) => {
    setLoadingStates(prev => {
      const newStates = new Map(prev)
      if (isLoading) {
        newStates.set(id, { id, isLoading, message, progress })
      } else {
        newStates.delete(id)
      }
      return newStates
    })
  }, [])

  const unregisterLoading = useCallback((id: string) => {
    setLoadingStates(prev => {
      const newStates = new Map(prev)
      newStates.delete(id)
      return newStates
    })
  }, [])

  const getLoadingState = useCallback((id: string) => {
    return loadingStates.get(id)
  }, [loadingStates])

  const isAnyLoading = loadingStates.size > 0
  const globalLoading = Array.from(loadingStates.values()).some(state => state.isLoading)

  const getLoadingMessage = useCallback(() => {
    const states = Array.from(loadingStates.values())
    if (states.length === 0) return ""
    
    // Return the most recent loading message
    const latestState = states[states.length - 1]
    return latestState.message || "טוען..."
  }, [loadingStates])

  return {
    globalLoading,
    loadingStates: Array.from(loadingStates.values()),
    registerLoading,
    unregisterLoading,
    getLoadingState,
    isAnyLoading,
    getLoadingMessage
  }
}

// Hook for individual components to register their loading state
export function useComponentLoading(
  componentId: string,
  isLoading: boolean,
  message?: string,
  progress?: number
) {
  const { registerLoading, unregisterLoading } = useLoadingCoordinator()

  useEffect(() => {
    registerLoading(componentId, isLoading, message, progress)
    
    return () => {
      unregisterLoading(componentId)
    }
  }, [componentId, isLoading, message, progress, registerLoading, unregisterLoading])
}