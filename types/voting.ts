export interface Candidate {
  id: string
  name: string
  party: string
  votes: number
}

export interface VotingContract {
  address: string
  name: string
  description: string
  isActive: boolean
  tokenAddress?: string
  candidates: string[]
}

export interface WalletState {
  isConnected: boolean
  account: string | null
  chainId: string | null
  hasVoted: boolean
  tokenBalance: number
}

export interface VotingABI {
  inputs: Array<{
    internalType: string
    name: string
    type: string
  }>
  name: string
  outputs?: Array<{
    internalType: string
    name: string
    type: string
  }>
  stateMutability: string
  type: string
}
