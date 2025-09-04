// Hebrew constants and text mappings for the building management dashboard

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
] as const

export const HEBREW_MONTH_ABBREVIATIONS = [
  "ינו",
  "פבר",
  "מרץ", 
  "אפר",
  "מאי",
  "יונ",
  "יול",
  "אוג",
  "ספט",
  "אוק",
  "נוב",
  "דצמ",
] as const

export const ERROR_MESSAGES = {
  network_error: 'שגיאת רשת - בדוק את החיבור לאינטרנט',
  sheets_connection_error: 'שגיאה בחיבור לגוגל שיטס - בדוק הרשאות',
  data_parsing_error: 'שגיאה בעיבוד הנתונים - פורמט לא תקין',
  authentication_error: 'שגיאת אימות - בדוק את פרטי הגישה',
  unknown_error: 'שגיאה לא ידועה - נסה שוב מאוחר יותר'
} as const

export const STATUS_MESSAGES = {
  connected: 'מחובר לגוגל שיטס',
  mock: 'נתונים לדוגמה',
  error: 'שגיאה בחיבור',
  loading: 'טוען נתונים...',
  refreshing: 'מרענן נתונים...',
  no_data: 'אין נתונים זמינים'
} as const

export const PAYMENT_STATUS_TEXTS = {
  paid: 'שולם',
  pending: 'ממתין',
  overdue: 'באיחור',
  unknown: 'לא ידוע'
} as const

export const ACCOUNT_STATUS_TEXTS = {
  healthy: 'מצב תקין',
  warning: 'דורש תשומת לב', 
  critical: 'מצב קריטי'
} as const

export const PRIORITY_TEXTS = {
  high: 'גבוה',
  medium: 'בינוני',
  low: 'נמוך'
} as const

export const CATEGORY_TEXTS = {
  cleaning: 'ניקיון',
  electricity: 'חשמל',
  water: 'מים',
  maintenance: 'תחזוקה',
  gardening: 'גינון',
  security: 'אבטחה',
  insurance: 'ביטוח',
  management: 'ניהול',
  repairs: 'תיקונים',
  upgrades: 'שדרוגים',
  other: 'אחר'
} as const

export const APARTMENT_TEXTS = {
  owner: 'בעלים',
  renter: 'שוכר',
  apartment_prefix: 'דירה'
} as const