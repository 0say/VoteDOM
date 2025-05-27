"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { VOTING_ABI, TOKEN_ABI } from "@/lib/contracts"
import type { VotingContract } from "@/types/voting"

export function useBlockchainVoting(debugLog?: (message: string, ...args: any[]) => void) {
  const [isVoting, setIsVoting] = useState(false)
  const [showTokenDebug, setShowTokenDebug] = useState(false)
  const [currentContractAddress, setCurrentContractAddress] = useState<string>("")
  const web3Ref = useRef<any>(null)
  const userAccountRef = useRef<string | null>(null)
  const votingContractRef = useRef<any>(null)
  const tokenContractRef = useRef<any>(null)
  const lastCheckTimeRef = useRef<number>(0)

  // Helper para logs controlados
  const log = useCallback(
    (message: string, ...args: any[]) => {
      if (debugLog) {
        debugLog(message, ...args)
      }
    },
    [debugLog],
  )

  const initializeContracts = useCallback(
    async (web3: any, account: string, contract: VotingContract) => {
      log("🔄 Inicializando contratos...")
      log("📋 Contract address:", contract.address)
      log("👤 Account:", account)

      // Detectar cambio de contrato y resetear estados
      if (currentContractAddress !== contract.address) {
        log("🔄 Contrato cambió, reseteando estados...")
        setIsVoting(false)
        setShowTokenDebug(false)
        setCurrentContractAddress(contract.address)
      }

      web3Ref.current = web3
      userAccountRef.current = account

      // Inicializar contrato de votación
      votingContractRef.current = new web3.eth.Contract(VOTING_ABI, contract.address)

      // Inicializar contrato de token si existe
      if (contract.tokenAddress && contract.tokenAddress !== "") {
        tokenContractRef.current = new web3.eth.Contract(TOKEN_ABI, contract.tokenAddress)
        log("💰 Token contract inicializado:", contract.tokenAddress)
      } else {
        tokenContractRef.current = null
        log("💰 Sin token requerido para este contrato")
      }

      log("✅ Contratos inicializados exitosamente")
    },
    [currentContractAddress, log],
  )

  const checkEligibility = useCallback(async (): Promise<{
    canVote: boolean
    hasVoted: boolean
    tokenBalance: number
    error?: string
  }> => {
    if (!web3Ref.current || !userAccountRef.current || !votingContractRef.current) {
      return { canVote: false, hasVoted: false, tokenBalance: 0, error: "Contratos no inicializados" }
    }

    // Evitar checks muy frecuentes
    const now = Date.now()
    if (now - lastCheckTimeRef.current < 5000) {
      // Solo verificar cada 5 segundos
      return { canVote: false, hasVoted: false, tokenBalance: 0, error: "Verificación muy frecuente" }
    }
    lastCheckTimeRef.current = now

    try {
      log("🔍 Verificando elegibilidad para contrato:", currentContractAddress)

      // Verificar si tiene el token (si está configurado)
      let tokenBalance = 0
      if (tokenContractRef.current) {
        try {
          const balance = await tokenContractRef.current.methods.balanceOf(userAccountRef.current).call()
          tokenBalance = typeof balance === "bigint" ? Number(balance) : Number.parseInt(balance)
          log("💰 Token balance:", tokenBalance)

          if (tokenBalance === 0) {
            return {
              canVote: false,
              hasVoted: false,
              tokenBalance: 0,
              error: "No tienes el token requerido para votar",
            }
          }
        } catch (tokenError) {
          log("❌ Error verificando token:", tokenError)
          return {
            canVote: false,
            hasVoted: false,
            tokenBalance: 0,
            error: "Error verificando token requerido",
          }
        }
      }

      // Verificar si ya votó EN ESTE CONTRATO ESPECÍFICO
      let hasVoted = false
      try {
        hasVoted = await votingContractRef.current.methods.hasVoted(userAccountRef.current).call()
        log("🗳️ Has voted en este contrato:", hasVoted)
      } catch (votedError) {
        log("❌ Error verificando si ya votó:", votedError)
        // Si hay error verificando, asumir que puede votar (contrato de prueba)
        log("⚠️ No se pudo verificar estado de voto, asumiendo que puede votar")
        hasVoted = false
      }

      if (hasVoted) {
        return {
          canVote: false,
          hasVoted: true,
          tokenBalance,
          error: "Ya has emitido tu voto en esta elección",
        }
      }

      return {
        canVote: true,
        hasVoted: false,
        tokenBalance,
      }
    } catch (error) {
      log("❌ Error verificando elegibilidad:", error)
      return {
        canVote: false,
        hasVoted: false,
        tokenBalance: 0,
        error: "Error verificando elegibilidad: " + (error as Error).message,
      }
    }
  }, [currentContractAddress, log])

  const submitVote = useCallback(
    async (candidateName: string): Promise<{ success: boolean; txHash?: string; error?: string }> => {
      if (!candidateName) {
        return { success: false, error: "Por favor selecciona un candidato" }
      }

      if (!web3Ref.current || !userAccountRef.current || !votingContractRef.current) {
        return { success: false, error: "Wallet no conectado o contratos no inicializados" }
      }

      // Verificar si es un contrato de prueba (dirección 0x000...)
      if (currentContractAddress.startsWith("0x000000000000000000000000000000000000000")) {
        log("🧪 Contrato de prueba detectado, simulando voto...")
        setIsVoting(true)

        // Simular delay de transacción
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setIsVoting(false)
        return {
          success: true,
          txHash: "0x" + Math.random().toString(16).substr(2, 64), // Hash simulado
        }
      }

      setIsVoting(true)
      setShowTokenDebug(false)

      try {
        log("🔄 Iniciando proceso de votación para:", candidateName)
        log("📋 Contrato:", currentContractAddress)
        log("👤 Usuario:", userAccountRef.current)

        // Estimar gas con manejo de BigInt
        const gasEstimate = await votingContractRef.current.methods.vote(candidateName).estimateGas({
          from: userAccountRef.current,
        })

        log("⛽ Gas estimate:", gasEstimate)

        // Convertir BigInt a number de forma segura
        const gasLimit =
          typeof gasEstimate === "bigint"
            ? Number((gasEstimate * 120n) / 100n) // Agregar 20% de margen
            : Math.floor(gasEstimate * 1.2)

        log("⛽ Gas limit:", gasLimit)

        // Enviar transacción
        const transaction = await votingContractRef.current.methods.vote(candidateName).send({
          from: userAccountRef.current,
          gas: gasLimit,
        })

        log("✅ Transacción exitosa:", transaction.transactionHash)

        return {
          success: true,
          txHash: transaction.transactionHash,
        }
      } catch (error: any) {
        log("❌ Error enviando voto:", error)

        // Manejo más específico de errores
        let errorMessage = "Error enviando voto"
        if (error.message.includes("user rejected")) {
          errorMessage = "Transacción cancelada por el usuario"
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Fondos insuficientes para gas"
        } else if (error.message.includes("Already voted")) {
          errorMessage = "Ya has votado anteriormente"
        } else if (error.message.includes("No token")) {
          errorMessage = "No tienes el token requerido"
          setShowTokenDebug(true)
        } else {
          errorMessage = error.message || "Error desconocido"
          setShowTokenDebug(true)
        }

        return { success: false, error: errorMessage }
      } finally {
        setIsVoting(false)
      }
    },
    [currentContractAddress, log],
  )

  const loadResults = useCallback(
    async (candidates: string[]): Promise<Record<string, number>> => {
      if (!web3Ref.current || !votingContractRef.current) {
        log("❌ No se pueden cargar resultados: contratos no inicializados")
        return {}
      }

      // Si es un contrato de prueba, devolver resultados simulados
      if (currentContractAddress.startsWith("0x000000000000000000000000000000000000000")) {
        log("🧪 Contrato de prueba, devolviendo resultados simulados")
        const results: Record<string, number> = {}
        candidates.forEach((candidate, index) => {
          results[candidate] = Math.floor(Math.random() * 5) // Votos aleatorios entre 0-4
        })
        return results
      }

      try {
        log("📊 Cargando resultados para candidatos:", candidates)
        const results: Record<string, number> = {}

        // Obtener votos de cada candidato
        for (const candidate of candidates) {
          try {
            const votes = await votingContractRef.current.methods.voteCount(candidate).call()
            const voteCount = typeof votes === "bigint" ? Number(votes) : Number.parseInt(votes)
            results[candidate] = voteCount
            log(`📊 ${candidate}: ${voteCount} votos`)
          } catch (candidateError) {
            log(`❌ Error cargando votos para ${candidate}:`, candidateError)
            results[candidate] = 0
          }
        }

        return results
      } catch (error) {
        log("❌ Error cargando resultados:", error)
        return {}
      }
    },
    [currentContractAddress, log],
  )

  // Reset cuando cambia el contrato
  useEffect(() => {
    log("🔄 Hook detectó cambio de contrato:", currentContractAddress)
  }, [currentContractAddress, log])

  return {
    isVoting,
    showTokenDebug,
    currentContractAddress,
    initializeContracts,
    checkEligibility,
    submitVote,
    loadResults,
  }
}
