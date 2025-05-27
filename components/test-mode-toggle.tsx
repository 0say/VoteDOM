"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TestTube, AlertTriangle } from "lucide-react"

interface TestModeToggleProps {
  onEnableTestMode: () => void
}

export function TestModeToggle({ onEnableTestMode }: TestModeToggleProps) {
  const [showWarning, setShowWarning] = useState(false)

  const handleEnableTestMode = () => {
    setShowWarning(true)
    setTimeout(() => {
      onEnableTestMode()
      setShowWarning(false)
    }, 2000)
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <TestTube className="h-5 w-5" />
          Modo de Prueba
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border-orange-300 bg-orange-100">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Si no puedes conectarte al contrato real, puedes usar el modo de prueba para simular la votación.
          </AlertDescription>
        </Alert>

        {showWarning ? (
          <Alert className="border-yellow-300 bg-yellow-100">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">Activando modo de prueba...</AlertDescription>
          </Alert>
        ) : (
          <Button onClick={handleEnableTestMode} variant="outline" className="w-full">
            <TestTube className="mr-2 h-4 w-4" />
            Activar Modo de Prueba
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
