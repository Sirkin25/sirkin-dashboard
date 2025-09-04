// Hebrew formatting utilities for the building management dashboard

/**
 * Format currency in Israeli Shekels with Hebrew RTL support
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format numbers with Hebrew locale
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("he-IL").format(num)
}

/**
 * Format dates in Hebrew
 */
export function formatHebrewDate(date: Date | string): string {
  try {
    const validDate = new Date(date)
    if (isNaN(validDate.getTime())) {
      return "תאריך לא תקין"
    }
    return new Intl.DateTimeFormat("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(validDate)
  } catch (error) {
    return "תאריך לא תקין"
  }
}

/**
 * Format short dates in Hebrew
 */
export function formatShortHebrewDate(date: Date | string): string {
  try {
    const validDate = new Date(date)
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
    const validDate = new Date(date)
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
 * Hebrew month names
 */
export const hebrewMonths = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
]

/**
 * Get Hebrew month name
 */
export function getHebrewMonth(monthIndex: number): string {
  return hebrewMonths[monthIndex] || ""
}

/**
 * Format apartment number with Hebrew prefix
 */
export function formatApartmentNumber(aptNumber: number | string): string {
  return `דירה ${aptNumber}`
}

/**
 * Format building status text
 */
export function getStatusText(status: "connected" | "mock" | "error"): string {
  switch (status) {
    case "connected":
      return "מחובר לגוגל שיטס"
    case "mock":
      return "נתונים לדוגמה"
    case "error":
      return "שגיאה בחיבור"
    default:
      return "לא ידוע"
  }
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
