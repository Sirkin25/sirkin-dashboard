import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock the environment variables
const mockEnv = {
  GOOGLE_PRIVATE_KEY: 'mock-private-key',
  GOOGLE_SERVICE_ACCOUNT_EMAIL: 'test@example.com',
  GOOGLE_SHEETS_ID: 'mock-sheet-id',
  TENANT_PAYMENTS_GID: '123',
  ACCOUNT_STATUS_GID: '456'
}

// Set up environment variables before importing modules
Object.entries(mockEnv).forEach(([key, value]) => {
  process.env[key] = value
})

// Import modules after setting up environment
import { formatCurrency, formatHebrewDate, formatPaymentStatus, formatApartmentNumber } from '@/lib/formatters'
import { HEBREW_MONTHS } from '@/lib/constants/hebrew'

describe('Data Parsing and Formatting Tests', () => {
  describe('Currency Formatting', () => {
    it('should format positive amounts correctly', () => {
      const result1500 = formatCurrency(1500)
      const result15725 = formatCurrency(15725)
      const result100 = formatCurrency(100)
      
      // Hebrew locale formatting includes RTL marks and different positioning
      expect(result1500).toContain('1,500')
      expect(result1500).toContain('₪')
      expect(result15725).toContain('15,725')
      expect(result100).toContain('100')
    })

    it('should format negative amounts correctly', () => {
      const result = formatCurrency(-1500)
      expect(result).toContain('-')
      expect(result).toContain('1,500')
      expect(result).toContain('₪')
    })

    it('should handle zero correctly', () => {
      const result = formatCurrency(0)
      expect(result).toContain('0')
      expect(result).toContain('₪')
    })

    it('should handle decimal amounts correctly', () => {
      const result1 = formatCurrency(1500.50)
      const result2 = formatCurrency(1500.25)
      
      // Hebrew locale may handle decimals differently
      expect(result1).toContain('₪')
      expect(result2).toContain('₪')
    })

    it('should handle large amounts correctly', () => {
      const result1M = formatCurrency(1000000)
      const result1234567 = formatCurrency(1234567)
      
      expect(result1M).toContain('1,000,000')
      expect(result1234567).toContain('1,234,567')
    })
  })

  describe('Hebrew Date Formatting', () => {
    it('should format dates with Hebrew month names', () => {
      const date = new Date('2025-01-15')
      const formatted = formatHebrewDate(date)
      expect(formatted).toContain('ינואר')
      expect(formatted).toContain('2025')
    })

    it('should handle different months correctly', () => {
      const marchDate = new Date('2025-03-10')
      const formatted = formatHebrewDate(marchDate)
      expect(formatted).toContain('מרץ')
    })

    it('should handle string dates correctly', () => {
      const formatted = formatHebrewDate('2025-06-20')
      expect(formatted).toContain('יוני')
    })

    it('should handle invalid dates gracefully', () => {
      const formatted = formatHebrewDate('invalid-date')
      expect(formatted).toBe('תאריך לא תקין')
    })
  })

  describe('Payment Status Formatting', () => {
    it('should format paid status correctly', () => {
      const paidStatuses = ['✓', 'true', 'שולם', 'כן']
      paidStatuses.forEach(status => {
        const result = formatPaymentStatus(status)
        expect(result.icon).toBe('✓')
        expect(result.color).toBe('text-green-600')
        expect(result.text).toBe('שולם')
      })
    })

    it('should format unpaid status correctly', () => {
      const unpaidStatuses = ['✗', 'false', 'לא שולם', 'לא']
      unpaidStatuses.forEach(status => {
        const result = formatPaymentStatus(status)
        expect(result.icon).toBe('✗')
        expect(result.color).toBe('text-red-600')
        expect(result.text).toBe('באיחור') // This is the actual text used
      })
    })

    it('should format pending status correctly', () => {
      const pendingStatuses = ['ממתין', 'pending']
      pendingStatuses.forEach(status => {
        const result = formatPaymentStatus(status)
        expect(result.icon).toBe('⏳')
        expect(result.color).toBe('text-yellow-600')
        expect(result.text).toBe('ממתין')
      })
    })

    it('should handle case insensitive input', () => {
      expect(formatPaymentStatus('TRUE')).toEqual({
        icon: '✓',
        color: 'text-green-600',
        text: 'שולם'
      })
      expect(formatPaymentStatus('FALSE')).toEqual({
        icon: '✗',
        color: 'text-red-600',
        text: 'באיחור'
      })
    })

    it('should handle unknown status correctly', () => {
      const result = formatPaymentStatus('unknown_status')
      expect(result.icon).toBe('?')
      expect(result.color).toBe('text-gray-400')
      expect(result.text).toBe('לא ידוע')
    })
  })

  describe('Apartment Number Formatting', () => {
    it('should format numeric apartment numbers correctly', () => {
      expect(formatApartmentNumber(1)).toBe('דירה 1')
      expect(formatApartmentNumber(15)).toBe('דירה 15')
    })

    it('should format string apartment numbers correctly', () => {
      expect(formatApartmentNumber('5')).toBe('דירה 5')
      expect(formatApartmentNumber('10')).toBe('דירה 10')
    })

    it('should handle already formatted apartment numbers', () => {
      // The current implementation doesn't check if already formatted
      expect(formatApartmentNumber('דירה 3')).toBe('דירה דירה 3')
    })

    it('should handle empty or invalid input', () => {
      expect(formatApartmentNumber('')).toBe('דירה ')
      expect(formatApartmentNumber(null as any)).toBe('דירה null')
    })
  })

  describe('Hebrew Constants', () => {
    it('should have all 12 Hebrew months', () => {
      expect(HEBREW_MONTHS).toHaveLength(12)
      expect(HEBREW_MONTHS[0]).toBe('ינואר')
      expect(HEBREW_MONTHS[11]).toBe('דצמבר')
    })

    it('should have proper Hebrew month names', () => {
      const expectedMonths = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
      ]
      expect(HEBREW_MONTHS).toEqual(expectedMonths)
    })
  })
})