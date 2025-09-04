import {
  HEBREW_MONTHS,
  HEBREW_MONTH_ABBREVIATIONS,
  ERROR_MESSAGES,
  STATUS_MESSAGES,
  PAYMENT_STATUS_TEXTS,
  ACCOUNT_STATUS_TEXTS,
  PRIORITY_TEXTS,
  CATEGORY_TEXTS,
  APARTMENT_TEXTS,
} from '@/lib/constants/hebrew'

describe('Hebrew Constants', () => {
  describe('Hebrew Months', () => {
    test('has correct number of months', () => {
      expect(HEBREW_MONTHS).toHaveLength(12)
      expect(HEBREW_MONTH_ABBREVIATIONS).toHaveLength(12)
    })

    test('contains expected month names', () => {
      expect(HEBREW_MONTHS[0]).toBe('ינואר')
      expect(HEBREW_MONTHS[6]).toBe('יולי')
      expect(HEBREW_MONTHS[11]).toBe('דצמבר')
    })

    test('contains expected month abbreviations', () => {
      expect(HEBREW_MONTH_ABBREVIATIONS[0]).toBe('ינו')
      expect(HEBREW_MONTH_ABBREVIATIONS[6]).toBe('יול')
      expect(HEBREW_MONTH_ABBREVIATIONS[11]).toBe('דצמ')
    })
  })

  describe('Error Messages', () => {
    test('has messages for all error types', () => {
      expect(ERROR_MESSAGES.network_error).toBeDefined()
      expect(ERROR_MESSAGES.sheets_connection_error).toBeDefined()
      expect(ERROR_MESSAGES.data_parsing_error).toBeDefined()
      expect(ERROR_MESSAGES.authentication_error).toBeDefined()
      expect(ERROR_MESSAGES.unknown_error).toBeDefined()
    })

    test('messages are in Hebrew', () => {
      expect(ERROR_MESSAGES.network_error).toContain('שגיאת רשת')
      expect(ERROR_MESSAGES.sheets_connection_error).toContain('גוגל שיטס')
      expect(ERROR_MESSAGES.data_parsing_error).toContain('עיבוד הנתונים')
    })
  })

  describe('Status Messages', () => {
    test('has all required status messages', () => {
      expect(STATUS_MESSAGES.connected).toBeDefined()
      expect(STATUS_MESSAGES.mock).toBeDefined()
      expect(STATUS_MESSAGES.error).toBeDefined()
      expect(STATUS_MESSAGES.loading).toBeDefined()
      expect(STATUS_MESSAGES.refreshing).toBeDefined()
      expect(STATUS_MESSAGES.no_data).toBeDefined()
    })

    test('messages are in Hebrew', () => {
      expect(STATUS_MESSAGES.connected).toContain('מחובר')
      expect(STATUS_MESSAGES.loading).toContain('טוען')
      expect(STATUS_MESSAGES.no_data).toContain('אין נתונים')
    })
  })

  describe('Payment Status Texts', () => {
    test('has all payment status options', () => {
      expect(PAYMENT_STATUS_TEXTS.paid).toBeDefined()
      expect(PAYMENT_STATUS_TEXTS.pending).toBeDefined()
      expect(PAYMENT_STATUS_TEXTS.overdue).toBeDefined()
      expect(PAYMENT_STATUS_TEXTS.unknown).toBeDefined()
    })

    test('texts are in Hebrew', () => {
      expect(PAYMENT_STATUS_TEXTS.paid).toBe('שולם')
      expect(PAYMENT_STATUS_TEXTS.pending).toBe('ממתין')
      expect(PAYMENT_STATUS_TEXTS.overdue).toBe('באיחור')
    })
  })

  describe('Account Status Texts', () => {
    test('has all account status options', () => {
      expect(ACCOUNT_STATUS_TEXTS.healthy).toBeDefined()
      expect(ACCOUNT_STATUS_TEXTS.warning).toBeDefined()
      expect(ACCOUNT_STATUS_TEXTS.critical).toBeDefined()
    })

    test('texts are in Hebrew', () => {
      expect(ACCOUNT_STATUS_TEXTS.healthy).toBe('מצב תקין')
      expect(ACCOUNT_STATUS_TEXTS.warning).toBe('דורש תשומת לב')
      expect(ACCOUNT_STATUS_TEXTS.critical).toBe('מצב קריטי')
    })
  })

  describe('Priority Texts', () => {
    test('has all priority levels', () => {
      expect(PRIORITY_TEXTS.high).toBeDefined()
      expect(PRIORITY_TEXTS.medium).toBeDefined()
      expect(PRIORITY_TEXTS.low).toBeDefined()
    })

    test('texts are in Hebrew', () => {
      expect(PRIORITY_TEXTS.high).toBe('גבוה')
      expect(PRIORITY_TEXTS.medium).toBe('בינוני')
      expect(PRIORITY_TEXTS.low).toBe('נמוך')
    })
  })

  describe('Category Texts', () => {
    test('has common building management categories', () => {
      expect(CATEGORY_TEXTS.cleaning).toBe('ניקיון')
      expect(CATEGORY_TEXTS.electricity).toBe('חשמל')
      expect(CATEGORY_TEXTS.water).toBe('מים')
      expect(CATEGORY_TEXTS.maintenance).toBe('תחזוקה')
      expect(CATEGORY_TEXTS.security).toBe('אבטחה')
    })

    test('includes other category', () => {
      expect(CATEGORY_TEXTS.other).toBe('אחר')
    })
  })

  describe('Apartment Texts', () => {
    test('has apartment-related texts', () => {
      expect(APARTMENT_TEXTS.owner).toBe('בעלים')
      expect(APARTMENT_TEXTS.renter).toBe('שוכר')
      expect(APARTMENT_TEXTS.apartment_prefix).toBe('דירה')
    })
  })

  describe('Text Consistency', () => {
    test('all texts are non-empty strings', () => {
      const allTexts = [
        ...Object.values(ERROR_MESSAGES),
        ...Object.values(STATUS_MESSAGES),
        ...Object.values(PAYMENT_STATUS_TEXTS),
        ...Object.values(ACCOUNT_STATUS_TEXTS),
        ...Object.values(PRIORITY_TEXTS),
        ...Object.values(CATEGORY_TEXTS),
        ...Object.values(APARTMENT_TEXTS),
      ]

      allTexts.forEach(text => {
        expect(typeof text).toBe('string')
        expect(text.length).toBeGreaterThan(0)
      })
    })

    test('Hebrew months are properly ordered', () => {
      // Test that months follow the correct calendar order
      expect(HEBREW_MONTHS[0]).toBe('ינואר') // January
      expect(HEBREW_MONTHS[1]).toBe('פברואר') // February
      expect(HEBREW_MONTHS[11]).toBe('דצמבר') // December
    })
  })
})