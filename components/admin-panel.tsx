"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, Plus, Edit, Trash2, Save, X } from "lucide-react"
import type { VotingContract } from "@/types/voting"
import { useDatabaseVoting } from "@/contexts/database-voting-context" // Changed from useVoting

export function AdminPanel() {
  const { contracts, currentContract, setCurrentContract, createContract, updateContract, deleteContract } =
    useDatabaseVoting() // Changed from useVoting to useDatabaseVoting
  const [isEditing, setIsEditing] = useState(false)
  const [editingContract, setEditingContract] = useState<VotingContract | null>(null)
  const [newContract, setNewContract] = useState<Partial<VotingContract>>({
    name: "",
    description: "",
    address: "",
    tokenAddress: "",
    candidates: [],
    isActive: false,
  })

  const handleAddContract = async () => {
    if (!newContract.name || !newContract.address || !newContract.candidates?.length) {
      return
    }

    const contract: VotingContract = {
      address: newContract.address!,
      name: newContract.name!,
      description: newContract.description || "",
      isActive: newContract.isActive || false,
      tokenAddress: newContract.tokenAddress || undefined,
      candidates: newContract.candidates!,
    }

    const result = await createContract(contract)

    if (result.success) {
      // Reset form
      setNewContract({
        name: "",
        description: "",
        address: "",
        tokenAddress: "",
        candidates: [],
        isActive: false,
      })

      // Set as current contract if it's active
      if (contract.isActive && result.data) {
        setCurrentContract(result.data)
      }
    } else {
      console.error("Error creating contract:", result.error)
      alert("Error creando contrato: " + result.error)
    }
  }

  const handleEditContract = (contract: VotingContract) => {
    setEditingContract({ ...contract })
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!editingContract) return

    const result = await updateContract(editingContract.address, editingContract)

    if (result.success) {
      if (currentContract?.address === editingContract.address) {
        setCurrentContract(editingContract)
      }

      setIsEditing(false)
      setEditingContract(null)
    } else {
      console.error("Error updating contract:", result.error)
      alert("Error actualizando contrato: " + result.error)
    }
  }

  const handleDeleteContract = async (address: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este contrato?")) {
      return
    }

    const result = await deleteContract(address)

    if (!result.success) {
      console.error("Error deleting contract:", result.error)
      alert("Error eliminando contrato: " + result.error)
    }
  }

  const handleToggleActive = async (address: string) => {
    const contract = contracts.find((c) => c.address === address)
    if (!contract) return

    const result = await updateContract(address, { ...contract, isActive: !contract.isActive })

    if (!result.success) {
      console.error("Error toggling contract status:", result.error)
      alert("Error cambiando estado del contrato: " + result.error)
    }
  }

  const addCandidate = (candidateName: string, isEditing = false) => {
    if (!candidateName.trim()) return

    if (isEditing && editingContract) {
      setEditingContract({
        ...editingContract,
        candidates: [...editingContract.candidates, candidateName.trim()],
      })
    } else {
      setNewContract({
        ...newContract,
        candidates: [...(newContract.candidates || []), candidateName.trim()],
      })
    }
  }

  const removeCandidate = (index: number, isEditing = false) => {
    if (isEditing && editingContract) {
      setEditingContract({
        ...editingContract,
        candidates: editingContract.candidates.filter((_, i) => i !== index),
      })
    } else {
      setNewContract({
        ...newContract,
        candidates: (newContract.candidates || []).filter((_, i) => i !== index),
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Settings className="h-5 w-5" />
            Panel de Administración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Contratos Existentes */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black">Contratos de Votación</h3>
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <Card
                    key={contract.address}
                    className={`bg-white border-blue-200 shadow-lg ${
                      contract.address === currentContract?.address ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-black">{contract.name}</h4>
                            <Badge variant={contract.isActive ? "default" : "secondary"}>
                              {contract.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                            {contract.address === currentContract?.address && (
                              <Badge variant="outline" className="border-blue-300 text-blue-700">
                                En uso
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-black mb-2">{contract.description}</p>
                          <p className="text-xs font-mono text-black">{contract.address}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {contract.candidates.map((candidate, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs border-gray-300 text-black">
                                {candidate}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={contract.isActive}
                            onCheckedChange={() => handleToggleActive(contract.address)}
                          />
                          {/* <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentContract(contract)}
                            disabled={contract.address === currentContract?.address}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            Usar
                          </Button> */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditContract(contract)}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteContract(contract.address)}
                            className="border-red-300 text-red-700 hover:bg-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Formulario de Edición */}
            {isEditing && editingContract && (
              <Card className="bg-white border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-black">
                    <span>Editar Contrato</span>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name" className="text-black">
                      Nombre
                    </Label>
                    <Input
                      id="edit-name"
                      value={editingContract.name}
                      onChange={(e) =>
                        setEditingContract({
                          ...editingContract,
                          name: e.target.value,
                        })
                      }
                      className="bg-white border-blue-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description" className="text-black">
                      Descripción
                    </Label>
                    <Textarea
                      id="edit-description"
                      value={editingContract.description}
                      onChange={(e) =>
                        setEditingContract({
                          ...editingContract,
                          description: e.target.value,
                        })
                      }
                      className="bg-white border-blue-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-address" className="text-black">
                      Dirección del Contrato
                    </Label>
                    <Input
                      id="edit-address"
                      value={editingContract.address}
                      onChange={(e) =>
                        setEditingContract({
                          ...editingContract,
                          address: e.target.value,
                        })
                      }
                      placeholder="0x..."
                      className="bg-white border-blue-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-token" className="text-black">
                      Dirección del Token (Opcional)
                    </Label>
                    <Input
                      id="edit-token"
                      value={editingContract.tokenAddress || ""}
                      onChange={(e) =>
                        setEditingContract({
                          ...editingContract,
                          tokenAddress: e.target.value,
                        })
                      }
                      placeholder="0x..."
                      className="bg-white border-blue-200"
                    />
                  </div>
                  <div>
                    <Label className="text-black font-semibold">Candidatos Electorales</Label>
                    <p className="text-xs text-black mb-3">Modifica los candidatos de esta elección</p>

                    {/* Lista de candidatos existentes */}
                    {editingContract.candidates.length > 0 && (
                      <div className="mb-4 p-4 bg-white border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-medium text-black mb-2">Candidatos Registrados:</h4>
                        <div className="space-y-2">
                          {editingContract.candidates.map((candidate, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {idx + 1}
                                </div>
                                <span className="font-medium text-black">{candidate}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeCandidate(idx, true)}
                                className="border-red-300 text-red-700 hover:bg-white"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Formulario para agregar nuevo candidato */}
                    <div className="p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                      <Label className="text-sm font-medium text-black mb-2 block">Agregar Nuevo Candidato</Label>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Input
                            placeholder="Nombre completo del candidato"
                            className="bg-white border-blue-200 focus:border-blue-500"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                const input = e.target as HTMLInputElement
                                if (input.value.trim()) {
                                  addCandidate(input.value, true)
                                  input.value = ""
                                }
                              }
                            }}
                          />
                        </div>
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).parentElement?.querySelector("input")
                            if (input && input.value.trim()) {
                              addCandidate(input.value, true)
                              input.value = ""
                            }
                          }}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50 px-4"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar
                        </Button>
                      </div>
                      <p className="text-xs text-black mt-2">
                        Presiona Enter o haz clic en "Agregar" para incluir el candidato
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Formulario de Nuevo Contrato */}
            {!isEditing && (
              <Card className="bg-white border-green-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Plus className="h-5 w-5" />
                    Agregar Nuevo Contrato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-black">
                      Nombre
                    </Label>
                    <Input
                      id="name"
                      value={newContract.name}
                      onChange={(e) =>
                        setNewContract({
                          ...newContract,
                          name: e.target.value,
                        })
                      }
                      placeholder="Elección Presidencial 2024"
                      className="bg-white border-blue-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-black">
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      value={newContract.description}
                      onChange={(e) =>
                        setNewContract({
                          ...newContract,
                          description: e.target.value,
                        })
                      }
                      placeholder="Descripción de la votación"
                      className="bg-white border-blue-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-black">
                      Dirección del Contrato
                    </Label>
                    <Input
                      id="address"
                      value={newContract.address}
                      onChange={(e) =>
                        setNewContract({
                          ...newContract,
                          address: e.target.value,
                        })
                      }
                      placeholder="0x..."
                      className="bg-white border-blue-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="token" className="text-black">
                      Dirección del Token (Opcional)
                    </Label>
                    <Input
                      id="token"
                      value={newContract.tokenAddress}
                      onChange={(e) =>
                        setNewContract({
                          ...newContract,
                          tokenAddress: e.target.value,
                        })
                      }
                      placeholder="0x..."
                      className="bg-white border-blue-200"
                    />
                  </div>
                  <div>
                    <Label className="text-black font-semibold">Candidatos Electorales</Label>
                    <p className="text-xs text-black mb-3">Agrega los candidatos que participarán en esta elección</p>

                    {/* Lista de candidatos existentes */}
                    {(newContract.candidates || []).length > 0 && (
                      <div className="mb-4 p-4 bg-white border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-medium text-black mb-2">Candidatos Registrados:</h4>
                        <div className="space-y-2">
                          {(newContract.candidates || []).map((candidate, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {idx + 1}
                                </div>
                                <span className="font-medium text-black">{candidate}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeCandidate(idx)}
                                className="border-red-300 text-red-700 hover:bg-white"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Formulario para agregar nuevo candidato */}
                    <div className="p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                      <Label className="text-sm font-medium text-black mb-2 block">Agregar Nuevo Candidato</Label>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Input
                            placeholder="Nombre completo del candidato"
                            className="bg-white border-blue-200 focus:border-blue-500"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                const input = e.target as HTMLInputElement
                                if (input.value.trim()) {
                                  addCandidate(input.value)
                                  input.value = ""
                                }
                              }
                            }}
                          />
                        </div>
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).parentElement?.querySelector("input")
                            if (input && input.value.trim()) {
                              addCandidate(input.value)
                              input.value = ""
                            }
                          }}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50 px-4"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar
                        </Button>
                      </div>
                      <p className="text-xs text-black mt-2">
                        Presiona Enter o haz clic en "Agregar" para incluir el candidato
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-white border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="active" className="text-black font-semibold">
                          Estado de la Elección
                        </Label>
                        <p className="text-sm text-black mt-1">
                          {newContract.isActive
                            ? "Esta elección estará activa inmediatamente después de crearla"
                            : "Esta elección se creará como inactiva y podrás activarla después"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-medium ${newContract.isActive ? "text-green-700" : "text-black"}`}
                        >
                          {newContract.isActive ? "Activa" : "Inactiva"}
                        </span>
                        <Switch
                          id="active"
                          checked={newContract.isActive}
                          onCheckedChange={(checked) =>
                            setNewContract({
                              ...newContract,
                              isActive: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleAddContract} className="w-full bg-green-600 hover:bg-green-700">
                    Agregar Contrato
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
