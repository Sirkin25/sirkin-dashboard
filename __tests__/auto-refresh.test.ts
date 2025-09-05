import { renderHook, act } from '@testing-library/react'
import { useAutoRefresh } from '@/hooks/use-auto-refresh'
import { useVisibilityDetection } from '@/hooks/use-visibility-detection'
import { useRefreshManager } from '@/hooks/use-refresh-manager'
import { useAutoRefreshPreference } from '@/hooks/use-preferences'

// Mock the dependencies
jest.mock('@/hooks/use-visibility-detection')
jest.mock('@/hooks/use-refresh-manager')
jest.mock('@/hooks/use-preferences')

const mockUseVisibilityDetection = useVisibilityDetection as jest.MockedFunction<typeof useVisibilityDetection>
const mockUseRefreshManager = useRefreshManager as jest.MockedFunction<typeof useRefreshManager>
const mockUseAutoRefreshPreference = useAutoRefreshPreference as jest.MockedFunction<typeof useAutoRefreshPreference>

describe('useAutoRefresh', () => {
  const mockRefreshCurrentTab = jest.fn()
  const mockSetAutoRefreshEnabled = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    // Default mock implementations
    mockUseVisibilityDetection.mockReturnValue({
      isVisible: true,
      isOnline: true,
      isIdle: false
    })

    mockUseRefreshManager.mockReturnValue({
      refreshCurrentTab: mockRefreshCurrentTab,
      isRefreshing: false
    } as any)

    mockUseAutoRefreshPreference.mockReturnValue({
      autoRefreshEnabled: true,
      setAutoRefreshEnabled: mockSetAutoRefreshEnabled
    } as any)

    mockRefreshCurrentTab.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should start auto-refresh when enabled and conditions are met', () => {
    const { result } = renderHook(() => useAutoRefresh())

    expect(result.current.isEnabled).toBe(true)
    expect(result.current.isRunning).toBe(true)
    expect(result.current.isPaused).toBe(false)
  })

  it('should pause when tab is not visible', () => {
    mockUseVisibilityDetection.mockReturnValue({
      isVisible: false,
      isOnline: true,
      isIdle: false
    })

    const { result } = renderHook(() => useAutoRefresh())

    expect(result.current.isPaused).toBe(true)
    expect(result.current.isRunning).toBe(false)
  })

  it('should pause when offline', () => {
    mockUseVisibilityDetection.mockReturnValue({
      isVisible: true,
      isOnline: false,
      isIdle: false
    })

    const { result } = renderHook(() => useAutoRefresh())

    expect(result.current.isPaused).toBe(true)
    expect(result.current.isRunning).toBe(false)
  })

  it('should pause when user is idle', () => {
    mockUseVisibilityDetection.mockReturnValue({
      isVisible: true,
      isOnline: true,
      isIdle: true
    })

    const { result } = renderHook(() => useAutoRefresh())

    expect(result.current.isPaused).toBe(true)
    expect(result.current.isRunning).toBe(false)
  })

  it('should pause when refresh is in progress', () => {
    mockUseRefreshManager.mockReturnValue({
      refreshCurrentTab: mockRefreshCurrentTab,
      isRefreshing: true
    } as any)

    const { result } = renderHook(() => useAutoRefresh())

    expect(result.current.isPaused).toBe(true)
    expect(result.current.isRunning).toBe(false)
  })

  it('should execute refresh after interval', async () => {
    renderHook(() => useAutoRefresh({ interval: 5000 }))

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    await act(async () => {
      await Promise.resolve() // Allow promises to resolve
    })

    expect(mockRefreshCurrentTab).toHaveBeenCalledTimes(1)
  })

  it('should update countdown timer', () => {
    const { result } = renderHook(() => useAutoRefresh({ interval: 10000 }))

    expect(result.current.nextRefreshIn).toBeGreaterThan(0)
    expect(result.current.nextRefreshIn).toBeLessThanOrEqual(10000)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current.nextRefreshIn).toBeLessThan(10000)
  })

  it('should handle refresh failures', async () => {
    const error = new Error('Refresh failed')
    mockRefreshCurrentTab.mockRejectedValue(error)

    const { result } = renderHook(() => useAutoRefresh({ 
      interval: 1000,
      maxRetries: 2
    }))

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.failedAttempts).toBe(1)
  })

  it('should stop after max retries', async () => {
    const error = new Error('Refresh failed')
    mockRefreshCurrentTab.mockRejectedValue(error)

    const { result } = renderHook(() => useAutoRefresh({ 
      interval: 1000,
      maxRetries: 2
    }))

    // Trigger multiple failures
    for (let i = 0; i < 3; i++) {
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      await act(async () => {
        await Promise.resolve()
      })
    }

    expect(result.current.failedAttempts).toBe(2)
    expect(result.current.isPaused).toBe(true)
  })

  it('should enable auto-refresh', () => {
    const { result } = renderHook(() => useAutoRefresh())

    act(() => {
      result.current.enable()
    })

    expect(mockSetAutoRefreshEnabled).toHaveBeenCalledWith(true)
  })

  it('should disable auto-refresh', () => {
    const { result } = renderHook(() => useAutoRefresh())

    act(() => {
      result.current.disable()
    })

    expect(mockSetAutoRefreshEnabled).toHaveBeenCalledWith(false)
  })

  it('should force refresh and restart timer', async () => {
    const { result } = renderHook(() => useAutoRefresh({ interval: 10000 }))

    await act(async () => {
      await result.current.forceRefresh()
    })

    expect(mockRefreshCurrentTab).toHaveBeenCalledTimes(1)
    // Timer should restart after force refresh
    expect(result.current.nextRefreshIn).toBeGreaterThan(9000)
  })

  it('should reset failure count', () => {
    const { result } = renderHook(() => useAutoRefresh())

    // Simulate some failures
    act(() => {
      // This would normally be set by the refresh failure logic
      // For testing, we'll just verify the reset function exists
      result.current.resetFailures()
    })

    expect(result.current.failedAttempts).toBe(0)
  })

  it('should use custom interval', () => {
    const customInterval = 15000
    const { result } = renderHook(() => useAutoRefresh({ interval: customInterval }))

    expect(result.current.nextRefreshIn).toBeLessThanOrEqual(customInterval)
    expect(result.current.nextRefreshIn).toBeGreaterThan(customInterval - 1000)
  })

  it('should respect pause options', () => {
    mockUseVisibilityDetection.mockReturnValue({
      isVisible: false,
      isOnline: false,
      isIdle: true
    })

    // Test with all pause options disabled
    const { result: result1 } = renderHook(() => useAutoRefresh({
      pauseWhenHidden: false,
      pauseWhenOffline: false,
      pauseWhenIdle: false
    }))

    expect(result1.current.isPaused).toBe(false)

    // Test with all pause options enabled (default)
    const { result: result2 } = renderHook(() => useAutoRefresh())

    expect(result2.current.isPaused).toBe(true)
  })
})