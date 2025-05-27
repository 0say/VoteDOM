"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"
import { SEPOLIA_CHAIN_ID } from "@/lib/contracts"

interface WalletConnectionProps {
  onConnected: () => void
}

export function WalletConnection({ onConnected }: WalletConnectionProps) {
  const { walletState, connectWallet, switchToSepolia, isLoading } = useWeb3()

  const handleConnect = async () => {
    try {
      console.log("Iniciando conexión de wallet...")
      const result = await connectWallet()

      console.log("Resultado de conexión:", result)

      if (result && result.account) {
        console.log("Wallet conectado exitosamente, llamando onConnected")
        onConnected()
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
    }
  }

  const isWrongNetwork = walletState.isConnected && walletState.chainId !== SEPOLIA_CHAIN_ID

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur border-blue-300 shadow-xl">
      <CardContent className="p-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-red-600 rounded-full shadow-lg">
            <Wallet className="h-8 w-8 text-white" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Estado de tu Wallet Electoral</h2>
          <p className="text-gray-600">Este es el estado de tu wallet electoral:</p>
        </div>

        <Alert className="border-blue-300 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-700" />
          <AlertDescription className="text-blue-800">
            <strong>Red Oficial: Sepolia Testnet</strong>
            <br />
            Sistema electoral certificado por la JCE
          </AlertDescription>
        </Alert>

        {/* Debug Info */}
        <div className="text-xs text-left bg-blue-50 p-3 rounded border border-blue-200">
          <p>
            <strong>Estado Wallet:</strong> {walletState.isConnected ? "Conectado" : "Desconectado"}
          </p>
          <p>
            <strong>Cuenta:</strong> {walletState.account || "No disponible"}
          </p>
          <p>
            <strong>Red:</strong> {walletState.chainId || "No disponible"}
          </p>
        </div>

        {walletState.isConnected && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-300 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Estado de Conexión Electoral:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                <strong>Ciudadano:</strong> {walletState.account?.slice(0, 6)}...{walletState.account?.slice(-4)}
              </p>
              <p>
                <strong>Red Electoral:</strong>{" "}
                {walletState.chainId === SEPOLIA_CHAIN_ID ? "Sepolia JCE ✅" : "Red Incorrecta ❌"}
              </p>
            </div>
          </div>
        )}

        {walletState.isConnected ? (
          <div className="space-y-3">
            <Alert className={isWrongNetwork ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}>
              {isWrongNetwork ? (
                <>
                  <AlertCircle className="h-4 w-4 text-red-700" />
                  <AlertDescription className="text-red-800">
                    Red incorrecta. Cambia a la red electoral oficial (Sepolia).
                  </AlertDescription>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-700" />
                  <AlertDescription className="text-green-800">
                    Conectado: {walletState.account?.slice(0, 6)}...{walletState.account?.slice(-4)}
                  </AlertDescription>
                </>
              )}
            </Alert>

            {isWrongNetwork ? (
              <Button onClick={switchToSepolia} className="w-full bg-red-600 hover:bg-red-700">
                Cambiar a Red Electoral
              </Button>
            ) : (
              <Button onClick={onConnected} className="w-full bg-blue-600 hover:bg-blue-700">
                Continuar a Votación
              </Button>
            )}
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : (
              <>🦊 Conectar MetaMask Electoral</>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
