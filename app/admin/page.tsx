"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { AdminPanel } from "@/components/admin-panel"
import { AdminAuth } from "@/components/admin-auth"
import { DatabaseStatus } from "@/components/database-status"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, AlertTriangle, LogOut } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />
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
                <p className="text-sm text-gray-600">Junta Central Electoral - Panel Administrativo</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Sistema de Administración Electoral</p>
              <p className="text-xs text-gray-500">Acceso Restringido • Autorizado</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-red-600 to-blue-600 rounded-full shadow-lg">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🔐 Panel de Administración Electoral
          </h1>
          <p className="text-xl text-blue-100 drop-shadow-md">Junta Central Electoral - República Dominicana</p>
          <p className="text-lg text-red-100 drop-shadow-md mt-2">
            Gestión y configuración del sistema de votación electrónica
          </p>

          {/* Logout Button */}
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsAuthenticated(false)}
              className="bg-white/90 border-red-300 text-red-700 hover:bg-white hover:border-red-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión Administrativa
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <Navigation />

        {/* Database Status */}
        <DatabaseStatus />

        {/* Security Warning */}
        <Alert className="mb-6 border-yellow-400 bg-yellow-100/90 backdrop-blur">
          <AlertTriangle className="h-4 w-4 text-yellow-700" />
          <AlertDescription className="text-yellow-800">
            <strong>⚠️ Área Restringida - Junta Central Electoral:</strong> Este panel permite modificar la configuración
            del sistema electoral nacional. Solo personal autorizado de la JCE debe acceder a estas funciones.
          </AlertDescription>
        </Alert>

        {/* Admin Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/95 backdrop-blur border-blue-300 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-blue-600 rounded-full w-fit">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-blue-800">Gestión de Elecciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 text-center">
                Crear, editar y administrar procesos electorales nacionales
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-red-300 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-red-600 rounded-full w-fit">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-red-800">Control Electoral</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 text-center">
                Configurar requisitos de elegibilidad y permisos de votación
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-blue-300 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-blue-600 rounded-full w-fit">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-blue-800">Supervisión Electoral</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 text-center">
                Monitorear procesos electorales y resultados en tiempo real
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Panel */}
        <div className="max-w-6xl mx-auto">
          <AdminPanel />
        </div>

        {/* Footer Gubernamental */}
        <div className="mt-16 bg-white/10 backdrop-blur rounded-lg p-6 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🇩🇴</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Junta Central Electoral</h3>
          </div>
          <p className="text-blue-100 text-sm mb-2">Panel Administrativo - Sistema Electoral Dominicano</p>
          <p className="text-red-100 text-xs">Acceso autorizado únicamente para funcionarios de la JCE</p>
        </div>
      </div>
    </div>
  )
}
