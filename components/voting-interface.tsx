"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Vote, Users, CheckCircle, Loader2, AlertCircle, ExternalLink, Coins, Trophy, TestTube } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"
import { useBlockchainVoting } from "@/hooks/use-blockchain-voting"
import type { Candidate } from "@/types/voting"
import { useDatabaseVoting } from "@/contexts/database-voting-context"
import { TokenDebug } from "@/components/token-debug"
import { useDebug } from "@/hooks/use-debug"

interface VotingInterfaceProps {
  showConsoleDebug?: boolean
}

export function VotingInterface({ showConsoleDebug = false }: VotingInterfaceProps) {
  const { currentContract } = useDatabaseVoting() // Changed from useVoting to useDatabaseVoting
  const { walletState, web3 } = useWeb3()
  const { debugLog } = useDebug()
  const {
    isVoting,
    showTokenDebug,
    currentContractAddress,
    initializeContracts,
    checkEligibility,
    submitVote,
    loadResults,
  } = useBlockchainVoting(showConsoleDebug ? debugLog : undefined)

  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [totalVotes, setTotalVotes] = useState(0)
  const [canVote, setCanVote] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [lastTxHash, setLastTxHash] = useState<string | null>(null)
  const [contractsInitialized, setContractsInitialized] = useState(false)
  const [tokenBalance, setTokenBalance] = useState(0)
  const [status, setStatus] = useState<{ message: string; type: "success" | "error" | "warning" }>({
    message: "",
    type: "success",
  })

  const isTestContract = currentContract?.address?.startsWith("0x000000000000000000000000000000000000000") || false

  // Refs para evitar loops infinitos
  const eligibilityCheckedRef = useRef(false)
  const resultsLoadedRef = useRef(false)
  const lastContractRef = useRef<string>("")

  const getPartyForCandidate = (name: string): string => {
    const parties: Record<string, string> = {
      "María González": "Partido Progresista",
      "Juan Pérez": "Partido Conservador",
      "Ana Rodríguez": "Partido Independiente",
      "Carlos López": "Partido Liberal",
      "Elena Martín": "Partido Verde",
      "Roberto Silva": "Partido Social",
      "Candidato A": "Partido A",
      "Candidato B": "Partido B",
      "Candidato C": "Partido C",
    }
    return parties[name] || "Independiente"
  }

  // Modificar la función initializeCandidates para agregar una verificación de null
  const initializeCandidates = useCallback(() => {
    if (!currentContract?.candidates?.length) return

    const initialCandidates: Candidate[] = currentContract.candidates.map((candidateName) => ({
      id: candidateName,
      name: candidateName,
      party: getPartyForCandidate(candidateName),
      votes: 0,
    }))

    setCandidates(initialCandidates)
  }, [currentContract?.candidates])

  // También modificar la función loadVoteResults para agregar una verificación de null
  const loadVoteResults = useCallback(async () => {
    if (!contractsInitialized || !currentContract?.candidates?.length) return

    try {
      const results = await loadResults(currentContract.candidates)
      let total = 0

      // Usar función de actualización para evitar dependencia en candidates
      setCandidates((prevCandidates) => {
        const updatedCandidates = prevCandidates.map((candidate) => {
          const votes = results[candidate.name] || 0
          total += votes
          return { ...candidate, votes }
        })
        return updatedCandidates
      })

      setTotalVotes(total)
      resultsLoadedRef.current = true
    } catch (error) {
      console.error("Error loading results:", error)
    }
  }, [loadResults, contractsInitialized, currentContract?.candidates])

  // Verificar elegibilidad - sin dependencias problemáticas
  const checkUserEligibility = useCallback(async () => {
    if (!contractsInitialized || eligibilityCheckedRef.current) return

    try {
      setStatus({ message: "Verificando elegibilidad...", type: "warning" })

      const eligibility = await checkEligibility()
      setCanVote(eligibility.canVote)
      setHasVoted(eligibility.hasVoted)
      setTokenBalance(eligibility.tokenBalance)

      if (eligibility.error) {
        setStatus({ message: eligibility.error, type: "error" })
      } else if (eligibility.hasVoted) {
        setStatus({ message: "✅ Ya has emitido tu voto en esta elección", type: "warning" })
      } else if (eligibility.canVote) {
        const balanceText =
          eligibility.tokenBalance > 0 ? ` - Balance: ${(eligibility.tokenBalance / 1e18).toFixed(2)} tokens` : ""
        setStatus({
          message: `✅ Listo para votar${balanceText}`,
          type: "success",
        })
      }

      eligibilityCheckedRef.current = true
    } catch (error) {
      console.error("Error checking eligibility:", error)
      setStatus({ message: "Error verificando elegibilidad", type: "error" })
    }
  }, [checkEligibility, contractsInitialized])

  const handleVote = async () => {
    if (!selectedCandidate) {
      setStatus({ message: "Por favor selecciona un candidato", type: "warning" })
      return
    }

    try {
      const result = await submitVote(selectedCandidate)

      if (result.success) {
        setStatus({ message: "¡Voto emitido exitosamente! 🎉", type: "success" })
        setHasVoted(true)
        setCanVote(false)
        setLastTxHash(result.txHash || null)

        // Resetear flags para permitir nueva carga de resultados
        resultsLoadedRef.current = false

        // Actualizar resultados después de un delay
        setTimeout(async () => {
          await loadVoteResults()
        }, 2000)
      } else {
        setStatus({ message: result.error || "Error enviando voto", type: "error" })
      }
    } catch (error) {
      console.error("Error in handleVote:", error)
      setStatus({ message: "Error inesperado al votar", type: "error" })
    }
  }

  // RESET COMPLETO cuando cambia el contrato - CORREGIDO CON NULL CHECKS
  useEffect(() => {
    const currentAddress = currentContract?.address || ""

    if (lastContractRef.current !== currentAddress) {
      if (showConsoleDebug) {
        console.log("🔄 Contrato cambió, reseteando todo el estado...")
      }

      // Reset de estado
      setSelectedCandidate(null)
      setTotalVotes(0)
      setLastTxHash(null)
      setCanVote(false)
      setHasVoted(false)
      setTokenBalance(0)
      setContractsInitialized(false)
      setStatus({ message: "", type: "success" })

      // Reset de refs
      eligibilityCheckedRef.current = false
      resultsLoadedRef.current = false
      lastContractRef.current = currentAddress
    }
  }, [currentContract?.address, showConsoleDebug])

  // Inicializar contratos cuando se conecta la wallet
  useEffect(() => {
    const initContracts = async () => {
      if (web3 && walletState.account && walletState.isConnected && currentContract) {
        try {
          await initializeContracts(web3, walletState.account, currentContract)
          setContractsInitialized(true)
          // Reset flags cuando se inicializan los contratos
          eligibilityCheckedRef.current = false
          resultsLoadedRef.current = false
        } catch (error) {
          console.error("Error inicializando contratos:", error)
          setStatus({ message: "Error inicializando contratos", type: "error" })
        }
      } else {
        setContractsInitialized(false)
      }
    }

    initContracts()
  }, [web3, walletState.account, walletState.isConnected, currentContract, initializeContracts])

  // Inicializar candidatos - solo cuando cambian los candidatos del contrato
  useEffect(() => {
    initializeCandidates()
  }, [initializeCandidates])

  // Verificar elegibilidad cuando los contratos estén listos - solo una vez
  useEffect(() => {
    if (contractsInitialized && !eligibilityCheckedRef.current) {
      checkUserEligibility()
    }
  }, [contractsInitialized, checkUserEligibility])

  // Cargar resultados cuando los contratos estén listos - solo una vez
  useEffect(() => {
    if (contractsInitialized && !resultsLoadedRef.current) {
      loadVoteResults()
    }
  }, [contractsInitialized, loadVoteResults])

  // Actualizar resultados periódicamente - con control de frecuencia
  useEffect(() => {
    if (!contractsInitialized) return

    const interval = setInterval(() => {
      // Solo cargar si han pasado al menos 30 segundos desde la última carga
      if (resultsLoadedRef.current) {
        resultsLoadedRef.current = false // Permitir nueva carga
        loadVoteResults()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [contractsInitialized, loadVoteResults])

  // Encontrar el candidato ganador
  const winningCandidate = candidates.reduce((prev, current) => (prev.votes > current.votes ? prev : current), {
    votes: 0,
    name: "",
  })

  // Early return if no current contract
  if (!currentContract) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              No hay contrato de votación seleccionado. Por favor selecciona una elección.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Indicador de Contrato de Prueba */}
      {isTestContract && (
        <Alert className="border-orange-200 bg-orange-50">
          <TestTube className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>🧪 Modo de Prueba:</strong> Este es un contrato de prueba. Las transacciones son simuladas.
          </AlertDescription>
        </Alert>
      )}

      {/* Token Debug - solo mostrar si hay error con tokens */}
      {showTokenDebug && currentContract.tokenAddress && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Error de Token Detectado:</strong> Mostrando información de debug
          </AlertDescription>
        </Alert>
      )}
      {showTokenDebug && currentContract.tokenAddress && <TokenDebug />}

      {/* Estado de Votación */}
      {hasVoted && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center justify-between">
              <span>
                <strong>🎉 ¡Voto Registrado Exitosamente!</strong>
                <br />
                Tu participación ha sido registrada{isTestContract ? " (simulada)" : " en la blockchain"}.
              </span>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                ✅ Votado
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-white/95 backdrop-blur border-blue-300 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Vote className="h-5 w-5" />
            {currentContract.name}
            {isTestContract && <TestTube className="h-4 w-4 text-orange-500" />}
          </CardTitle>
          <p className="text-gray-600">{currentContract.description}</p>
        </CardHeader>
        <CardContent>
          {/* Token Info */}
          {currentContract.tokenAddress && currentContract.tokenAddress !== "" && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <Coins className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="flex justify-between items-center">
                  <span>
                    <strong>Token requerido para votar</strong>
                  </span>
                  <span>
                    <strong>Tu balance:</strong> {(tokenBalance / 1e18).toFixed(2)} tokens
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Status */}
          {status.message && (
            <Alert
              className={`mb-4 ${
                status.type === "success"
                  ? "border-green-200 bg-green-50"
                  : status.type === "error"
                    ? "border-red-200 bg-red-50"
                    : "border-yellow-200 bg-yellow-50"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : status.type === "error" ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
              <AlertDescription
                className={
                  status.type === "success"
                    ? "text-green-800"
                    : status.type === "error"
                      ? "text-red-800"
                      : "text-yellow-800"
                }
              >
                {status.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Transaction Hash */}
          {lastTxHash && !isTestContract && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <ExternalLink className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="flex items-center justify-between">
                  <span>Transacción exitosa:</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${lastTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-900 underline hover:text-green-700"
                  >
                    Ver en Etherscan
                  </a>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Simulated Transaction */}
          {lastTxHash && isTestContract && (
            <Alert className="mb-4 border-orange-200 bg-orange-50">
              <TestTube className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="flex items-center justify-between">
                  <span>Transacción simulada:</span>
                  <code className="text-xs bg-white px-2 py-1 rounded">{lastTxHash}</code>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Candidates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {candidates.map((candidate) => (
              <Card
                key={candidate.id}
                className={`transition-all bg-white border-blue-300 shadow-lg ${
                  selectedCandidate === candidate.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                } ${hasVoted ? "cursor-default" : "cursor-pointer hover:shadow-xl"} ${
                  !contractsInitialized ? "opacity-75" : ""
                }`}
                onClick={() => contractsInitialized && !hasVoted && setSelectedCandidate(candidate.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <h3 className="font-bold text-lg text-gray-800">{candidate.name}</h3>
                    {candidate.votes > 0 && candidate.votes === winningCandidate.votes && totalVotes > 0 && (
                      <Trophy className="h-5 w-5 text-yellow-500 ml-2" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{candidate.party}</p>
                  <Badge
                    variant={
                      candidate.votes > 0 && candidate.votes === winningCandidate.votes ? "default" : "secondary"
                    }
                    className={
                      candidate.votes > 0 && candidate.votes === winningCandidate.votes
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : "bg-blue-100 text-blue-800 border-blue-300"
                    }
                  >
                    {candidate.votes} votos
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Vote Button */}
          {!hasVoted && contractsInitialized && canVote && (
            <div className="text-center">
              <Button
                onClick={handleVote}
                disabled={!selectedCandidate || isVoting}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                size="lg"
              >
                {isVoting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isTestContract ? "Simulando voto..." : "Enviando voto..."}
                  </>
                ) : (
                  <>
                    <Vote className="mr-2 h-4 w-4" />
                    {isTestContract ? "Simular Voto" : "Emitir Voto"}
                  </>
                )}
              </Button>
            </div>
          )}

          {!contractsInitialized && (
            <div className="text-center">
              <Alert className="border-blue-200 bg-blue-50">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <AlertDescription className="text-blue-800">
                  Inicializando contratos... Por favor espera.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="bg-white/95 backdrop-blur border-blue-300 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Users className="h-5 w-5" />
            Resultados{isTestContract ? " (Simulados)" : " en Tiempo Real"}
            {totalVotes > 0 && (
              <Badge variant="outline" className="ml-2 border-blue-300 text-blue-700">
                {totalVotes} votos totales
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {candidates.map((candidate) => {
              const percentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0
              const isWinning = candidate.votes > 0 && candidate.votes === winningCandidate.votes
              return (
                <div key={candidate.id}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{candidate.name}</span>
                      {isWinning && totalVotes > 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {candidate.votes} votos ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    className={`h-3 ${isWinning ? "bg-yellow-100" : ""}`}
                    style={{
                      background: isWinning ? "#fef3c7" : undefined,
                    }}
                  />
                </div>
              )
            })}

            {totalVotes === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aún no hay votos registrados</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
