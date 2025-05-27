"use client"

import { useState, useCallback } from "react"
import { useWeb3 } from "@/hooks/use-web3"
import { VOTING_ABI, TOKEN_ABI } from "@/lib/contracts"
import type { VotingContract } from "@/types/voting"

export function useVotingContract(contract: VotingContract) {
  const { web3, walletState } = useWeb3()
  const [isVoting, setIsVoting] = useState(false)
  const [showTokenDebug, setShowTokenDebug] = useState(false)
  const [tokenCost, setTokenCost] = useState<number>(1) // Costo por defecto

  const checkTokenBalance = useCallback(async (): Promise<{
    balance: number
    hasEnough: boolean
    rawBalance: string
  }> => {
    if (!web3 || !walletState.account || !contract.tokenAddress) {
      return { balance: 0, hasEnough: false, rawBalance: "0" }
    }

    try {
      const tokenContract = new web3.eth.Contract(TOKEN_ABI, contract.tokenAddress)

      // Obtener balance raw
      const balanceRaw = await tokenContract.methods.balanceOf(walletState.account).call()
      const rawBalanceString = balanceRaw.toString()

      // Obtener decimales del token
      let decimals = 18 // Valor por defecto
      try {
        const tokenDecimals = await tokenContract.methods.decimals().call()
        decimals = typeof tokenDecimals === "bigint" ? Number(tokenDecimals) : Number.parseInt(tokenDecimals)
      } catch (error) {
        console.log("No se pudieron obtener decimales, usando 18 por defecto")
      }

      // Convertir balance considerando decimales
      const tokenBalance =
        typeof balanceRaw === "bigint"
          ? Number(balanceRaw) / Math.pow(10, decimals)
          : Number.parseInt(balanceRaw) / Math.pow(10, decimals)

      console.log("Token balance check:", {
        rawBalance: rawBalanceString,
        decimals,
        formattedBalance: tokenBalance,
        required: tokenCost,
        hasEnough: tokenBalance >= tokenCost,
      })

      return {
        balance: tokenBalance,
        hasEnough: tokenBalance >= tokenCost,
        rawBalance: rawBalanceString,
      }
    } catch (error) {
      console.error("Error checking token balance:", error)
      return { balance: 0, hasEnough: false, rawBalance: "0" }
    }
  }, [web3, walletState.account, contract.tokenAddress, tokenCost])

  const checkVotingEligibility = useCallback(async (): Promise<{
    canVote: boolean
    hasVoted: boolean
    tokenBalance: number
    error?: string
  }> => {
    if (!web3 || !walletState.account) {
      return { canVote: false, hasVoted: false, tokenBalance: 0, error: "Wallet no conectado" }
    }

    try {
      const votingContract = new web3.eth.Contract(VOTING_ABI, contract.address)

      // Verificar si ya votó
      const hasVoted = await votingContract.methods.hasVoted(walletState.account).call()
      if (hasVoted) {
        return { canVote: false, hasVoted: true, tokenBalance: 0, error: "Ya has votado" }
      }

      // Si requiere token, obtener balance pero NO bloquear
      let tokenBalance = 0
      if (contract.tokenAddress) {
        const { balance } = await checkTokenBalance()
        tokenBalance = balance
      }

      // Siempre permitir intentar votar si no ha votado
      return { canVote: true, hasVoted: false, tokenBalance }
    } catch (error) {
      console.error("Error checking eligibility:", error)
      return { canVote: false, hasVoted: false, tokenBalance: 0, error: "Error verificando elegibilidad" }
    }
  }, [web3, walletState.account, contract, checkTokenBalance])

  const submitVote = useCallback(
    async (
      candidateName: string,
    ): Promise<{ success: boolean; txHash?: string; error?: string; showDebug?: boolean }> => {
      if (!web3 || !walletState.account) {
        return { success: false, error: "Wallet no conectado" }
      }

      setIsVoting(true)
      setShowTokenDebug(false) // Reset debug state

      try {
        console.log("Iniciando proceso de votación para:", candidateName)

        const votingContract = new web3.eth.Contract(VOTING_ABI, contract.address)

        // Verificar elegibilidad básica (solo si ya votó)
        const eligibility = await checkVotingEligibility()
        if (eligibility.hasVoted) {
          return { success: false, error: "Ya has votado anteriormente" }
        }

        // Estimar gas para la votación
        console.log("Estimando gas para votación...")
        const gasEstimate = await votingContract.methods.vote(candidateName).estimateGas({
          from: walletState.account,
        })

        const gasLimit =
          typeof gasEstimate === "bigint" ? Number((gasEstimate * 120n) / 100n) : Math.floor(gasEstimate * 1.2)

        console.log("Gas estimado:", gasLimit)

        // Enviar transacción de voto directamente
        console.log("Enviando voto...")
        const transaction = await votingContract.methods.vote(candidateName).send({
          from: walletState.account,
          gas: gasLimit,
        })

        console.log("Voto enviado exitosamente:", transaction.transactionHash)

        return {
          success: true,
          txHash: transaction.transactionHash,
        }
      } catch (error: any) {
        console.error("Error enviando voto:", error)

        let errorMessage = "Error enviando voto"
        let shouldShowDebug = false

        if (error.message.includes("user rejected")) {
          errorMessage = "Transacción cancelada por el usuario"
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Fondos insuficientes para gas"
        } else if (error.message.includes("Already voted")) {
          errorMessage = "Ya has votado anteriormente"
        } else if (
          error.message.includes("No token") ||
          error.message.includes("ERC20") ||
          error.message.includes("transfer") ||
          error.message.includes("allowance") ||
          error.message.includes("balance")
        ) {
          errorMessage = "Error con el token requerido - No tienes suficientes tokens"
          shouldShowDebug = true
          setShowTokenDebug(true)
        } else if (error.message.includes("execution reverted")) {
          errorMessage = "Transacción rechazada por el contrato - Posible problema con tokens"
          shouldShowDebug = true
          setShowTokenDebug(true)
        }

        return { success: false, error: errorMessage, showDebug: shouldShowDebug }
      } finally {
        setIsVoting(false)
      }
    },
    [web3, walletState.account, contract, checkVotingEligibility],
  )

  const loadVoteResults = useCallback(async (): Promise<Record<string, number>> => {
    if (!web3) return {}

    try {
      const votingContract = new web3.eth.Contract(VOTING_ABI, contract.address)
      const results: Record<string, number> = {}

      for (const candidateName of contract.candidates) {
        try {
          const votes = await votingContract.methods.voteCount(candidateName).call()
          const voteCount = typeof votes === "bigint" ? Number(votes) : Number.parseInt(votes)
          results[candidateName] = voteCount
        } catch (error) {
          console.error(`Error loading votes for ${candidateName}:`, error)
          results[candidateName] = 0
        }
      }

      return results
    } catch (error) {
      console.error("Error loading results:", error)
      return {}
    }
  }, [web3, contract])

  return {
    isVoting,
    showTokenDebug,
    tokenCost,
    setTokenCost,
    checkTokenBalance,
    checkVotingEligibility,
    submitVote,
    loadVoteResults,
  }
}
