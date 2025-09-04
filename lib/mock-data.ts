// Mock data for Hebrew building management dashboard

export const mockAccountStatus = {
  balance: 2000,
  lastUpdated: new Date(2025, 6, 15), // 15/7/25
  monthlyChange: -8.5,
  status: "warning" as const,
  isConnected: false,
}

export const mockExpenses = [
  {
    id: "1",
    description: "ניקיון",
    category: "ניקיון",
    amount: 400,
    date: new Date(2025, 5, 18), // 18/6/25
    status: "paid" as const,
  },
  {
    id: "2",
    description: "חשמל",
    category: "חשמל",
    amount: 300,
    date: new Date(2025, 5, 18), // 18/6/25
    status: "paid" as const,
  },
  {
    id: "3",
    description: "מים",
    category: "מים",
    amount: 100,
    date: new Date(2025, 5, 18), // 18/6/25
    status: "paid" as const,
  },
  {
    id: "4",
    description: "ניקיון",
    category: "ניקיון",
    amount: 400,
    date: new Date(2025, 6, 15), // 15/7/25
    status: "paid" as const,
  },
  {
    id: "5",
    description: "חשמל",
    category: "חשמל",
    amount: 300,
    date: new Date(2025, 6, 22), // 22/7/25
    status: "paid" as const,
  },
  {
    id: "6",
    description: "מים",
    category: "מים",
    amount: 100,
    date: new Date(2025, 6, 22), // 22/7/25
    status: "paid" as const,
  },
  {
    id: "7",
    description: "גנן",
    category: "גינון",
    amount: 450,
    date: new Date(2025, 6, 22), // 22/7/25
    status: "paid" as const,
  },
]

export const mockExpectedExpenses = [
  {
    id: "1",
    description: "תיקון מעלית",
    category: "תחזוקה",
    amount: 2000,
    dueDate: new Date(2025, 6, 31), // Jul-25
    priority: "high" as const,
    recurring: false,
  },
  {
    id: "2",
    description: "צבע לבניין",
    category: "שיפוצים",
    amount: 5000,
    dueDate: new Date(2025, 7, 31), // Aug-25
    priority: "medium" as const,
    recurring: false,
  },
  {
    id: "3",
    description: "שדרוג אינטרקום",
    category: "טכנולוגיה",
    amount: 1500,
    dueDate: new Date(2025, 8, 30), // Sep-25
    priority: "low" as const,
    recurring: false,
  },
]

export const mockApartmentFees = [
  {
    apartmentNumber: 1,
    ownerName: "דייר 1",
    apartmentSize: 47,
    baseFee: 94,
    maintenanceFee: 27,
    totalMonthlyFee: 121,
    feeType: "owner" as const,
  },
  {
    apartmentNumber: 2,
    ownerName: "דייר 2",
    apartmentSize: 49,
    baseFee: 98,
    maintenanceFee: 28,
    totalMonthlyFee: 126,
    feeType: "owner" as const,
  },
  {
    apartmentNumber: 3,
    ownerName: "דייר 3",
    apartmentSize: 61,
    baseFee: 122,
    maintenanceFee: 35,
    totalMonthlyFee: 157,
    feeType: "owner" as const,
  },
  {
    apartmentNumber: 4,
    ownerName: "דייר 4",
    apartmentSize: 29,
    baseFee: 58,
    maintenanceFee: 17,
    totalMonthlyFee: 75,
    feeType: "renter" as const,
  },
  {
    apartmentNumber: 5,
    ownerName: "דייר 5",
    apartmentSize: 47,
    baseFee: 94,
    maintenanceFee: 27,
    totalMonthlyFee: 121,
    feeType: "owner" as const,
  },
  {
    apartmentNumber: 6,
    ownerName: "דייר 6",
    apartmentSize: 49,
    baseFee: 98,
    maintenanceFee: 28,
    totalMonthlyFee: 126,
    feeType: "owner" as const,
  },
  {
    apartmentNumber: 7,
    ownerName: "דייר 7",
    apartmentSize: 61,
    baseFee: 122,
    maintenanceFee: 35,
    totalMonthlyFee: 157,
    feeType: "owner" as const,
  },
  {
    apartmentNumber: 8,
    ownerName: "דייר 8",
    apartmentSize: 29,
    baseFee: 58,
    maintenanceFee: 17,
    totalMonthlyFee: 75,
    feeType: "renter" as const,
  },
  {
    apartmentNumber: 9,
    ownerName: "דייר 9",
    apartmentSize: 47,
    baseFee: 94,
    maintenanceFee: 27,
    totalMonthlyFee: 121,
    feeType: "owner" as const,
  },
  {
    apartmentNumber: 10,
    ownerName: "דייר 10",
    apartmentSize: 49,
    baseFee: 98,
    maintenanceFee: 28,
    totalMonthlyFee: 126,
    feeType: "owner" as const,
  },
  {
    apartmentNumber: 11,
    ownerName: "דייר 11",
    apartmentSize: 61,
    baseFee: 122,
    maintenanceFee: 35,
    totalMonthlyFee: 157,
    feeType: "owner" as const,
  },
  {
    apartmentNumber: 12,
    ownerName: "דייר 12",
    apartmentSize: 29,
    baseFee: 58,
    maintenanceFee: 17,
    totalMonthlyFee: 75,
    feeType: "renter" as const,
  },
  {
    apartmentNumber: 13,
    ownerName: "דייר 13",
    apartmentSize: 47,
    baseFee: 94,
    maintenanceFee: 27,
    totalMonthlyFee: 121,
    feeType: "owner" as const,
  },
  {
    apartmentNumber: 14,
    ownerName: "דייר 14",
    apartmentSize: 49,
    baseFee: 98,
    maintenanceFee: 28,
    totalMonthlyFee: 126,
    feeType: "owner" as const,
  },
  {
    apartmentNumber: 15,
    ownerName: "דייר 15",
    apartmentSize: 61,
    baseFee: 122,
    maintenanceFee: 35,
    totalMonthlyFee: 157,
    feeType: "owner" as const,
  },
  {
    apartmentNumber: 16,
    ownerName: "דייר 16",
    apartmentSize: 29,
    baseFee: 58,
    maintenanceFee: 17,
    totalMonthlyFee: 75,
    feeType: "renter" as const,
  },
]

