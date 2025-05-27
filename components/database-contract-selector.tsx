"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, Settings, Database, Wifi, WifiOff } from "lucide-react"
import { useDatabaseVoting } from "@/contexts/database-voting-context"
import { getSupabaseStatus } from "@/lib/supabase"
import Link from "next/link"

export function DatabaseContractSelector() {
  const { contracts, currentContract, setCurrentContract, refreshContracts, isLoading } = useDatabaseVoting()
  const supabaseStatus = getSupabaseStatus()

  const activeContracts = contracts.filter((contract) => contract.isActive)

  const handleContractChange = (contractAddress: string) => {
    const selectedContract = contracts.find((c) => c.address === contractAddress)
    if (selectedContract) {
      setCurrentContract(selectedContract)
    }
  }

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando contratos...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6 bg-white border-blue-300 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span className="text-black">Seleccionar Elección</span>
            <Badge variant="outline" className="text-xs border-blue-300 text-black">
              {supabaseStatus.isConfigured ? "Con Conexión" : "Modo Local"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshContracts} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Supabase Status */}
          <Alert
            className={`${supabaseStatus.isConfigured ? "border-green-200 bg-white" : "border-yellow-200 bg-white"}`}
          >
            {supabaseStatus.isConfigured ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-yellow-600" />
            )}
            <AlertDescription className={supabaseStatus.isConfigured ? "text-black" : "text-black"}>
              {supabaseStatus.isConfigured ? (
                <span>✅ Conectado a la JCE - Datos sincronizados</span>
              ) : (
                <span>⚠️ No esta conectado a la JCE - Usando datos locales de prueba</span>
              )}
            </AlertDescription>
          </Alert>

          <div>
            <label className="text-sm font-medium mb-3 block text-black">Elección Activa:</label>
            {currentContract ? (
              <div className="space-y-3">
                {/* Selector principal */}
                <div className="relative">
                  <Select value={currentContract.address} onValueChange={handleContractChange}>
                    <SelectTrigger className="bg-white border-blue-200 focus:border-blue-500 h-12">
                      <SelectValue placeholder="Selecciona una elección" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeContracts.map((contract) => (
                        <SelectItem key={contract.address} value={contract.address}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">🗳️</span>
                              </div>
                              <span className="font-medium">{contract.name}</span>
                            </div>
                            <Badge variant="outline" className="ml-2 border-blue-300 text-black">
                              {contract.candidates.length} candidatos
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Información detallada de la elección seleccionada */}
                <div className="p-4 bg-white border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">🇩🇴</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-black mb-1">{currentContract.name}</h3>
                      <p className="text-sm text-black mb-3">{currentContract.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <p className="text-black">
                            <strong className="text-black">Contrato:</strong>
                          </p>
                          <code className="block bg-white px-2 py-1 rounded border border-blue-200 text-black break-all">
                            {currentContract.address}
                          </code>
                        </div>
                        <div className="space-y-1">
                          <p className="text-black">
                            <strong className="text-black">Candidatos:</strong> {currentContract.candidates.length}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {currentContract.candidates.slice(0, 3).map((candidate, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs border-blue-300 text-black">
                                {candidate}
                              </Badge>
                            ))}
                            {currentContract.candidates.length > 3 && (
                              <Badge variant="outline" className="text-xs border-gray-300 text-black">
                                +{currentContract.candidates.length - 3} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-white border border-yellow-200 rounded-lg">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-yellow-600 text-xl">⚠️</span>
                </div>
                <p className="text-black text-sm font-medium">No hay contratos disponibles</p>
                <p className="text-black text-xs mt-1">Contacta al administrador para crear elecciones</p>
              </div>
            )}
          </div>

          {activeContracts.length === 0 && (
            <div className="text-center p-4 bg-white border border-yellow-200 rounded-lg">
              <p className="text-black text-sm">
                No hay elecciones activas.
                <Link href="/admin" className="text-yellow-900 underline ml-1">
                  Ir a administración
                </Link>
              </p>
            </div>
          )}

          {/* Debug Info */}
          {!supabaseStatus.isConfigured && (
            <div className="text-xs text-black bg-white p-2 rounded border-blue-200">
              <p>
                <strong>Debug:</strong>
              </p>
              <p>URL: {supabaseStatus.hasUrl ? "✅" : "❌"}</p>
              <p>Anon Key: {supabaseStatus.hasAnonKey ? "✅" : "❌"}</p>
              <p>Service Key: {supabaseStatus.hasServiceKey ? "✅" : "❌"}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
