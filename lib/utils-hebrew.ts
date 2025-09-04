// Hebrew utility functions for building management dashboard

export const HEBREW_MONTHS = [
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

export function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) || 0 : amount
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

export function getPaymentStatus(value: string): { icon: string; color: string } {
  const normalizedValue = value.toLowerCase().trim()

  if (normalizedValue === "✓" || normalizedValue === "true" || normalizedValue === "שולם" || normalizedValue === "כן") {
    return { icon: "✓", color: "text-green-600" }
  } else if (
    normalizedValue === "✗" ||
    normalizedValue === "false" ||
    normalizedValue === "לא שולם" ||
    normalizedValue === "לא"
  ) {
    return { icon: "✗", color: "text-red-600" }
  } else if (normalizedValue === "ממתין" || normalizedValue === "pending") {
    return { icon: "⏳", color: "text-yellow-600" }
  } else {
    return { icon: "?", color: "text-gray-400" }
  }
}

export function formatHebrewDate(date: Date): string {
  const day = date.getDate()
  const month = HEBREW_MONTHS[date.getMonth()]
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
}

export function formatShortHebrewDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear().toString().slice(-2)

  return `${day}/${month}/${year}`
}

export function formatApartmentNumber(num: number): string {
  return `דירה ${num}`
}
