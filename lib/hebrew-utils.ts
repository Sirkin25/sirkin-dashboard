// Hebrew formatting utilities for the building management dashboard
// This file is deprecated - use lib/formatters/index.ts and lib/constants/hebrew.ts instead

import { 
  formatCurrency as newFormatCurrency,
  formatNumber,
  formatHebrewDate as newFormatHebrewDate,
  formatShortHebrewDate as newFormatShortHebrewDate,
  formatMonthYear as newFormatMonthYear,
  getHebrewMonth as newGetHebrewMonth,
  formatApartmentNumber as newFormatApartmentNumber,
  formatPercentage as newFormatPercentage
} from '@/lib/formatters'
import { HEBREW_MONTHS, STATUS_MESSAGES } from '@/lib/constants/hebrew'

// Re-export from new centralized formatters for backward compatibility
export { formatNumber }

export function formatCurrency(amount: number): string {
  return newFormatCurrency(amount)
}

export function formatHebrewDate(date: Date | string): string {
  return newFormatHebrewDate(date)
}

export function formatShortHebrewDate(date: Date | string): string {
  return newFormatShortHebrewDate(date)
}

export function formatMonthYear(date: Date | string): string {
  return newFormatMonthYear(date)
}

export const hebrewMonths = HEBREW_MONTHS

export function getHebrewMonth(monthIndex: number): string {
  return newGetHebrewMonth(monthIndex)
}

export function formatApartmentNumber(aptNumber: number | string): string {
  return newFormatApartmentNumber(aptNumber)
}

export function getStatusText(status: "connected" | "mock" | "error"): string {
  switch (status) {
    case "connected":
      return STATUS_MESSAGES.connected
    case "mock":
      return STATUS_MESSAGES.mock
    case "error":
      return STATUS_MESSAGES.error
    default:
      return "לא ידוע"
  }
}

export function formatPercentage(value: number): string {
  return newFormatPercentage(value)
}
