"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, RefreshCw, CheckCircle, XCircle, BarChart3 } from "lucide-react"
import { DatabaseService } from "@/lib/database-service"
import { getSupabaseStatus } from "@/lib/supabase"

export function DatabaseStatus() {
  const [dbInfo, setDbInfo] = useState({
    contractCount: 0,
    voteCount: 0,
    activeContracts: 0,
    isConnected: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const supabaseStatus = getSupabaseStatus()

  const loadDatabaseInfo = async () => {
    setIsLoading(true)
    try {
      const info = await DatabaseService.getDatabaseInfo()
      setDbInfo(info)
    } catch (error) {
      console.error("Error loading database info:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDatabaseInfo()
  }, [])

  return (
    <Card className="mb-6 bg-white/95 backdrop-blur border-blue-300 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span className="text-gray-800">Estado de la Base de Datos</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadDatabaseInfo} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <Alert
          className={`${
            supabaseStatus.isConfigured && dbInfo.isConnected
              ? "border-green-200 bg-green-50"
              : "border-yellow-200 bg-yellow-50"
          }`}
        >
          {supabaseStatus.isConfigured && dbInfo.isConnected ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-yellow-600" />
          )}
          <AlertDescription
            className={supabaseStatus.isConfigured && dbInfo.isConnected ? "text-green-800" : "text-yellow-800"}
          >
            {supabaseStatus.isConfigured && dbInfo.isConnected ? (
              <span>✅ Conectado a Supabase - Base de datos operativa</span>
            ) : supabaseStatus.isConfigured ? (
              <span>⚠️ Supabase configurado pero sin conexión</span>
            ) : (
              <span>⚠️ Supabase no configurado - Usando datos locales</span>
            )}
          </AlertDescription>
        </Alert>

        {/* Database Statistics */}
        {supabaseStatus.isConfigured && dbInfo.isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white border border-blue-300 rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-800">{dbInfo.contractCount}</div>
              <div className="text-sm text-blue-600">Contratos Totales</div>
            </div>

            <div className="text-center p-4 bg-white border border-green-300 rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-800">{dbInfo.activeContracts}</div>
              <div className="text-sm text-green-600">Contratos Activos</div>
            </div>

            <div className="text-center p-4 bg-white border border-red-300 rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <Database className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-800">{dbInfo.voteCount}</div>
              <div className="text-sm text-red-600">Votos Registrados</div>
            </div>
          </div>
        )}

        {/* Configuration Details */}
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border-blue-200">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <strong>Configuración:</strong>
            </div>
            <div></div>
            <div>URL:</div>
            <div>{supabaseStatus.hasUrl ? "✅ Configurada" : "❌ Faltante"}</div>
            <div>Anon Key:</div>
            <div>{supabaseStatus.hasAnonKey ? "✅ Configurada" : "❌ Faltante"}</div>
            <div>Service Key:</div>
            <div>{supabaseStatus.hasServiceKey ? "✅ Configurada" : "❌ Faltante"}</div>
            <div>Estado:</div>
            <div>
              <Badge variant={dbInfo.isConnected ? "default" : "secondary"}>
                {dbInfo.isConnected ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
