import {
  formatCurrency,
  formatNumber,
  formatHebrewDate,
  formatShortHebrewDate,
  formatMonthYear,
  getHebrewMonth,
  formatPaymentStatus,
  formatApartmentNumber,
  formatPercentage,
  formatAccountStatus,
  parseHebrewCurrency,
  parseHebrewDate,
} from '@/lib/formatters'

describe('Currency Formatting', () => {
  test('formats positive numbers correctly', () => {
    expect(formatCurrency(1000)).toBe('₪1,000')
    expect(formatCurrency(1234.56)).toBe('₪1,235')
    expect(formatCurrency(0)).toBe('₪0')
  })

  test('formats negative numbers correctly', () => {
    expect(formatCurrency(-1000)).toBe('‎-₪1,000')
  })

  test('handles string input', () => {
    expect(formatCurrency('1000')).toBe('₪1,000')
    expect(formatCurrency('invalid')).toBe('₪0')
  })

  test('parses Hebrew currency strings', () => {
    expect(parseHebrewCurrency('₪1,000')).toBe(1000)
    expect(parseHebrewCurrency('1,234.56 ₪')).toBe(1234.56)
    expect(parseHebrewCurrency('invalid')).toBe(0)
    expect(parseHebrewCurrency('')).toBe(0)
  })
})

describe('Number Formatting', () => {
  test('formats numbers with Hebrew locale', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1234567)).toBe('1,234,567')
  })
})

describe('Date Formatting', () => {
  const testDate = new Date(2025, 6, 15) // July 15, 2025

  test('formats Hebrew dates correctly', () => {
    const result = formatHebrewDate(testDate)
    expect(result).toContain('יולי')
    expect(result).toContain('2025')
    expect(result).toContain('15')
  })

  test('formats short Hebrew dates correctly', () => {
    const result = formatShortHebrewDate(testDate)
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{2}/)
  })

  test('formats month/year correctly', () => {
    const result = formatMonthYear(testDate)
    expect(result).toContain('יולי')
    expect(result).toContain('2025')
  })

  test('handles invalid dates gracefully', () => {
    expect(formatHebrewDate('invalid')).toBe('תאריך לא תקין')
    expect(formatShortHebrewDate('invalid')).toBe('לא תקין')
    expect(formatMonthYear('invalid')).toBe('תאריך לא תקין')
  })

  test('handles string dates', () => {
    const result = formatHebrewDate('2025-07-15')
    expect(result).toContain('יולי')
  })

  test('parses Hebrew date strings', () => {
    expect(parseHebrewDate('15/07/2025')).toEqual(new Date(2025, 6, 15))
    expect(parseHebrewDate('15-07-2025')).toEqual(new Date(2025, 6, 15))
    expect(parseHebrewDate('2025-07-15')).toEqual(new Date(2025, 6, 15))
    
    // Invalid dates should return current date (we'll just check it's a valid date)
    const invalidResult = parseHebrewDate('invalid')
    expect(invalidResult).toBeInstanceOf(Date)
    expect(isNaN(invalidResult.getTime())).toBe(false)
  })
})

describe('Hebrew Month Names', () => {
  test('returns correct Hebrew month names', () => {
    expect(getHebrewMonth(0)).toBe('ינואר')
    expect(getHebrewMonth(6)).toBe('יולי')
    expect(getHebrewMonth(11)).toBe('דצמבר')
  })

  test('handles invalid month indices', () => {
    expect(getHebrewMonth(-1)).toBe('')
    expect(getHebrewMonth(12)).toBe('')
  })
})

describe('Payment Status Formatting', () => {
  test('formats paid status correctly', () => {
    const result = formatPaymentStatus('✓')
    expect(result.icon).toBe('✓')
    expect(result.color).toBe('text-green-600')
    expect(result.text).toBe('שולם')
  })

  test('formats unpaid status correctly', () => {
    const result = formatPaymentStatus('✗')
    expect(result.icon).toBe('✗')
    expect(result.color).toBe('text-red-600')
    expect(result.text).toBe('באיחור')
  })

  test('formats pending status correctly', () => {
    const result = formatPaymentStatus('pending')
    expect(result.icon).toBe('⏳')
    expect(result.color).toBe('text-yellow-600')
    expect(result.text).toBe('ממתין')
  })

  test('handles various input formats', () => {
    expect(formatPaymentStatus('TRUE').icon).toBe('✓')
    expect(formatPaymentStatus('false').icon).toBe('✗')
    expect(formatPaymentStatus('שולם').icon).toBe('✓')
    expect(formatPaymentStatus('לא שולם').icon).toBe('✗')
  })

  test('handles unknown status', () => {
    const result = formatPaymentStatus('unknown')
    expect(result.icon).toBe('?')
    expect(result.color).toBe('text-gray-400')
    expect(result.text).toBe('לא ידוע')
  })
})

describe('Apartment Number Formatting', () => {
  test('formats apartment numbers correctly', () => {
    expect(formatApartmentNumber(1)).toBe('דירה 1')
    expect(formatApartmentNumber('5')).toBe('דירה 5')
    expect(formatApartmentNumber(10)).toBe('דירה 10')
  })
})

describe('Percentage Formatting', () => {
  test('formats percentages correctly', () => {
    expect(formatPercentage(50)).toBe('50.0%')
    expect(formatPercentage(75.5)).toBe('75.5%')
    expect(formatPercentage(0)).toBe('0.0%')
  })
})

describe('Account Status Formatting', () => {
  test('determines healthy status correctly', () => {
    expect(formatAccountStatus(15000)).toBe('healthy')
    expect(formatAccountStatus(10001)).toBe('healthy')
  })

  test('determines warning status correctly', () => {
    expect(formatAccountStatus(7500)).toBe('warning')
    expect(formatAccountStatus(5001)).toBe('warning')
  })

  test('determines critical status correctly', () => {
    expect(formatAccountStatus(3000)).toBe('critical')
    expect(formatAccountStatus(0)).toBe('critical')
    expect(formatAccountStatus(-1000)).toBe('critical')
  })
})

describe('Edge Cases and Error Handling', () => {
  test('handles null and undefined inputs', () => {
    expect(formatCurrency(null as any)).toBe('₪0')
    expect(formatCurrency(undefined as any)).toBe('₪0')
    expect(formatHebrewDate(null as any)).toBe('תאריך לא תקין')
  })

  test('handles empty strings', () => {
    expect(parseHebrewCurrency('')).toBe(0)
    expect(formatPaymentStatus('').icon).toBe('?')
  })

  test('handles very large numbers', () => {
    expect(formatCurrency(1000000000)).toBe('₪1,000,000,000')
    expect(formatNumber(1000000000)).toBe('1,000,000,000')
  })

  test('handles decimal precision', () => {
    expect(formatCurrency(1234.567)).toBe('₪1,235') // Should round to nearest shekel
    expect(formatPercentage(33.333)).toBe('33.3%')
  })
})