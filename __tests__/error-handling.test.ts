import {
  createErrorState,
  classifyError,
  handleApiError,
  validators,
} from '@/lib/errors'

describe('Error Classification', () => {
  test('classifies network errors correctly', () => {
    expect(classifyError(new Error('Network request failed'))).toBe('network_error')
    expect(classifyError(new Error('fetch timeout'))).toBe('network_error')
    expect(classifyError('Connection timeout')).toBe('network_error')
  })

  test('classifies authentication errors correctly', () => {
    expect(classifyError(new Error('Unauthorized access'))).toBe('authentication_error')
    expect(classifyError(new Error('Permission denied'))).toBe('authentication_error')
    expect(classifyError('403 Forbidden')).toBe('authentication_error')
  })

  test('classifies sheets connection errors correctly', () => {
    expect(classifyError(new Error('Sheet not found'))).toBe('sheets_connection_error')
    expect(classifyError(new Error('Spreadsheet access denied'))).toBe('sheets_connection_error')
    expect(classifyError('Google Sheets API error')).toBe('sheets_connection_error')
  })

  test('classifies data parsing errors correctly', () => {
    expect(classifyError(new Error('Invalid JSON format'))).toBe('data_parsing_error')
    expect(classifyError(new Error('Parse error in CSV'))).toBe('data_parsing_error')
    expect(classifyError('Malformed data structure')).toBe('data_parsing_error')
  })

  test('defaults to unknown error for unrecognized errors', () => {
    expect(classifyError(new Error('Some random error'))).toBe('unknown_error')
    expect(classifyError('Unexpected issue')).toBe('unknown_error')
  })
})

describe('Error State Creation', () => {
  test('creates error state with correct properties', () => {
    const error = new Error('Test error')
    const errorState = createErrorState('network_error', error, true)

    expect(errorState.type).toBe('network_error')
    expect(errorState.message).toBe('Test error')
    expect(errorState.hebrewMessage).toBe('שגיאת רשת - בדוק את החיבור לאינטרנט')
    expect(errorState.canRetry).toBe(true)
  })

  test('handles string errors', () => {
    const errorState = createErrorState('data_parsing_error', 'Parse failed')

    expect(errorState.message).toBe('Parse failed')
    expect(errorState.hebrewMessage).toBe('שגיאה בעיבוד הנתונים - פורמט לא תקין')
  })

  test('includes retry action when provided', () => {
    const retryFn = jest.fn()
    const errorState = createErrorState('network_error', 'Network error', true, retryFn)

    expect(errorState.retryAction).toBe(retryFn)
  })
})

describe('API Error Handling', () => {
  test('handles API errors with retry function', () => {
    const retryFn = jest.fn()
    const error = new Error('API request failed')
    const errorState = handleApiError(error, retryFn)

    expect(errorState.type).toBe('network_error')
    expect(errorState.canRetry).toBe(true)
    expect(errorState.retryAction).toBe(retryFn)
  })

  test('disables retry for authentication errors', () => {
    const error = new Error('Unauthorized')
    const errorState = handleApiError(error)

    expect(errorState.type).toBe('authentication_error')
    expect(errorState.canRetry).toBe(false)
  })
})

describe('Data Validators', () => {
  describe('Account Status Validator', () => {
    test('validates correct account status data', () => {
      const validData = {
        balance: 1000,
        lastUpdated: '2025-07-15T10:00:00Z',
        monthlyChange: -5.2,
        status: 'warning'
      }

      expect(validators.isAccountStatusData(validData)).toBe(true)
    })

    test('rejects invalid account status data', () => {
      expect(validators.isAccountStatusData(null)).toBe(false)
      expect(validators.isAccountStatusData({})).toBe(false)
      expect(validators.isAccountStatusData({
        balance: 'invalid',
        lastUpdated: '2025-07-15T10:00:00Z',
        monthlyChange: -5.2,
        status: 'warning'
      })).toBe(false)
      expect(validators.isAccountStatusData({
        balance: 1000,
        lastUpdated: '2025-07-15T10:00:00Z',
        monthlyChange: -5.2,
        status: 'invalid_status'
      })).toBe(false)
    })
  })

  describe('Tenant Payment Row Validator', () => {
    test('validates correct tenant payment row', () => {
      const validData = {
        apartment: 'דירה 1',
        month_1: '✓'
      }

      expect(validators.isTenantPaymentRow(validData)).toBe(true)
    })

    test('rejects invalid tenant payment row', () => {
      expect(validators.isTenantPaymentRow(null)).toBe(false)
      expect(validators.isTenantPaymentRow({})).toBe(false)
      expect(validators.isTenantPaymentRow({
        apartment: 123, // Should be string
        month_1: '✓'
      })).toBe(false)
    })
  })

  describe('Apartment Fee Validator', () => {
    test('validates correct apartment fee data', () => {
      const validData = {
        apartmentNumber: 1,
        ownerName: 'דייר 1',
        totalMonthlyFee: 120
      }

      expect(validators.isApartmentFee(validData)).toBe(true)
    })

    test('rejects invalid apartment fee data', () => {
      expect(validators.isApartmentFee(null)).toBe(false)
      expect(validators.isApartmentFee({})).toBe(false)
      expect(validators.isApartmentFee({
        apartmentNumber: '1', // Should be number
        ownerName: 'דייר 1',
        totalMonthlyFee: 120
      })).toBe(false)
    })
  })
})

describe('Error Recovery', () => {
  test('creates error recovery strategy', () => {
    const { createErrorRecovery } = require('@/lib/errors')
    const retryFn = jest.fn().mockResolvedValue('success')
    const fallbackFn = jest.fn().mockResolvedValue('fallback')
    const manualFn = jest.fn()

    const recovery = createErrorRecovery(retryFn, fallbackFn, manualFn)

    expect(recovery).toHaveProperty('immediate')
    expect(recovery).toHaveProperty('delayed')
    expect(recovery).toHaveProperty('fallback')
    expect(recovery).toHaveProperty('manual')
  })

  test('immediate recovery calls retry function', async () => {
    const { createErrorRecovery } = require('@/lib/errors')
    const retryFn = jest.fn().mockResolvedValue('success')
    const recovery = createErrorRecovery(retryFn)

    const result = await recovery.immediate()
    expect(result).toBe(true)
    expect(retryFn).toHaveBeenCalled()
  })

  test('handles retry function failure', async () => {
    const { createErrorRecovery } = require('@/lib/errors')
    const retryFn = jest.fn().mockRejectedValue(new Error('Retry failed'))
    const recovery = createErrorRecovery(retryFn)

    const result = await recovery.immediate()
    expect(result).toBe(false)
  })
})