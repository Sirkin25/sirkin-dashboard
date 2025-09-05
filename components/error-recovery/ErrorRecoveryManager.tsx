"use client"

import React, { useState, useCallback } from 'react'
import { AlertTriangle, RefreshCw, Home, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorRecoveryAction {
  id: string
  label: string
  hebrewLabel: string
  action: () => Promise<void> | void
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'outline' | 'destructive'
}

interface ErrorRecoveryManagerProps {
  error: Error
  errorId?: string
  onRecover?: () => void
  customActions?: ErrorRecoveryAction[]
  showDefaultActions?: boolean
  className?: string
}

const DEFAULT_RECOVERY_ACTIONS: ErrorRecoveryAction[] = [
  {
    id: 'refresh',
    label: 'Refresh Page',
    hebrewLabel: 'רענן דף',
    action: () => window.location.reload(),
    icon: RefreshCw,
    variant: 'default'
  },
  {
    id: 'home',
    label: 'Go Home',
    hebrewLabel: 'חזור לעמוד הבית',
    action: () => window.location.href = '/',
    icon: Home,
    variant: 'outline'
  },
  {
    id: 'clear-storage',
    label: 'Clear Storage',
    hebrewLabel: 'נקה אחסון מקומי',
    action: () => {
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    },
    icon: Settings,
    variant: 'outline'
  }
]

export function ErrorRecoveryManager({
  error,
  errorId,
  onRecover,
  customActions = [],
  showDefaultActions = true,
  className
}: ErrorRecoveryManagerProps) {
  const [isRecovering, setIsRecovering] = useState(false)
  const [recoveryAttempts, setRecoveryAttempts] = useState(0)

  const handleRecoveryAction = useCallback(async (action: ErrorRecoveryAction) => {
    setIsRecovering(true)
    setRecoveryAttempts(prev => prev + 1)

    try {
      await action.action()
      onRecover?.()
    } catch (recoveryError) {
      console.error('Recovery action failed:', recoveryError)
    } finally {
      setIsRecovering(false)
    }
  }, [onRecover])

  const allActions = [
    ...customActions,
    ...(showDefaultActions ? DEFAULT_RECOVERY_ACTIONS : [])
  ]

  const getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' => {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'medium'
    }
    
    if (message.includes('chunk') || message.includes('loading')) {
      return 'low'
    }
    
    return 'high'
  }

  const severity = getErrorSeverity(error)
  const severityColors = {
    low: 'border-yellow-200 bg-yellow-50',
    medium: 'border-orange-200 bg-orange-50',
    high: 'border-red-200 bg-red-50'
  }

  const severityTextColors = {
    low: 'text-yellow-800',
    medium: 'text-orange-800',
    high: 'text-red-800'
  }

  const severityLabels = {
    low: 'שגיאה קלה',
    medium: 'שגיאה בינונית',
    high: 'שגיאה חמורה'
  }

  return (
    <Card className={`${severityColors[severity]} ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className={`h-16 w-16 ${severityTextColors[severity]}`} />
        </div>
        <CardTitle className={`text-xl ${severityTextColors[severity]} hebrew-text`}>
          {severityLabels[severity]}
        </CardTitle>
        {errorId && (
          <div className="text-sm text-muted-foreground font-mono">
            מזהה שגיאה: {errorId}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className={`${severityTextColors[severity]} hebrew-text mb-4`}>
            אירעה שגיאה בלתי צפויה. אנא בחר פעולת שחזור:
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className={`text-left bg-white p-4 rounded border ${severityColors[severity]} mb-4`}>
              <summary className={`cursor-pointer font-medium ${severityTextColors[severity]} mb-2`}>
                פרטי שגיאה (מצב פיתוח)
              </summary>
              <div className={`text-sm ${severityTextColors[severity]} font-mono whitespace-pre-wrap`}>
                <div className="mb-2">
                  <strong>הודעה:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>מחסנית:</strong>
                    <pre className="mt-1 text-xs overflow-auto">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant={action.variant || 'default'}
                onClick={() => handleRecoveryAction(action)}
                disabled={isRecovering}
                className="flex items-center gap-2"
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span className="hebrew-text">
                  {isRecovering ? 'מבצע...' : action.hebrewLabel}
                </span>
              </Button>
            )
          })}
        </div>

        {recoveryAttempts > 0 && (
          <div className="text-center text-sm text-muted-foreground hebrew-text">
            ניסיונות שחזור: {recoveryAttempts}
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center hebrew-text">
          אם הבעיה נמשכת, אנא פנה למנהל המערכת עם מזהה השגיאה
        </div>
      </CardContent>
    </Card>
  )
}