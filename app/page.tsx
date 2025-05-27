"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { WalletConnection } from "@/components/wallet-connection"
import { VotingInterface } from "@/components/voting-interface"
import { DebugControls } from "@/components/debug-controls"
import { DatabaseStatus } from "@/components/database-status"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, CheckCircle } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"
import { useDebug } from "@/hooks/use-debug"
import { DatabaseContractSelector } from "@/components/database-contract-selector"
import { TestModeToggle } from "@/components/test-mode-toggle"

export default function VotingPlatform() {
  const [isConnected, setIsConnected] = useState(false)
  const { walletState } = useWeb3()
  const { showDebugCards, setShowDebugCards, showConsoleDebug, setShowConsoleDebug } = useDebug()

  // Sincronizar estado de conexión con el hook useWeb3
  useEffect(() => {
    if (showConsoleDebug) {
      console.log("🔄 Estado de wallet cambió:", walletState)
    }
    setIsConnected(walletState.isConnected && !!walletState.account)
  }, [walletState, showConsoleDebug])

  const handleWalletConnected = () => {
    if (showConsoleDebug) {
      console.log("🎉 Wallet conectado desde componente")
    }
    setIsConnected(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-red-800 to-blue-900">
      {/* Header Gubernamental */}
      <div className="bg-white border-b-4 border-red-600 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">🇩🇴</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">República Dominicana</h1>
                <p className="text-sm text-gray-600">Junta Central Electoral</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Sistema de Votación Electrónica</p>
              <p className="text-xs text-gray-500">Blockchain • Transparente • Seguro</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Título Principal */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🗳️ Sistema de Votación Electrónica
          </h1>
          <p className="text-xl text-blue-100 drop-shadow-md">Junta Central Electoral - República Dominicana</p>
          <p className="text-lg text-red-100 drop-shadow-md mt-2">
            Votación segura y transparente con tecnología Blockchain
          </p>
        </div>

        {/* Navigation */}
        <Navigation />
        
        {/* Database Status */}
      {/* <DatabaseStatus /> */}

        {/* Debug Controls 
        <DebugControls
          showDebugCards={showDebugCards}
          onToggleDebugCards={setShowDebugCards}
          showConsoleDebug={showConsoleDebug}
          onToggleConsoleDebug={setShowConsoleDebug}
        />
*/}
        {/* Debug Cards - solo mostrar si está habilitado */}
        {showDebugCards && (
          <>
            {/* Debug de Estado Global */}
            <Card className="mb-6 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-800">Debug Global</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>
                  <strong>isConnected (local):</strong> {isConnected ? "Sí" : "No"}
                </p>
                <p>
                  <strong>walletState.isConnected:</strong> {walletState.isConnected ? "Sí" : "No"}
                </p>
                <p>
                  <strong>walletState.account:</strong> {walletState.account || "No disponible"}
                </p>
                <p>
                  <strong>walletState.chainId:</strong> {walletState.chainId || "No disponible"}
                </p>
                <p>
                  <strong>Debug Cards:</strong> {showDebugCards ? "Visible" : "Oculto"}
                </p>
                <p>
                  <strong>Console Debug:</strong> {showConsoleDebug ? "Activo" : "Silencioso"}
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Features Overview */}
        {!isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/95 backdrop-blur border-blue-300 shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-blue-600 rounded-full w-fit">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-blue-800">Seguridad Blockchain</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 text-center">
                  Votos inmutables y verificables en la blockchain de Ethereum
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur border-red-300 shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-red-600 rounded-full w-fit">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-red-800">Transparencia Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 text-center">
                  Resultados públicos y auditables por cualquier ciudadano
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur border-blue-300 shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-blue-600 rounded-full w-fit">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-blue-800">Acceso Democrático</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 text-center">
                  Votación accesible para todos los ciudadanos dominicanos
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {!isConnected ? (
            <div className="flex justify-center">
              <WalletConnection onConnected={handleWalletConnected} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">
                  Sistema Electoral Dominicano
                </h1>
                <p className="text-xl text-blue-100 drop-shadow-md max-w-2xl mx-auto">
                  Plataforma oficial de votación electrónica de la Junta Central Electoral
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <DatabaseContractSelector />
                  <VotingInterface showConsoleDebug={showConsoleDebug} />
                </div>

                <div className="space-y-6">
                  <WalletConnection onConnected={handleWalletConnected} />
                  {/* Debug de Estado Global  <TestModeToggle onEnableTestMode={() => console.log("Test mode enabled")} /> */}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Gubernamental */}
        <div className="mt-16 bg-white/10 backdrop-blur rounded-lg p-6 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🇩🇴</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Junta Central Electoral</h3>
          </div>
          <p className="text-blue-100 text-sm mb-2">Sistema de Votación Electrónica - República Dominicana</p>
          <p className="text-red-100 text-xs">Tecnología Blockchain para elecciones transparentes y seguras</p>
        </div>
      </div>
    </div>
  )
}
