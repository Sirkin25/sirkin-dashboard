"use client"

import { Clock, Pause, Play, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"
import { useVisibilityDetection } from "@/hooks/use-visibility-detection"

interface AutoRefreshIndicatorProps {
  className?: string
  showControls?: boolean
}

export function AutoRefreshIndicator({ 
  className, 
  showControls = false 
}: AutoRefreshIndicatorProps) {
  const {
    isEnabled,
    isRunning,
    isPaused,
    nextRefreshIn,
    failedAttempts,
    enable,
    disable,
    pause,
    resume,
    resetFailures
  } = useAutoRefresh()

  const { isOnline, isVisible } = useVisibilityDetection()

  const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000)
    return `${seconds}ש`
  }

  const getStatusText = (): string => {
    if (!isEnabled) return "רענון אוטומטי כבוי"
    if (!isOnline) return "אין חיבור לאינטרנט"
    if (!isVisible) return "הכרטיסייה לא פעילה"
    if (failedAttempts > 0) return `${failedAttempts} כשלונות`
    if (isPaused) return "רענון מושהה"
    if (isRunning && nextRefreshIn > 0) return `רענון בעוד ${formatTimeRemaining(nextRefreshIn)}`
    return "רענון אוטומטי פעיל"
  }

  const getStatusColor = (): string => {
    if (!isEnabled || !isOnline || failedAttempts > 0) return "text-red-500"
    if (isPaused || !isVisible) return "text-yellow-500"
    return "text-green-500"
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-3 w-3" />
    if (!isEnabled || isPaused) return <Pause className="h-3 w-3" />
    if (isRunning) return <Clock className="h-3 w-3" />
    return <Play className="h-3 w-3" />
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <div className={getStatusColor()}>
          {getStatusIcon()}
        </div>
        <span className={`text-xs ${getStatusColor()} hebrew-text`}>
          {getStatusText()}
        </span>
      </div>

      {showControls && (
        <div className="flex items-center gap-1">
          {isEnabled ? (
            <>
              {isPaused ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resume}
                  className="h-6 px-2 text-xs"
                  title="המשך רענון אוטומטי"
                >
                  <Play className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={pause}
                  className="h-6 px-2 text-xs"
                  title="השהה רענון אוטומטי"
                >
                  <Pause className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={disable}
                className="h-6 px-2 text-xs hebrew-text"
                title="כבה רענון אוטומטי"
              >
                כבה
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={enable}
              className="h-6 px-2 text-xs hebrew-text"
              title="הפעל רענון אוטומטי"
            >
              הפעל
            </Button>
          )}

          {failedAttempts > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFailures}
              className="h-6 px-2 text-xs text-red-500 hebrew-text"
              title="אפס כשלונות"
            >
              אפס
            </Button>
          )}
        </div>
      )}
    </div>
  )
}