export const mockTenantPayments = [
  {
    apartmentNumber: 1,
    tenantName: "דייר 1",
    monthlyFee: 121,
    lastPaymentDate: new Date(2025, 6, 1),
    status: "paid" as const,
    balance: 0,
  },
  {
    apartmentNumber: 2,
    tenantName: "דייר 2",
    monthlyFee: 126,
    lastPaymentDate: new Date(2025, 6, 1),
    status: "paid" as const,
    balance: 0,
  },
  {
    apartmentNumber: 3,
    tenantName: "דייר 3",
    monthlyFee: 157,
    lastPaymentDate: new Date(2025, 6, 1),
    status: "paid" as const,
    balance: 0,
  },
  {
    apartmentNumber: 4,
    tenantName: "דייר 4",
    monthlyFee: 75,
    lastPaymentDate: null,
    status: "overdue" as const,
    balance: 225,
  }, // 3 months overdue
  {
    apartmentNumber: 5,
    tenantName: "דייר 5",
    monthlyFee: 121,
    lastPaymentDate: new Date(2025, 6, 1),
    status: "paid" as const,
    balance: 0,
  },
  {
    apartmentNumber: 6,
    tenantName: "דייר 6",
    monthlyFee: 126,
    lastPaymentDate: null,
    status: "overdue" as const,
    balance: 378,
  }, // 3 months overdue
  {
    apartmentNumber: 7,
    tenantName: "דייר 7",
    monthlyFee: 157,
    lastPaymentDate: new Date(2025, 6, 1),
    status: "paid" as const,
    balance: 0,
  },
  {
    apartmentNumber: 8,
    tenantName: "דייר 8",
    monthlyFee: 75,
    lastPaymentDate: null,
    status: "overdue" as const,
    balance: 225,
  }, // 3 months overdue
  {
    apartmentNumber: 9,
    tenantName: "דייר 9",
    monthlyFee: 121,
    lastPaymentDate: new Date(2025, 6, 1),
    status: "paid" as const,
    balance: 0,
  },
  {
    apartmentNumber: 10,
    tenantName: "דייר 10",
    monthlyFee: 126,
    lastPaymentDate: null,
    status: "overdue" as const,
    balance: 378,
  }, // 3 months overdue
  {
    apartmentNumber: 11,
    tenantName: "דייר 11",
    monthlyFee: 157,
    lastPaymentDate: new Date(2025, 6, 1),
    status: "paid" as const,
    balance: 0,
  },
  {
    apartmentNumber: 12,
    tenantName: "דייר 12",
    monthlyFee: 75,
    lastPaymentDate: null,
    status: "overdue" as const,
    balance: 225,
  }, // 3 months overdue
]
