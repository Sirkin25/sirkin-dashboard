// Enhanced error handling system for the building management dashboard

import { ERROR_MESSAGES } from '@/lib/constants/hebrew'
import type { ErrorType, ErrorState } from '@/lib/types/api'

/**
 * Create a standardized error state
 */
export function createErrorState(
  type: ErrorType,
  originalError?: Error | string,
  canRetry: boolean = true,
  retryAction?: () => void
): ErrorState {
  const message = typeof originalError === 'string' ? originalError : originalError?.message || 'Unknown error'
  
  return {
    type,
    message,
    hebrewMessage: ERROR_MESSAGES[type],
    canRetry,
    retryAction
  }
}

/**
 * Classify error type based on error message or type
 */
export function classifyError(error: Error | string): ErrorType {
  const errorMessage = typeof error === 'string' ? error : error.message.toLowerCase()
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
    return 'network_error'
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
    return 'authentication_error'
  }
  
  if (errorMessage.includes('not found') || errorMessage.includes('sheet') || errorMessage.includes('spreadsheet')) {
    return 'sheets_connection_error'
  }
  
  if (errorMessage.includes('parse') || errorMessage.includes('invalid') || errorMessage.includes('malformed')) {
    return 'data_parsing_error'
  }
  
  return 'unknown_error'
}

/**
 * Error recovery strategies
 */
export interface ErrorRecoveryStrategy {
  immediate: () => Promise<boolean>
  delayed: (delay?: number) => Promise<boolean>
  fallback: () => Promise<any>
  manual: () => void
}

/**
 * Create error recovery strategy
 */
export function createErrorRecovery(
  retryFn: () => Promise<any>,
  fallbackFn?: () => Promise<any>,
  manualFn?: () => void
): ErrorRecoveryStrategy {
  return {
    immediate: async () => {
      try {
        await retryFn()
        return true
      } catch {
        return false
      }
    },
    
    delayed: async (delay = 2000) => {
      await new Promise(resolve => setTimeout(resolve, delay))
      try {
        await retryFn()
        return true
      } catch {
        return false
      }
    },
    
    fallback: async () => {
      if (fallbackFn) {
        return await fallbackFn()
      }
      throw new Error('No fallback available')
    },
    
    manual: () => {
      if (manualFn) {
        manualFn()
      }
    }
  }
}

/**
 * Handle API errors with proper classification and recovery
 */
export function handleApiError(
  error: Error | string,
  retryFn?: () => Promise<any>,
  fallbackFn?: () => Promise<any>
): ErrorState {
  const errorType = classifyError(error)
  const canRetry = errorType !== 'authentication_error'
  
  return createErrorState(
    errorType,
    error,
    canRetry,
    retryFn
  )
}

/**
 * Validate API response data
 */
export function validateApiResponse<T>(data: any, validator: (data: any) => data is T): T {
  if (!validator(data)) {
    throw new Error('Invalid API response format')
  }
  return data
}

/**
 * Type guards for data validation
 */
export const validators = {
  isAccountStatusData: (data: any): data is import('@/lib/types/api').AccountStatusData => {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.balance === 'number' &&
      typeof data.lastUpdated === 'string' &&
      typeof data.monthlyChange === 'number' &&
      ['healthy', 'warning', 'critical'].includes(data.status)
    )
  },
  
  isTenantPaymentRow: (data: any): data is import('@/lib/types/api').TenantPaymentRow => {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.apartment === 'string' &&
      typeof data.month_1 === 'string'
    )
  },
  
  isApartmentFee: (data: any): data is import('@/lib/types/api').ApartmentFee => {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.apartmentNumber === 'number' &&
      typeof data.ownerName === 'string' &&
      typeof data.totalMonthlyFee === 'number'
    )
  }
}