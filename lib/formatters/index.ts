// Centralized formatting utilities for the building management dashboard

import { HEBREW_MONTHS, PAYMENT_STATUS_TEXTS, APARTMENT_TEXTS } from '@/lib/constants/hebrew'
import type { PaymentStatusDisplay, AccountHealthStatus } from '@/lib/types/api'

/**
 * Format currency in Israeli Shekels with Hebrew RTL support
 */
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) || 0 : amount
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

/**
 * Format numbers with Hebrew locale
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("he-IL").format(num)
}

/**
 * Format dates in Hebrew with proper error handling
 * Uses a stable format to prevent hydration mismatches
 */
export function formatHebrewDate(date: Date | string): string {
  try {
    const validDate = typeof date === 'string' ? new Date(date) : date
    if (isNaN(validDate.getTime())) {
      return "תאריך לא תקין"
    }
    
    // Use a more stable format that won't cause hydration issues
    const day = validDate.getDate().toString().padStart(2, '0')
    const month = (validDate.getMonth() + 1).toString().padStart(2, '0')
    const year = validDate.getFullYear()
    
    return `${day}/${month}/${year}`
  } catch (error) {
    return "תאריך לא תקין"
  }
}

/**
 * Format short dates in Hebrew
 */
export function formatShortHebrewDate(date: Date | string): string {
  try {
    const validDate = typeof date === 'string' ? new Date(date) : date
    if (isNaN(validDate.getTime())) {
      return "לא תקין"
    }
    return new Intl.DateTimeFormat("he-IL", {
      year: "2-digit",
      month: "2-digit", 
      day: "2-digit",
    }).format(validDate)
  } catch (error) {
    return "לא תקין"
  }
}

/**
 * Format month/year in Hebrew
 */
export function formatMonthYear(date: Date | string): string {
  try {
    const validDate = typeof date === 'string' ? new Date(date) : date
    if (isNaN(validDate.getTime())) {
      return "תאריך לא תקין"
    }
    return new Intl.DateTimeFormat("he-IL", {
      year: "numeric",
      month: "long",
    }).format(validDate)
  } catch (error) {
    return "תאריך לא תקין"
  }
}

/**
 * Get Hebrew month name by index
 */
export function getHebrewMonth(monthIndex: number): string {
  return HEBREW_MONTHS[monthIndex] || ""
}

/**
 * Format payment status with consistent icons and colors
 */
export function formatPaymentStatus(value: string): PaymentStatusDisplay {
  const normalizedValue = value.toLowerCase().trim()

  if (normalizedValue === "✓" || normalizedValue === "true" || normalizedValue === "שולם" || normalizedValue === "כן") {
    return { 
      icon: "✓", 
      color: "text-green-600", 
      text: PAYMENT_STATUS_TEXTS.paid 
    }
  } else if (
    normalizedValue === "✗" ||
    normalizedValue === "false" ||
    normalizedValue === "לא שולם" ||
    normalizedValue === "לא"
  ) {
    return { 
      icon: "✗", 
      color: "text-red-600", 
      text: PAYMENT_STATUS_TEXTS.overdue 
    }
  } else if (normalizedValue === "ממתין" || normalizedValue === "pending") {
    return { 
      icon: "⏳", 
      color: "text-yellow-600", 
      text: PAYMENT_STATUS_TEXTS.pending 
    }
  } else {
    return { 
      icon: "?", 
      color: "text-gray-400", 
      text: PAYMENT_STATUS_TEXTS.unknown 
    }
  }
}

/**
 * Format apartment number with Hebrew prefix
 */
export function formatApartmentNumber(aptNumber: number | string): string {
  return `${APARTMENT_TEXTS.apartment_prefix} ${aptNumber}`
}

/**
 * Format percentage with Hebrew locale
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

/**
 * Format account health status
 */
export function formatAccountStatus(balance: number): AccountHealthStatus {
  if (balance > 10000) return "healthy"
  if (balance > 5000) return "warning"
  return "critical"
}

/**
 * Parse Hebrew currency values
 */
export function parseHebrewCurrency(currencyStr: string): number {
  // Remove Hebrew currency symbols and formatting
  const cleaned = currencyStr.replace(/[₪,\s]/g, "").replace(/[^\d.-]/g, "")
  const parsed = Number.parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Parse Hebrew date strings to Date objects
 */
export function parseHebrewDate(dateStr: string): Date {
  // Handle empty or invalid input
  if (!dateStr || typeof dateStr !== "string" || dateStr.trim() === "") {
    return new Date()
  }

  const cleanDateStr = dateStr.trim()

  // Handle various Hebrew date formats
  const formats = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY
    /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY
    /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
  ]

  for (const format of formats) {
    const match = cleanDateStr.match(format)
    if (match) {
      const [, first, second, third] = match
      let year: number, month: number, day: number

      // Assume DD/MM/YYYY or DD-MM-YYYY format for Hebrew
      if (format === formats[0] || format === formats[1]) {
        day = Number.parseInt(first)
        month = Number.parseInt(second) - 1 // Month is 0-indexed
        year = Number.parseInt(third)
      } else {
        // YYYY-MM-DD format
        year = Number.parseInt(first)
        month = Number.parseInt(second) - 1 // Month is 0-indexed
        day = Number.parseInt(third)
      }

      // Validate the parsed values
      if (year >= 1900 && year <= 2100 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        const date = new Date(year, month, day)
        // Double-check that the date is valid
        if (!isNaN(date.getTime())) {
          return date
        }
      }
    }
  }

  // Try parsing as ISO string or other standard formats
  try {
    const date = new Date(cleanDateStr)
    if (!isNaN(date.getTime())) {
      return date
    }
  } catch (error) {
    // Ignore parsing errors
  }

  // Fallback to current date if all parsing fails
  return new Date()
}