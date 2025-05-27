"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Bug, BugOff, Settings } from "lucide-react"

interface DebugControlsProps {
  showDebugCards: boolean
  onToggleDebugCards: (show: boolean) => void
  showConsoleDebug: boolean
  onToggleConsoleDebug: (show: boolean) => void
}

export function DebugControls({
  showDebugCards,
  onToggleDebugCards,
  showConsoleDebug,
  onToggleConsoleDebug,
}: DebugControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="mb-6 bg-white/95 backdrop-blur border-blue-300 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-gray-800">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Controles de Debug
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-gray-600">
            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-white rounded border border-blue-200">
              <div>
                <p className="font-medium text-sm">Cards de Debug</p>
                <p className="text-xs text-gray-600">Mostrar/ocultar información técnica</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={showDebugCards ? "default" : "secondary"}>
                  {showDebugCards ? "Visible" : "Oculto"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleDebugCards(!showDebugCards)}
                  className={showDebugCards ? "bg-blue-50 border-blue-200" : ""}
                >
                  {showDebugCards ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded border border-blue-200">
              <div>
                <p className="font-medium text-sm">Logs de Consola</p>
                <p className="text-xs text-gray-600">Activar/desactivar logs detallados</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={showConsoleDebug ? "default" : "secondary"}>
                  {showConsoleDebug ? "Activo" : "Silencioso"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleConsoleDebug(!showConsoleDebug)}
                  className={showConsoleDebug ? "bg-green-50 border-green-200" : ""}
                >
                  {showConsoleDebug ? <BugOff className="h-4 w-4" /> : <Bug className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border-blue-200">
            <p>
              <strong>💡 Tip:</strong> Desactiva los logs de consola para reducir el spam. Las cards de debug muestran
              información útil para desarrollo.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
