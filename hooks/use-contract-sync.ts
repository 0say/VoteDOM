"use client"

import { useEffect, useCallback } from "react"
import { useVoting } from "@/contexts/voting-context"

export function useContractSync() {
  const { contracts, updateContracts } = useVoting()

  const syncFromStorage = useCallback(() => {
    const savedContracts = localStorage.getItem("voting-contracts")
    if (savedContracts) {
      try {
        const parsedContracts = JSON.parse(savedContracts)
        updateContracts(parsedContracts)
        console.log("Contracts synced from storage:", parsedContracts.length)
      } catch (error) {
        console.error("Error syncing contracts from storage:", error)
      }
    }
  }, [updateContracts])

  const forceSync = useCallback(() => {
    console.log("Forcing contract sync...")
    syncFromStorage()
  }, [syncFromStorage])

  useEffect(() => {
    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "voting-contracts") {
        console.log("Storage change detected, syncing contracts...")
        syncFromStorage()
      }
    }

    // Listen for custom sync events
    const handleCustomSync = () => {
      console.log("Custom sync event detected")
      syncFromStorage()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("sync-contracts", handleCustomSync)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("sync-contracts", handleCustomSync)
    }
  }, [syncFromStorage])

  return { forceSync, contracts }
}
