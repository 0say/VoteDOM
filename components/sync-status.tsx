"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useVoting } from "@/contexts/voting-context"

export function SyncStatus() {
  const { contracts, currentContract } = useVoting()
  const [lastSync, setLastSync] = useState<Date>(new Date())
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced")

  useEffect(() => {
    setSyncStatus("syncing")
    const timer = setTimeout(() => {
      setSyncStatus("synced")
      setLastSync(new Date())
    }, 500)

    return () => clearTimeout(timer)
  }, [contracts, currentContract])

  return (
    <Alert
      className={`mb-4 ${
        syncStatus === "synced"
          ? "border-green-200 bg-green-50"
          : syncStatus === "syncing"
            ? "border-blue-200 bg-blue-50"
            : "border-red-200 bg-red-50"
      }`}
    >
      {syncStatus === "synced" ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : syncStatus === "syncing" ? (
        <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-600" />
      )}
      <AlertDescription
        className={
          syncStatus === "synced" ? "text-green-800" : syncStatus === "syncing" ? "text-blue-800" : "text-red-800"
        }
      >
        {syncStatus === "synced" &&
          `Sincronizado - ${contracts.length} contratos disponibles (${lastSync.toLocaleTimeString()})`}
        {syncStatus === "syncing" && "Sincronizando contratos..."}
        {syncStatus === "error" && "Error de sincronización"}
      </AlertDescription>
    </Alert>
  )
}
