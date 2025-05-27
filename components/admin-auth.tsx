"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Shield, AlertCircle } from "lucide-react"

interface AdminAuthProps {
  onAuthenticated: () => void
}

export function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simular verificación
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (password === "jce2024") {
      onAuthenticated()
    } else {
      setError("Credenciales incorrectas. Acceso denegado.")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-red-800 to-blue-900 flex items-center justify-center">
      {/* Header Gubernamental */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b-4 border-red-600 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">🇩🇴</span>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">República Dominicana</h1>
              <p className="text-sm text-gray-600">Junta Central Electoral - Acceso Administrativo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-32">
        <Card className="max-w-md mx-auto bg-white/95 backdrop-blur border-red-300 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto p-4 bg-gradient-to-br from-red-600 to-blue-600 rounded-full w-fit mb-4 shadow-lg">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-800">Acceso Administrativo JCE</CardTitle>
            <p className="text-gray-600">
              Ingresa las credenciales autorizadas para acceder al panel de administración electoral
            </p>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-yellow-400 bg-yellow-100">
              <AlertCircle className="h-4 w-4 text-yellow-700" />
              <AlertDescription className="text-yellow-800">
                <strong>🔒 Área Restringida JCE:</strong> Solo funcionarios autorizados de la Junta Central Electoral
                pueden acceder.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Contraseña Administrativa
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa la contraseña JCE"
                  required
                  className="bg-white border-blue-200 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Credenciales proporcionadas por la JCE</p>
              </div>

              {error && (
                <Alert className="border-red-400 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-700" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-semibold"
              >
                {isLoading ? (
                  <>
                    <Lock className="mr-2 h-4 w-4 animate-spin" />
                    Verificando Credenciales...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Acceder al Panel JCE
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-xs text-gray-500">
              <p>
                Contraseña de prueba: <code className="bg-blue-100 px-1 rounded border-blue-200">jce2024</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
