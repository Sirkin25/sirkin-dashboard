// Mock data for Hebrew building management dashboard

export const mockAccountStatus = {
  balance: 45000,
  lastUpdated: new Date(),
  monthlyChange: 5.2,
  status: "healthy" as const,
  isConnected: false,
}

export const mockExpenses = [
  {
    id: "1",
    description: "תחזוקת מעלית",
    category: "תחזוקה",
    amount: 2500,
    date: new Date(2024, 11, 15),
    status: "paid" as const,
  },
  {
    id: "2",
    description: "חשמל מדרגות",
    category: "שירותים",
    amount: 450,
    date: new Date(2024, 11, 10),
    status: "paid" as const,
  },
  {
    id: "3",
    description: "שירותי ניקיון",
    category: "ניקיון",
    amount: 800,
    date: new Date(2024, 11, 5),
    status: "pending" as const,
  },
]

export const mockExpectedExpenses = [
  {
    id: "1",
    description: "ביטוח בניין",
    category: "ביטוח",
    amount: 1800,
    dueDate: new Date(2024, 11, 25),
    priority: "high" as const,
    recurring: true,
  },
  {
    id: "2",
    description: "תחזוקת גינה",
    category: "תחזוקה",
    amount: 600,
    dueDate: new Date(2024, 11, 30),
    priority: "medium" as const,
    recurring: true,
  },
  {
    id: "3",
    description: "תיקון דלת כניסה",
    category: "תיקונים",
    amount: 1200,
    dueDate: new Date(2025, 0, 5),
    priority: "low" as const,
    recurring: false,
  },
]

export const mockTenantPayments = [
  {
    apartmentNumber: 1,
    tenantName: "משה כהן",
    monthlyFee: 1200,
    lastPaymentDate: new Date(2024, 11, 1),
    status: "paid" as const,
    phone: "050-1234567",
    email: "moshe@example.com",
    balance: 0,
  },
  {
    apartmentNumber: 2,
    tenantName: "שרה לוי",
    monthlyFee: 1350,
    lastPaymentDate: new Date(2024, 10, 28),
    status: "pending" as const,
    phone: "052-9876543",
    email: "sarah@example.com",
    balance: 1350,
  },
  {
    apartmentNumber: 3,
    tenantName: "דוד ישראלי",
    monthlyFee: 1100,
    lastPaymentDate: new Date(2024, 9, 15),
    status: "overdue" as const,
    phone: "054-5555555",
    balance: 2200,
  },
]

export const mockApartmentFees = [
  {
    apartmentNumber: 1,
    ownerName: "משה כהן",
    apartmentSize: 85,
    baseFee: 600,
    maintenanceFee: 300,
    elevatorFee: 150,
    cleaningFee: 100,
    insuranceFee: 50,
    totalMonthlyFee: 1200,
    specialAssessments: 0,
    feeType: "owner" as const,
  },
  {
    apartmentNumber: 2,
    ownerName: "שרה לוי",
    apartmentSize: 95,
    baseFee: 700,
    maintenanceFee: 350,
    elevatorFee: 150,
    cleaningFee: 100,
    insuranceFee: 50,
    totalMonthlyFee: 1350,
    specialAssessments: 200,
    feeType: "renter" as const,
  },
  {
    apartmentNumber: 3,
    ownerName: "דוד ישראלי",
    apartmentSize: 75,
    baseFee: 550,
    maintenanceFee: 280,
    elevatorFee: 150,
    cleaningFee: 70,
    insuranceFee: 50,
    totalMonthlyFee: 1100,
    specialAssessments: 0,
    feeType: "owner" as const,
  },
]
