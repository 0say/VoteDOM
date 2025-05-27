export interface DatabaseContract {
  id: string
  name: string
  description: string | null
  blockchain_address: string | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
  end_date: string | null
  candidates: string[]
  allow_multiple_votes: boolean | null
  requires_auth: boolean | null
  created_by: string | null
  token_address: string | null
  network: string | null
}

export interface DatabaseVote {
  id: string
  contract_id: string
  blockchain_tx_hash: string | null
  candidate_name: string
  voter_address: string | null
  voter_email: string | null
  voter_name: string | null
  voter_ip: string | null
  timestamp: string | null
  metadata: any | null
  is_blockchain_confirmed: boolean | null
}

export interface VotingContract {
  address: string
  name: string
  description: string
  isActive: boolean
  candidates: string[]
  tokenAddress?: string
}

// Convertir de DatabaseContract a VotingContract
export function dbContractToVotingContract(dbContract: DatabaseContract): VotingContract {
  return {
    address: dbContract.blockchain_address || `0x${dbContract.id.replace(/-/g, "")}`,
    name: dbContract.name,
    description: dbContract.description || "",
    isActive: dbContract.is_active || false,
    candidates: dbContract.candidates || [],
    tokenAddress: dbContract.token_address || undefined,
  }
}

// Convertir de VotingContract a DatabaseContract (for inserts - no ID needed)
export function votingContractToDbContract(contract: VotingContract): Partial<DatabaseContract> {
  return {
    name: contract.name,
    description: contract.description,
    blockchain_address: contract.address,
    is_active: contract.isActive,
    candidates: contract.candidates,
    token_address: contract.tokenAddress || null,
    network: "sepolia",
    created_by: "admin@voting.com",
  }
}
