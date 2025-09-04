"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatApartmentNumber } from "@/lib/hebrew-utils"
import { Building, Calculator, Download, Settings } from "lucide-react"

interface ApartmentFee {
  apartmentNumber: number
  ownerName: string
  apartmentSize: number // in square meters
  baseFee: number
  maintenanceFee: number
  elevatorFee: number
  cleaningFee: number
  insuranceFee: number
  totalMonthlyFee: number
  specialAssessments: number
  feeType: "owner" | "renter"
}

interface ApartmentFeesProps {
  fees: ApartmentFee[]
  buildingTotalArea: number
  onUpdateFees?: () => void
  onExportFees?: () => void
}

export function ApartmentFees({ fees, buildingTotalArea, onUpdateFees, onExportFees }: ApartmentFeesProps) {
  const totalMonthlyRevenue = fees.reduce((sum, fee) => sum + fee.totalMonthlyFee, 0)
  const averageFeePerSqm = totalMonthlyRevenue / buildingTotalArea

  const getFeeBreakdown = (fee: ApartmentFee) => [
    { label: "דמי בסיס", amount: fee.baseFee },
    { label: "תחזוקה", amount: fee.maintenanceFee },
    { label: "מעלית", amount: fee.elevatorFee },
    { label: "ניקיון", amount: fee.cleaningFee },
    { label: "ביטוח", amount: fee.insuranceFee },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="hebrew-text flex items-center gap-2">
            <Building className="h-5 w-5" />
            דמי ועד הבית
          </CardTitle>

          <div className="flex gap-2">
            {onUpdateFees && (
              <Button variant="outline" size="sm" onClick={onUpdateFees} className="gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                <span className="hebrew-text">עדכן דמים</span>
              </Button>
            )}
            {onExportFees && (
              <Button variant="outline" size="sm" onClick={onExportFees} className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                <span className="hebrew-text">ייצא לאקסל</span>
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <div className="text-xl font-bold text-primary currency-hebrew">{formatCurrency(totalMonthlyRevenue)}</div>
            <div className="text-xs text-muted-foreground hebrew-text">הכנסה חודשית</div>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-xl font-bold currency-hebrew">{formatCurrency(averageFeePerSqm)}</div>
            <div className="text-xs text-muted-foreground hebrew-text">ממוצע למ"ר</div>
          </div>

          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-xl font-bold hebrew-numbers">{fees.length}</div>
            <div className="text-xs text-muted-foreground hebrew-text">דירות בבניין</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {fees.map((fee) => (
            <Card key={fee.apartmentNumber} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold hebrew-text">{formatApartmentNumber(fee.apartmentNumber)}</span>
                    <Badge variant={fee.feeType === "owner" ? "default" : "secondary"}>
                      <span className="hebrew-text">{fee.feeType === "owner" ? "בעלים" : "שוכר"}</span>
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground hebrew-text">
                    {fee.ownerName} • {fee.apartmentSize} מ"ר
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-primary currency-hebrew">
                    {formatCurrency(fee.totalMonthlyFee)}
                  </div>
                  <div className="text-xs text-muted-foreground hebrew-text">
                    {formatCurrency(fee.totalMonthlyFee / fee.apartmentSize)} למ"ר
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
                {getFeeBreakdown(fee).map((item, index) => (
                  <div key={index} className="text-center p-2 bg-muted/30 rounded">
                    <div className="text-xs text-muted-foreground hebrew-text">{item.label}</div>
                    <div className="font-medium currency-hebrew">{formatCurrency(item.amount)}</div>
                  </div>
                ))}
              </div>

              {/* Special Assessments */}
              {fee.specialAssessments > 0 && (
                <div className="flex items-center justify-between p-2 bg-accent/10 rounded">
                  <span className="text-sm hebrew-text">הטלות מיוחדות</span>
                  <span className="font-medium text-accent currency-hebrew">
                    +{formatCurrency(fee.specialAssessments)}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-3">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Calculator className="h-4 w-4" />
                  <span className="hebrew-text">חשב מחדש</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
