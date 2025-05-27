"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Coins, RefreshCw, ExternalLink, Info } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"
import { TOKEN_ABI } from "@/lib/contracts"
import { useDatabaseVoting } from "@/contexts/database-voting-context"

export function TokenDebug() {
  const { currentContract } = useDatabaseVoting() // Changed from useVoting to useDatabaseVoting
  const { web3, walletState } = useWeb3()
  const [tokenInfo, setTokenInfo] = useState<{
    symbol: string
    decimals: number
    rawBalance: string
    formattedBalance: number
    isLoading: boolean
    error?: string
  }>({
    symbol: "TOKEN",
    decimals: 18,
    rawBalance: "0",
    formattedBalance: 0,
    isLoading: false,
  })

  const loadTokenInfo = async () => {
    if (!web3 || !walletState.account || !currentContract?.tokenAddress) {
      return
    }

    setTokenInfo((prev) => ({ ...prev, isLoading: true, error: undefined }))

    try {
      const tokenContract = new web3.eth.Contract(TOKEN_ABI, currentContract.tokenAddress)

      // Obtener información del token
      const [symbol, decimals, rawBalance] = await Promise.all([
        tokenContract.methods
          .symbol()
          .call()
          .catch(() => "UNKNOWN"),
        tokenContract.methods
          .decimals()
          .call()
          .catch(() => 18),
        tokenContract.methods.balanceOf(walletState.account).call(),
      ])

      const tokenDecimals = typeof decimals === "bigint" ? Number(decimals) : Number.parseInt(decimals)
      const balanceRaw = rawBalance.toString()
      const formattedBalance =
        typeof rawBalance === "bigint"
          ? Number(rawBalance) / Math.pow(10, tokenDecimals)
          : Number.parseInt(rawBalance) / Math.pow(10, tokenDecimals)

      setTokenInfo({
        symbol: symbol.toString(),
        decimals: tokenDecimals,
        rawBalance: balanceRaw,
        formattedBalance,
        isLoading: false,
      })

      console.log("Token info loaded:", {
        symbol,
        decimals: tokenDecimals,
        rawBalance: balanceRaw,
        formattedBalance,
      })
    } catch (error) {
      console.error("Error loading token info:", error)
      setTokenInfo((prev) => ({
        ...prev,
        isLoading: false,
        error: "Error cargando información del token",
      }))
    }
  }

  useEffect(() => {
    if (currentContract?.tokenAddress) {
      loadTokenInfo()
    }
  }, [web3, walletState.account, currentContract?.tokenAddress])

  if (!currentContract?.tokenAddress) {
    return null
  }

  return (
    <Card className="mb-6 bg-white/95 backdrop-blur border-purple-300 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-purple-800">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Debug de Token
          </div>
          <Button variant="outline" size="sm" onClick={loadTokenInfo} disabled={tokenInfo.isLoading}>
            {tokenInfo.isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tokenInfo.error && (
          <Alert className="border-red-200 bg-red-50">
            <Info className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{tokenInfo.error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-purple-800">Dirección del Token:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-purple-50 px-2 py-1 rounded border-purple-200">
                {currentContract.tokenAddress}
              </code>
              <a
                href={`https://sepolia.etherscan.io/token/${currentContract.tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-purple-800">Símbolo:</p>
            <Badge variant="outline" className="text-purple-700">
              {tokenInfo.symbol}
            </Badge>
          </div>

          <div>
            <p className="text-sm font-medium text-purple-800">Decimales:</p>
            <Badge variant="outline" className="text-purple-700">
              {tokenInfo.decimals}
            </Badge>
          </div>

          <div>
            <p className="text-sm font-medium text-purple-800">Tu Wallet:</p>
            <code className="text-xs bg-purple-50 px-2 py-1 rounded border-purple-200">
              {walletState.account?.slice(0, 6)}...{walletState.account?.slice(-4)}
            </code>
          </div>
        </div>

        <div className="border-t pt-3">
          <p className="text-sm font-medium text-purple-800 mb-2">Balance Detallado:</p>
          <div className="bg-purple-50 p-3 rounded border-purple-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Balance Raw (Wei):</span>
              <code className="text-xs">{tokenInfo.rawBalance}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Balance Formateado:</span>
              <span className="font-medium">
                {tokenInfo.formattedBalance.toFixed(6)} {tokenInfo.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">¿Tiene tokens?:</span>
              <Badge variant={tokenInfo.formattedBalance > 0 ? "default" : "destructive"}>
                {tokenInfo.formattedBalance > 0 ? "SÍ" : "NO"}
              </Badge>
            </div>
          </div>
        </div>

        {tokenInfo.formattedBalance === 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Sin tokens:</strong> Necesitas obtener tokens de este contrato para poder votar.
              <br />
              <a
                href={`https://sepolia.etherscan.io/token/${currentContract.tokenAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-900 underline"
              >
                Ver token en Etherscan
              </a>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
