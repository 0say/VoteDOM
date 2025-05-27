import type { VotingABI, VotingContract } from "@/types/voting"

export const SEPOLIA_CHAIN_ID = "0xaa36a7" // 11155111 en hex

export const VOTING_ABI: VotingABI[] = [
  {
    inputs: [{ internalType: "string", name: "candidate", type: "string" }],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "", type: "string" }],
    name: "voteCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "hasVoted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenCost",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
]

export const TOKEN_ABI: VotingABI[] = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
]

export const DEFAULT_CONTRACTS: VotingContract[] = [
  {
    address: "0x0000000000000000000000000000000000000001", // Contrato vacío para pruebas
    name: "Elección Presidencial 2024",
    description: "Votación para presidente de la república",
    isActive: true,
    tokenAddress: "", // Sin token requerido
    candidates: ["María González", "Juan Pérez", "Ana Rodríguez"],
  },
  {
    address: "0x0000000000000000000000000000000000000002", // Contrato vacío para pruebas
    name: "Elección Municipal",
    description: "Votación para alcalde municipal",
    isActive: false,
    tokenAddress: "", // Sin token requerido
    candidates: ["Carlos López", "Elena Martín", "Roberto Silva"],
  },
  {
    address: "0xccbc23ea88b0eb29bb6ccd39ebbffcbdfad658f5", // Tu contrato real donde ya votaste
    name: "Elección Real (Ya Votado)",
    description: "Contrato donde ya emitiste tu voto",
    isActive: false,
    tokenAddress: "0x1331CBc799aE564a1287e253bAe48C3407197A15",
    candidates: ["Candidato A", "Candidato B", "Candidato C"],
  },
]
