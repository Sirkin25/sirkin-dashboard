// Date utility functions for handling both Date objects and date strings

/**
 * Safely convert a date value (Date object or string) to a Date object
 */
export function ensureDate(date: Date | string): Date {
  if (date instanceof Date) {
    // Check if the Date object is valid
    if (isNaN(date.getTime())) {
      return new Date() // Return current date if invalid
    }
    return date
  }
  
  if (typeof date === 'string' && date.trim() === '') {
    return new Date() // Return current date for empty strings
  }
  
  try {
    const newDate = new Date(date)
    if (isNaN(newDate.getTime())) {
      return new Date() // Return current date if parsing fails
    }
    return newDate
  } catch (error) {
    return new Date() // Return current date if any error occurs
  }
}

/**
 * Calculate days until a due date
 */
export function getDaysUntilDate(dueDate: Date | string): number {
  const date = ensureDate(dueDate)
  const now = new Date()
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Check if a date is urgent (within 7 days)
 */
export function isDateUrgent(dueDate: Date | string): boolean {
  return getDaysUntilDate(dueDate) <= 7
}

/**
 * Format days until due date in Hebrew
 */
export function formatDaysUntilDue(dueDate: Date | string): string {
  const days = getDaysUntilDate(dueDate)
  
  if (days < 0) return "באיחור"
  if (days === 0) return "היום"
  if (days === 1) return "מחר"
  return `בעוד ${days} ימים`
}
