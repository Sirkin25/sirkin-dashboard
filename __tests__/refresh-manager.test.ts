import { RefreshManager } from '@/lib/refresh/RefreshManager'
import { RefreshFunction } from '@/lib/refresh/types'

describe('RefreshManager', () => {
  let refreshManager: RefreshManager
  let mockRefreshFn1: jest.MockedFunction<RefreshFunction>
  let mockRefreshFn2: jest.MockedFunction<RefreshFunction>

  beforeEach(() => {
    refreshManager = new RefreshManager()
    mockRefreshFn1 = jest.fn().mockResolvedValue(undefined)
    mockRefreshFn2 = jest.fn().mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('tab registration', () => {
    it('should register a tab with refresh functions', () => {
      refreshManager.registerTab('test-tab', [mockRefreshFn1])
      
      expect(refreshManager.isTabRegistered('test-tab')).toBe(true)
      expect(refreshManager.getAllTabs()).toContain('test-tab')
    })

    it('should unregister a tab', () => {
      refreshManager.registerTab('test-tab', [mockRefreshFn1])
      refreshManager.unregisterTab('test-tab')
      
      expect(refreshManager.isTabRegistered('test-tab')).toBe(false)
      expect(refreshManager.getAllTabs()).not.toContain('test-tab')
    })

    it('should set active tab', () => {
      refreshManager.registerTab('tab1', [mockRefreshFn1])
      refreshManager.registerTab('tab2', [mockRefreshFn2])
      
      refreshManager.setActiveTab('tab2')
      
      const state = refreshManager.getRefreshState()
      expect(state.activeTab).toBe('tab2')
    })
  })

  describe('refresh functionality', () => {
    beforeEach(() => {
      refreshManager.registerTab('test-tab', [mockRefreshFn1, mockRefreshFn2])
      refreshManager.setActiveTab('test-tab')
    })

    it('should refresh current tab', async () => {
      await refreshManager.refreshCurrentTab()
      
      expect(mockRefreshFn1).toHaveBeenCalledTimes(1)
      expect(mockRefreshFn2).toHaveBeenCalledTimes(1)
    })

    it('should refresh specific tab', async () => {
      await refreshManager.refreshTab('test-tab')
      
      expect(mockRefreshFn1).toHaveBeenCalledTimes(1)
      expect(mockRefreshFn2).toHaveBeenCalledTimes(1)
    })

    it('should handle refresh errors', async () => {
      const errorMessage = 'Refresh failed'
      mockRefreshFn1.mockRejectedValue(new Error(errorMessage))
      
      await refreshManager.refreshTab('test-tab')
      
      const error = refreshManager.getTabError('test-tab')
      expect(error).toBe(errorMessage)
    })

    it('should prevent concurrent refreshes', async () => {
      const slowRefresh = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )
      
      refreshManager.registerTab('slow-tab', [slowRefresh])
      
      // Start two refreshes simultaneously
      const promise1 = refreshManager.refreshTab('slow-tab')
      const promise2 = refreshManager.refreshTab('slow-tab')
      
      await Promise.all([promise1, promise2])
      
      // Should only call once due to concurrency protection
      expect(slowRefresh).toHaveBeenCalledTimes(1)
    })

    it('should clear tab errors', () => {
      refreshManager.registerTab('error-tab', [mockRefreshFn1])
      
      // Simulate error state
      const state = refreshManager.getRefreshState()
      state.errors['error-tab'] = 'Test error'
      
      refreshManager.clearTabError('error-tab')
      
      expect(refreshManager.getTabError('error-tab')).toBeNull()
    })
  })

  describe('state management', () => {
    it('should track refresh state correctly', async () => {
      refreshManager.registerTab('test-tab', [mockRefreshFn1])
      
      const initialState = refreshManager.getRefreshState()
      expect(initialState.isRefreshing).toBe(false)
      
      // Start refresh (don't await to check intermediate state)
      const refreshPromise = refreshManager.refreshTab('test-tab')
      
      // Check that refresh is in progress
      expect(refreshManager.isTabRefreshing('test-tab')).toBe(true)
      
      await refreshPromise
      
      // Check that refresh is complete
      expect(refreshManager.isTabRefreshing('test-tab')).toBe(false)
      
      const finalState = refreshManager.getRefreshState()
      expect(finalState.lastRefreshTime).toBeInstanceOf(Date)
    })

    it('should notify listeners of state changes', (done) => {
      let callCount = 0
      
      const unsubscribe = refreshManager.subscribe((state) => {
        callCount++
        if (callCount === 2) { // Initial state + after refresh
          expect(state.lastRefreshTime).toBeInstanceOf(Date)
          unsubscribe()
          done()
        }
      })
      
      refreshManager.registerTab('test-tab', [mockRefreshFn1])
      refreshManager.refreshTab('test-tab')
    })
  })

  describe('debouncing', () => {
    it('should debounce rapid refresh requests', async () => {
      refreshManager.registerTab('test-tab', [mockRefreshFn1])
      
      // Make multiple rapid refresh calls
      const promises = [
        refreshManager.refreshTab('test-tab'),
        refreshManager.refreshTab('test-tab'),
        refreshManager.refreshTab('test-tab')
      ]
      
      await Promise.all(promises)
      
      // Should only execute once due to debouncing
      expect(mockRefreshFn1).toHaveBeenCalledTimes(1)
    })
  })
})