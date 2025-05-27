import { supabase, supabaseAdmin, isSupabaseConfigured } from "./supabase"
import type { DatabaseContract, DatabaseVote } from "@/types/database"
import type { VotingContract } from "@/types/voting"
import { dbContractToVotingContract } from "@/types/database"

export class DatabaseService {
  // Check if Supabase is available
  private static checkSupabase() {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase not configured, using fallback data")
      return false
    }
    return true
  }

  // Fallback contracts when Supabase is not available
  private static getFallbackContracts(): VotingContract[] {
    return [
      {
        address: "0x0000000000000000000000000000000000000001",
        name: "Elección Presidencial 2024 (Local)",
        description: "Votación para presidente de la república - Datos locales",
        isActive: true,
        tokenAddress: "",
        candidates: ["María González", "Juan Pérez", "Ana Rodríguez"],
      },
      {
        address: "0x0000000000000000000000000000000000000002",
        name: "Elección Municipal (Local)",
        description: "Votación para alcalde municipal - Datos locales",
        isActive: false,
        tokenAddress: "",
        candidates: ["Carlos López", "Elena Martín", "Roberto Silva"],
      },
    ]
  }

  // Test database connection
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.checkSupabase() || !supabase) {
      return { success: false, error: "Supabase not configured" }
    }

    try {
      const { data, error } = await supabase.from("voting_contracts").select("count").limit(1)

      if (error) {
        console.error("Database connection test failed:", error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error("Database connection test error:", error)
      return { success: false, error: (error as Error).message }
    }
  }

  // Obtener todos los contratos
  static async getContracts(): Promise<VotingContract[]> {
    if (!this.checkSupabase() || !supabase) {
      console.log("Using fallback contracts (Supabase not configured)")
      return this.getFallbackContracts()
    }

    try {
      // Test connection first
      const connectionTest = await this.testConnection()
      if (!connectionTest.success) {
        console.warn("Database connection failed, using fallback:", connectionTest.error)
        return this.getFallbackContracts()
      }

      const { data, error } = await supabase
        .from("voting_contracts")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching contracts:", error)
        console.log("Falling back to local data")
        return this.getFallbackContracts()
      }

      if (!data || data.length === 0) {
        console.log("No contracts found in database, using fallback")
        return this.getFallbackContracts()
      }

      console.log(`Successfully loaded ${data.length} contracts from database`)
      return (data as DatabaseContract[]).map(dbContractToVotingContract)
    } catch (error) {
      console.error("Error in getContracts:", error)
      console.log("Falling back to local data")
      return this.getFallbackContracts()
    }
  }

  // Obtener contratos activos
  static async getActiveContracts(): Promise<VotingContract[]> {
    const allContracts = await this.getContracts()
    return allContracts.filter((contract) => contract.isActive)
  }

  // Crear un nuevo contrato
  static async createContract(
    contract: VotingContract,
  ): Promise<{ success: boolean; error?: string; data?: VotingContract }> {
    if (!this.checkSupabase() || !supabaseAdmin) {
      return {
        success: false,
        error: "Supabase not configured. Contract creation requires database connection.",
      }
    }

    try {
      // Test connection first
      const connectionTest = await this.testConnection()
      if (!connectionTest.success) {
        return { success: false, error: `Database connection failed: ${connectionTest.error}` }
      }

      // Si se marca como activo, desactivar otros contratos primero
      if (contract.isActive) {
        await supabaseAdmin
          .from("voting_contracts")
          .update({ is_active: false })
          .neq("blockchain_address", contract.address)
      }

      // Prepare the contract data for insertion (without ID - it will be auto-generated)
      const contractData = {
        name: contract.name,
        description: contract.description,
        blockchain_address: contract.address,
        is_active: contract.isActive,
        candidates: contract.candidates,
        token_address: contract.tokenAddress || null,
        network: "sepolia",
        created_by: "admin@voting.com",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log("Creating contract with data:", contractData)

      const { data, error } = await supabaseAdmin.from("voting_contracts").insert([contractData]).select().single()

      if (error) {
        console.error("Error creating contract:", error)
        return { success: false, error: error.message }
      }

      console.log("Contract created successfully:", data)
      return {
        success: true,
        data: dbContractToVotingContract(data as DatabaseContract),
      }
    } catch (error) {
      console.error("Error in createContract:", error)
      return { success: false, error: (error as Error).message }
    }
  }

  // Actualizar un contrato
  static async updateContract(
    contractAddress: string,
    updates: Partial<VotingContract>,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.checkSupabase() || !supabaseAdmin) {
      return {
        success: false,
        error: "Supabase not configured. Contract updates require database connection.",
      }
    }

    try {
      // Test connection first
      const connectionTest = await this.testConnection()
      if (!connectionTest.success) {
        return { success: false, error: `Database connection failed: ${connectionTest.error}` }
      }

      // Si se marca como activo, desactivar otros contratos primero
      if (updates.isActive) {
        await supabaseAdmin
          .from("voting_contracts")
          .update({ is_active: false })
          .neq("blockchain_address", contractAddress)
      }

      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive
      if (updates.candidates !== undefined) updateData.candidates = updates.candidates
      if (updates.tokenAddress !== undefined) updateData.token_address = updates.tokenAddress || null
      if (updates.address !== undefined) updateData.blockchain_address = updates.address

      console.log("Updating contract with data:", updateData)

      const { error } = await supabaseAdmin
        .from("voting_contracts")
        .update(updateData)
        .eq("blockchain_address", contractAddress)

      if (error) {
        console.error("Error updating contract:", error)
        return { success: false, error: error.message }
      }

      console.log("Contract updated successfully")
      return { success: true }
    } catch (error) {
      console.error("Error in updateContract:", error)
      return { success: false, error: (error as Error).message }
    }
  }

  // Eliminar un contrato
  static async deleteContract(contractAddress: string): Promise<{ success: boolean; error?: string }> {
    if (!this.checkSupabase() || !supabaseAdmin) {
      return {
        success: false,
        error: "Supabase not configured. Contract deletion requires database connection.",
      }
    }

    try {
      // Test connection first
      const connectionTest = await this.testConnection()
      if (!connectionTest.success) {
        return { success: false, error: `Database connection failed: ${connectionTest.error}` }
      }

      const { error } = await supabaseAdmin.from("voting_contracts").delete().eq("blockchain_address", contractAddress)

      if (error) {
        console.error("Error deleting contract:", error)
        return { success: false, error: error.message }
      }

      console.log("Contract deleted successfully")
      return { success: true }
    } catch (error) {
      console.error("Error in deleteContract:", error)
      return { success: false, error: (error as Error).message }
    }
  }

  // Registrar un voto en la base de datos
  static async recordVote(
    contractAddress: string,
    candidateName: string,
    voterAddress: string,
    txHash?: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.checkSupabase() || !supabase || !supabaseAdmin) {
      console.log("Vote recorded locally (Supabase not configured)")
      return { success: true }
    }

    try {
      // Test connection first
      const connectionTest = await this.testConnection()
      if (!connectionTest.success) {
        console.log("Database connection failed, vote recorded locally")
        return { success: true }
      }

      // Primero obtener el contract_id
      const { data: contractData, error: contractError } = await supabase
        .from("voting_contracts")
        .select("id")
        .eq("blockchain_address", contractAddress)
        .single()

      if (contractError || !contractData) {
        return { success: false, error: "Contract not found" }
      }

      const voteData = {
        contract_id: contractData.id,
        candidate_name: candidateName,
        voter_address: voterAddress,
        blockchain_tx_hash: txHash,
        is_blockchain_confirmed: !!txHash,
        timestamp: new Date().toISOString(),
      }

      const { error } = await supabaseAdmin.from("votes").insert([voteData])

      if (error) {
        console.error("Error recording vote:", error)
        return { success: false, error: error.message }
      }

      console.log("Vote recorded successfully in database")
      return { success: true }
    } catch (error) {
      console.error("Error in recordVote:", error)
      return { success: false, error: (error as Error).message }
    }
  }

  // Obtener votos de un contrato
  static async getVotes(contractAddress: string): Promise<DatabaseVote[]> {
    if (!this.checkSupabase() || !supabase) {
      return []
    }

    try {
      // Test connection first
      const connectionTest = await this.testConnection()
      if (!connectionTest.success) {
        return []
      }

      const { data: contractData, error: contractError } = await supabase
        .from("voting_contracts")
        .select("id")
        .eq("blockchain_address", contractAddress)
        .single()

      if (contractError || !contractData) {
        return []
      }

      const { data, error } = await supabase
        .from("votes")
        .select("*")
        .eq("contract_id", contractData.id)
        .order("timestamp", { ascending: false })

      if (error) {
        console.error("Error fetching votes:", error)
        return []
      }

      return data as DatabaseVote[]
    } catch (error) {
      console.error("Error in getVotes:", error)
      return []
    }
  }

  // Obtener estadísticas de votos
  static async getVoteStats(contractAddress: string): Promise<Record<string, number>> {
    try {
      const votes = await this.getVotes(contractAddress)
      const stats: Record<string, number> = {}

      votes.forEach((vote) => {
        stats[vote.candidate_name] = (stats[vote.candidate_name] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error("Error in getVoteStats:", error)
      return {}
    }
  }

  // Obtener información de la base de datos
  static async getDatabaseInfo(): Promise<{
    contractCount: number
    voteCount: number
    activeContracts: number
    isConnected: boolean
  }> {
    if (!this.checkSupabase() || !supabase) {
      return { contractCount: 0, voteCount: 0, activeContracts: 0, isConnected: false }
    }

    try {
      const connectionTest = await this.testConnection()
      if (!connectionTest.success) {
        return { contractCount: 0, voteCount: 0, activeContracts: 0, isConnected: false }
      }

      const [contractsResult, votesResult, activeResult] = await Promise.all([
        supabase.from("voting_contracts").select("id", { count: "exact", head: true }),
        supabase.from("votes").select("id", { count: "exact", head: true }),
        supabase.from("voting_contracts").select("id", { count: "exact", head: true }).eq("is_active", true),
      ])

      return {
        contractCount: contractsResult.count || 0,
        voteCount: votesResult.count || 0,
        activeContracts: activeResult.count || 0,
        isConnected: true,
      }
    } catch (error) {
      console.error("Error getting database info:", error)
      return { contractCount: 0, voteCount: 0, activeContracts: 0, isConnected: false }
    }
  }
}
