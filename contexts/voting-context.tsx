"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { VotingContract } from "@/types/voting"
import { DEFAULT_CONTRACTS } from "@/lib/contracts"

interface VotingContextType {
  contracts: VotingContract[]
  currentContract: VotingContract
  setCurrentContract: (contract: VotingContract) => void
  updateContracts: (contracts: VotingContract[]) => void
}

const VotingContext = createContext<VotingContextType | undefined>(undefined)

export function VotingProvider({ children }: { children: React.ReactNode }) {
  const [contracts, setContracts] = useState<VotingContract[]>(DEFAULT_CONTRACTS)
  const [currentContract, setCurrentContract] = useState<VotingContract>(DEFAULT_CONTRACTS[0])

  useEffect(() => {
    const savedContracts = localStorage.getItem("voting-contracts")
    if (savedContracts) {
      const parsedContracts = JSON.parse(savedContracts)
      setContracts(parsedContracts)

      const activeContract = parsedContracts.find((c: VotingContract) => c.isActive) || parsedContracts[0]
      if (activeContract) {
        setCurrentContract(activeContract)
      }
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      const savedContracts = localStorage.getItem("voting-contracts")
      if (savedContracts) {
        const parsedContracts = JSON.parse(savedContracts)
        setContracts(parsedContracts)

        // Actualizar contrato actual si es necesario
        const activeContract = parsedContracts.find((c: VotingContract) => c.isActive)
        if (activeContract && activeContract.address !== currentContract.address) {
          setCurrentContract(activeContract)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [currentContract.address])

  const updateContracts = (newContracts: VotingContract[]) => {
    setContracts(newContracts)
    localStorage.setItem("voting-contracts", JSON.stringify(newContracts))

    // Forzar actualización del contrato actual si hay uno activo
    const activeContract = newContracts.find((c) => c.isActive)
    if (activeContract) {
      setCurrentContract(activeContract)
    }
  }

  return (
    <VotingContext.Provider
      value={{
        contracts,
        currentContract,
        setCurrentContract,
        updateContracts,
      }}
    >
      {children}
    </VotingContext.Provider>
  )
}

export function useVoting() {
  const context = useContext(VotingContext)
  if (context === undefined) {
    throw new Error("useVoting must be used within a VotingProvider")
  }
  return context
}
