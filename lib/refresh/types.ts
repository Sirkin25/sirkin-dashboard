export interface RefreshFunction {
  (): Promise<void>
}

export interface TabRefreshConfig {
  tabId: string
  refreshFunctions: RefreshFunction[]
  isActive: boolean
  lastRefreshed?: Date
  isRefreshing?: boolean
  error?: string | null
}

export interface RefreshState {
  isRefreshing: boolean
  lastRefreshTime: Date | null
  activeTab: string
  refreshInProgress: { [tabId: string]: boolean }
  errors: { [tabId: string]: string | null }
}

export interface RefreshManagerInterface {
  refreshCurrentTab: () => Promise<void>
  refreshTab: (tabId: string) => Promise<void>
  registerTab: (tabId: string, refreshFunctions: RefreshFunction[]) => void
  unregisterTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  getRefreshState: () => RefreshState
  isTabRefreshing: (tabId: string) => boolean
  getTabError: (tabId: string) => string | null
  clearTabError: (tabId: string) => void
}