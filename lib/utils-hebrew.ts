// Hebrew utility functions for building management dashboard
// This file is deprecated - use lib/formatters/index.ts and lib/constants/hebrew.ts instead

import { 
  formatCurrency as newFormatCurrency,
  formatPaymentStatus,
  formatHebrewDate as newFormatHebrewDate,
  formatShortHebrewDate as newFormatShortHebrewDate,
  formatApartmentNumber as newFormatApartmentNumber
} from '@/lib/formatters'
import { HEBREW_MONTHS } from '@/lib/constants/hebrew'

// Re-export from new centralized formatters for backward compatibility
export { HEBREW_MONTHS }

export function formatCurrency(amount: string | number): string {
  return newFormatCurrency(typeof amount === "string" ? Number.parseFloat(amount) || 0 : amount)
}

export function getPaymentStatus(value: string): { icon: string; color: string } {
  const status = formatPaymentStatus(value)
  return { icon: status.icon, color: status.color }
}

export function formatHebrewDate(date: Date): string {
  return newFormatHebrewDate(date)
}

export function formatShortHebrewDate(date: Date): string {
  return newFormatShortHebrewDate(date)
}

export function formatApartmentNumber(num: number): string {
  return newFormatApartmentNumber(num)
}
