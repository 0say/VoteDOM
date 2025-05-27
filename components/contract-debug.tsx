"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, ExternalLink } from "lucide-react"
import { useVoting } from "@/contexts/voting-context"
import { useWeb3 } from "@/hooks/use-web3"

export function ContractDebug() {
  const { currentContract } = useVoting()
  const { walletState } = useWeb3()

  return (
    <Card className="mb-6 bg-white/95 backdrop-blur border-blue-300 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Info className="h-5 w-5" />
          Información del Contrato Actual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium text-blue-800">Nombre:</p>
          <p className="text-sm text-gray-700">{currentContract.name}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-blue-800">Dirección del Contrato:</p>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-blue-50 px-2 py-1 rounded border-blue-200">{currentContract.address}</code>
            <a
              href={`https://sepolia.etherscan.io/address/${currentContract.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {currentContract.tokenAddress && (
          <div>
            <p className="text-sm font-medium text-blue-800">Token Requerido:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-blue-50 px-2 py-1 rounded border-blue-200">
                {currentContract.tokenAddress}
              </code>
              <a
                href={`https://sepolia.etherscan.io/token/${currentContract.tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-blue-800">Candidatos:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {currentContract.candidates.map((candidate, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {candidate}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-blue-800">Estado:</p>
          <Badge variant={currentContract.isActive ? "default" : "secondary"}>
            {currentContract.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        {walletState.account && (
          <div>
            <p className="text-sm font-medium text-blue-800">Tu Estado:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>Balance de Token: {walletState.tokenBalance}</p>
              <p>Ha Votado: {walletState.hasVoted ? "Sí" : "No"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
