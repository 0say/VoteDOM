"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { VotingContract } from "@/types/voting"
import { DatabaseService } from "@/lib/database-service"

interface DatabaseVotingContextType {
  contracts: VotingContract[]
  currentContract: VotingContract | null
  setCurrentContract: (contract: VotingContract) => void
  refreshContracts: () => Promise<void>
  createContract: (contract: VotingContract) => Promise<{ success: boolean; error?: string }>
  updateContract: (
    contractAddress: string,
    updates: Partial<VotingContract>,
  ) => Promise<{ success: boolean; error?: string }>
  deleteContract: (contractAddress: string) => Promise<{ success: boolean; error?: string }>
  recordVote: (
    contractAddress: string,
    candidateName: string,
    voterAddress: string,
    txHash?: string,
  ) => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
}

const DatabaseVotingContext = createContext<DatabaseVotingContextType | undefined>(undefined)

export function DatabaseVotingProvider({ children }: { children: React.ReactNode }) {
  const [contracts, setContracts] = useState<VotingContract[]>([])
  const [currentContract, setCurrentContract] = useState<VotingContract | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshContracts = async () => {
    setIsLoading(true)
    try {
      const fetchedContracts = await DatabaseService.getContracts()
      setContracts(fetchedContracts)

      // Establecer contrato activo como actual
      const activeContract = fetchedContracts.find((c) => c.isActive)
      if (activeContract && (!currentContract || currentContract.address !== activeContract.address)) {
        setCurrentContract(activeContract)
      } else if (!activeContract && fetchedContracts.length > 0) {
        setCurrentContract(fetchedContracts[0])
      }
    } catch (error) {
      console.error("Error refreshing contracts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createContract = async (contract: VotingContract) => {
    const result = await DatabaseService.createContract(contract)
    if (result.success) {
      await refreshContracts()
    }
    return result
  }

  const updateContract = async (contractAddress: string, updates: Partial<VotingContract>) => {
    const result = await DatabaseService.updateContract(contractAddress, updates)
    if (result.success) {
      await refreshContracts()
    }
    return result
  }

  const deleteContract = async (contractAddress: string) => {
    const result = await DatabaseService.deleteContract(contractAddress)
    if (result.success) {
      await refreshContracts()
    }
    return result
  }

  const recordVote = async (contractAddress: string, candidateName: string, voterAddress: string, txHash?: string) => {
    return await DatabaseService.recordVote(contractAddress, candidateName, voterAddress, txHash)
  }

  // Cargar contratos al inicializar
  useEffect(() => {
    refreshContracts()
  }, [])

  return (
    <DatabaseVotingContext.Provider
      value={{
        contracts,
        currentContract,
        setCurrentContract,
        refreshContracts,
        createContract,
        updateContract,
        deleteContract,
        recordVote,
        isLoading,
      }}
    >
      {children}
    </DatabaseVotingContext.Provider>
  )
}

export function useDatabaseVoting() {
  const context = useContext(DatabaseVotingContext)
  if (context === undefined) {
    throw new Error("useDatabaseVoting must be used within a DatabaseVotingProvider")
  }
  return context
}
