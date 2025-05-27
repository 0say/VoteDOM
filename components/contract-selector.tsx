"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Settings } from "lucide-react"
import { useVoting } from "@/contexts/voting-context"
import Link from "next/link"

export function ContractSelector() {
  const { contracts, currentContract, setCurrentContract } = useVoting()

  const activeContracts = contracts.filter((contract) => contract.isActive)

  const handleContractChange = (contractAddress: string) => {
    const selectedContract = contracts.find((c) => c.address === contractAddress)
    if (selectedContract) {
      setCurrentContract(selectedContract)
    }
  }

  const refreshContracts = () => {
    // Forzar recarga desde localStorage
    const savedContracts = localStorage.getItem("voting-contracts")
    if (savedContracts) {
      const parsedContracts = JSON.parse(savedContracts)
      // Trigger context update
      window.dispatchEvent(new Event("storage"))
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Seleccionar Elección</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshContracts}>
              <RefreshCw className="h-4 w-4" />
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
          <div>
            <label className="text-sm font-medium mb-2 block">Elección Activa:</label>
            <Select value={currentContract.address} onValueChange={handleContractChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una elección" />
              </SelectTrigger>
              <SelectContent>
                {activeContracts.map((contract) => (
                  <SelectItem key={contract.address} value={contract.address}>
                    <div className="flex items-center justify-between w-full">
                      <span>{contract.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {contract.candidates.length} candidatos
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeContracts.length === 0 && (
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                No hay elecciones activas.
                <Link href="/admin" className="text-yellow-900 underline ml-1">
                  Ir a administración
                </Link>
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Contrato:</strong> {currentContract.address}
            </p>
            <p>
              <strong>Descripción:</strong> {currentContract.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
