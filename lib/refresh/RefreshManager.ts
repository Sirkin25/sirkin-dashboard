import { RefreshManagerInterface, TabRefreshConfig, RefreshState, RefreshFunction } from './types'

export class RefreshManager implements RefreshManagerInterface {
  private tabs: Map<string, TabRefreshConfig> = new Map()
  private activeTab: string = 'overview'
  private refreshState: RefreshState = {
    isRefreshing: false,
    lastRefreshTime: null,
    activeTab: 'overview',
    refreshInProgress: {},
    errors: {}
  }
  private listeners: Set<(state: RefreshState) => void> = new Set()

  registerTab(tabId: string, refreshFunctions: RefreshFunction[]): void {
    this.tabs.set(tabId, {
      tabId,
      refreshFunctions,
      isActive: tabId === this.activeTab,
      lastRefreshed: undefined,
      isRefreshing: false,
      error: null
    })
    
    this.updateRefreshState()
  }

  unregisterTab(tabId: string): void {
    this.tabs.delete(tabId)
    delete this.refreshState.refreshInProgress[tabId]
    delete this.refreshState.errors[tabId]
    this.updateRefreshState()
  }

  setActiveTab(tabId: string): void {
    // Update all tabs' active status
    this.tabs.forEach((config, id) => {
      config.isActive = id === tabId
    })
    
    this.activeTab = tabId
    this.refreshState.activeTab = tabId
    this.updateRefreshState()
  }

  async refreshCurrentTab(): Promise<void> {
    return this.refreshTab(this.activeTab)
  }

  async refreshTab(tabId: string): Promise<void> {
    const tabConfig = this.tabs.get(tabId)
    if (!tabConfig) {
      console.warn(`Tab ${tabId} not registered for refresh`)
      return
    }

    // Prevent concurrent refreshes of the same tab
    if (this.refreshState.refreshInProgress[tabId]) {
      return
    }

    // Debounce rapid refresh requests
    const now = Date.now()
    const lastRefresh = tabConfig.lastRefreshed?.getTime() || 0
    const timeSinceLastRefresh = now - lastRefresh
    
    if (timeSinceLastRefresh < 1000) { // Minimum 1 second between refreshes
      return
    }

    try {
      // Mark tab as refreshing
      this.refreshState.refreshInProgress[tabId] = true
      this.refreshState.isRefreshing = true
      this.refreshState.errors[tabId] = null
      tabConfig.isRefreshing = true
      tabConfig.error = null
      
      this.updateRefreshState()

      // Execute all refresh functions for this tab with timeout
      const refreshPromises = tabConfig.refreshFunctions.map(fn => 
        Promise.race([
          fn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Refresh timeout')), 30000)
          )
        ])
      )
      
      await Promise.all(refreshPromises)

      // Update success state
      tabConfig.lastRefreshed = new Date()
      this.refreshState.lastRefreshTime = new Date()
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown refresh error'
      console.error(`Error refreshing tab ${tabId}:`, error)
      
      this.refreshState.errors[tabId] = errorMessage
      tabConfig.error = errorMessage
      
    } finally {
      // Clean up refreshing state
      this.refreshState.refreshInProgress[tabId] = false
      tabConfig.isRefreshing = false
      
      // Check if any tabs are still refreshing
      const anyRefreshing = Object.values(this.refreshState.refreshInProgress).some(Boolean)
      this.refreshState.isRefreshing = anyRefreshing
      
      this.updateRefreshState()
    }
  }

  getRefreshState(): RefreshState {
    return { ...this.refreshState }
  }

  isTabRefreshing(tabId: string): boolean {
    return this.refreshState.refreshInProgress[tabId] || false
  }

  getTabError(tabId: string): string | null {
    return this.refreshState.errors[tabId] || null
  }

  clearTabError(tabId: string): void {
    this.refreshState.errors[tabId] = null
    const tabConfig = this.tabs.get(tabId)
    if (tabConfig) {
      tabConfig.error = null
    }
    this.updateRefreshState()
  }

  // Subscribe to refresh state changes
  subscribe(listener: (state: RefreshState) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private updateRefreshState(): void {
    // Debounce state updates to prevent excessive re-renders
    if (this.stateUpdateTimeout) {
      clearTimeout(this.stateUpdateTimeout)
    }
    
    this.stateUpdateTimeout = setTimeout(() => {
      // Notify all listeners of state change
      this.listeners.forEach(listener => {
        try {
          listener(this.getRefreshState())
        } catch (error) {
          console.error('Error in refresh state listener:', error)
        }
      })
    }, 50) // 50ms debounce
  }

  private stateUpdateTimeout: NodeJS.Timeout | undefined

  // Helper method to get tab configuration
  getTabConfig(tabId: string): TabRefreshConfig | undefined {
    return this.tabs.get(tabId)
  }

  // Helper method to get all registered tabs
  getAllTabs(): string[] {
    return Array.from(this.tabs.keys())
  }

  // Helper method to check if a tab is registered
  isTabRegistered(tabId: string): boolean {
    return this.tabs.has(tabId)
  }

  // Method to force refresh all tabs (for emergency situations)
  async refreshAllTabs(): Promise<void> {
    const refreshPromises = Array.from(this.tabs.keys()).map(tabId => 
      this.refreshTab(tabId)
    )
    
    await Promise.allSettled(refreshPromises)
  }
}

// Singleton instance
export const refreshManager = new RefreshManager()