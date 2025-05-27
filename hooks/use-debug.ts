"use client"

import { useState, useCallback } from "react"

export function useDebug() {
  const [showDebugCards, setShowDebugCards] = useState(false)
  const [showConsoleDebug, setShowConsoleDebug] = useState(false)

  const debugLog = useCallback(
    (message: string, ...args: any[]) => {
      if (showConsoleDebug) {
        console.log(message, ...args)
      }
    },
    [showConsoleDebug],
  )

  const debugError = useCallback(
    (message: string, ...args: any[]) => {
      if (showConsoleDebug) {
        console.error(message, ...args)
      }
    },
    [showConsoleDebug],
  )

  const debugWarn = useCallback(
    (message: string, ...args: any[]) => {
      if (showConsoleDebug) {
        console.warn(message, ...args)
      }
    },
    [showConsoleDebug],
  )

  return {
    showDebugCards,
    setShowDebugCards,
    showConsoleDebug,
    setShowConsoleDebug,
    debugLog,
    debugError,
    debugWarn,
  }
}
