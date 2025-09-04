"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatApartmentNumber, formatShortHebrewDate } from "@/lib/hebrew-utils"
import { Users, CheckCircle, Clock, AlertTriangle, Phone, Mail } from "lucide-react"

interface TenantPayment {
  apartmentNumber: number
  tenantName: string
  monthlyFee: number
  lastPaymentDate: Date | null
  status: "paid" | "pending" | "overdue"
  phone?: string
  email?: string
  balance: number
}

interface TenantPaymentsProps {
  payments: TenantPayment[]
  currentMonth: string
  onContactTenant?: (apartmentNumber: number, method: "phone" | "email") => void
  onMarkAsPaid?: (apartmentNumber: number) => void
}

export function TenantPayments({ payments, currentMonth, onContactTenant, onMarkAsPaid }: TenantPaymentsProps) {
  const paidCount = payments.filter((p) => p.status === "paid").length
  const totalPayments = payments.length
  const totalCollected = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.monthlyFee, 0)
  const totalExpected = payments.reduce((sum, p) => sum + p.monthlyFee, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success text-success-foreground"
      case "pending":
        return "bg-accent text-accent-foreground"
      case "overdue":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "שולם"
      case "pending":
        return "ממתין"
      case "overdue":
        return "באיחור"
      default:
        return "לא ידוע"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="hebrew-text flex items-center gap-2">
          <Users className="h-5 w-5" />
          תשלומי דיירים - {currentMonth}
        </CardTitle>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-success/10 rounded-lg">
            <div className="text-2xl font-bold text-success hebrew-numbers">
              {paidCount}/{totalPayments}
            </div>
            <div className="text-xs text-muted-foreground hebrew-text">דירות שילמו</div>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold currency-hebrew">{formatCurrency(totalCollected)}</div>
            <div className="text-xs text-muted-foreground hebrew-text">נגבה</div>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold currency-hebrew">{formatCurrency(totalExpected - totalCollected)}</div>
            <div className="text-xs text-muted-foreground hebrew-text">נותר לגבות</div>
          </div>

          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <div className="text-lg font-bold text-primary">{((paidCount / totalPayments) * 100).toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground hebrew-text">אחוז גביה</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {payments.map((payment) => (
            <div key={payment.apartmentNumber} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(payment.status)}
                  <span className="font-medium hebrew-text">{formatApartmentNumber(payment.apartmentNumber)}</span>
                </div>

                <div>
                  <div className="font-medium hebrew-text">{payment.tenantName}</div>
                  <div className="text-sm text-muted-foreground">
                    {payment.lastPaymentDate ? (
                      <span className="hebrew-text">תשלום אחרון: {formatShortHebrewDate(payment.lastPaymentDate)}</span>
                    ) : (
                      <span className="hebrew-text">אין תשלומים קודמים</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-semibold currency-hebrew">{formatCurrency(payment.monthlyFee)}</div>
                  {payment.balance !== 0 && (
                    <div className={`text-sm ${payment.balance > 0 ? "text-destructive" : "text-success"}`}>
                      <span className="hebrew-text">יתרה: </span>
                      <span className="currency-hebrew">{formatCurrency(Math.abs(payment.balance))}</span>
                    </div>
                  )}
                </div>

                <Badge className={getStatusColor(payment.status)}>
                  <span className="hebrew-text">{getStatusText(payment.status)}</span>
                </Badge>

                <div className="flex gap-1">
                  {payment.status !== "paid" && onMarkAsPaid && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkAsPaid(payment.apartmentNumber)}
                      className="hebrew-text"
                    >
                      סמן כשולם
                    </Button>
                  )}

                  {onContactTenant && (
                    <>
                      {payment.phone && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onContactTenant(payment.apartmentNumber, "phone")}
                          className="h-8 w-8 p-0"
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      )}
                      {payment.email && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onContactTenant(payment.apartmentNumber, "email")}
                          className="h-8 w-8 p-0"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
