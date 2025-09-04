// Standardized API response types for the building management dashboard

export interface ApiResponse<T> {
  data: T
  meta: {
    isConnected: boolean
    source: 'sheets' | 'mock' | 'error'
    lastFetched: string
    message?: string
  }
  error?: {
    code: string
    message: string
    hebrewMessage: string
    details?: any
  }
}

export interface PaymentStatus {
  paid: boolean
  amount?: number
  date?: string
  status: 'paid' | 'pending' | 'overdue'
}

export interface TenantPaymentData {
  apartment: string
  payments: Record<string, PaymentStatus> // month_1, month_2, etc.
}

export interface TenantPaymentsResponse {
  data: TenantPaymentRow[]
  year: number
  halfYear: 1 | 2
  actualMonths: string[] // The actual month names from CSV like ["Jul-25", "Aug-25"]
  statistics: {
    totalPayments: number
    totalPossible: number
    paymentRate: number
  }
}

export interface TenantPaymentRow {
  apartment: string
  month_1: string
  month_2: string
  month_3: string
  month_4: string
  month_5: string
  month_6: string
  month_7: string
  month_8: string
  month_9: string
  month_10: string
  month_11: string
  month_12: string
}

export type AccountHealthStatus = 'healthy' | 'warning' | 'critical'

export interface AccountStatusData {
  balance: number
  lastUpdated: string
  monthlyChange: number
  status: AccountHealthStatus
}

export interface AccountStatusResponse extends AccountStatusData {
  history?: AccountHistoryEntry[]
}

export interface AccountHistoryEntry {
  date: string
  balance: number
  change: number
}

export interface ApartmentFee {
  apartmentNumber: number
  ownerName: string
  apartmentSize: number
  baseFee: number
  maintenanceFee: number
  totalMonthlyFee: number
  feeType: 'owner' | 'renter'
}

export interface ApartmentFeesResponse {
  apartments: ApartmentFee[]
  totalRevenue: number
  averageFee: number
}

export interface ExpenseItem {
  id: string
  description: string
  category: string
  amount: number
  date: string
  status: 'paid' | 'pending' | 'overdue'
}

export interface ExpectedExpenseItem {
  id: string
  description: string
  category: string
  amount: number
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  recurring: boolean
}

export type ErrorType = 
  | 'network_error'
  | 'sheets_connection_error' 
  | 'data_parsing_error'
  | 'authentication_error'
  | 'unknown_error'

export interface ErrorState {
  type: ErrorType
  message: string
  hebrewMessage: string
  canRetry: boolean
  retryAction?: () => void
}

export interface LoadingState {
  isLoading: boolean
  isRefreshing: boolean
  progress?: number
  message?: string
}

export interface PaymentStatusDisplay {
  icon: string
  color: string
  text: string
}