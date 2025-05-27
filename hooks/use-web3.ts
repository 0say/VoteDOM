"use client"

import { useState, useEffect, useCallback } from "react"
import type { WalletState } from "@/types/voting"

declare global {
  interface Window {
    ethereum?: any
    Web3?: any
  }
}

export function useWeb3() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    account: null,
    chainId: null,
    hasVoted: false,
    tokenBalance: 0,
  })
  const [web3, setWeb3] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("Por favor instala MetaMask")
    }

    setIsLoading(true)
    try {
      console.log("🔄 Iniciando conexión de wallet...")

      // Solicitar conexión
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      console.log("✅ Cuentas obtenidas:", accounts)

      // Verificar red
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      })

      console.log("🌐 ChainId actual:", chainId)

      // Cambiar a Sepolia si es necesario
      if (chainId !== "0xaa36a7") {
        console.log("🔄 Cambiando a Sepolia...")
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }],
          })
          console.log("✅ Red cambiada a Sepolia")
        } catch (switchError: any) {
          console.log("❌ Error cambiando red:", switchError)
          if (switchError.code === 4902) {
            console.log("🔄 Agregando red Sepolia...")
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0xaa36a7",
                  chainName: "Sepolia Testnet",
                  nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://sepolia.infura.io/v3/"],
                  blockExplorerUrls: ["https://sepolia.etherscan.io/"],
                },
              ],
            })
            console.log("✅ Red Sepolia agregada")
          } else {
            throw new Error("Por favor cambia a Sepolia Testnet manualmente")
          }
        }
      }

      // Cargar Web3 dinámicamente
      console.log("🔄 Cargando Web3...")
      if (!window.Web3) {
        const Web3 = (await import("web3")).default
        window.Web3 = Web3
        console.log("✅ Web3 cargado")
      }

      // Inicializar Web3
      const web3Instance = new window.Web3(window.ethereum)
      setWeb3(web3Instance)
      console.log("✅ Web3 inicializado")

      // Actualizar estado
      const newState = {
        isConnected: true,
        account: accounts[0],
        chainId: "0xaa36a7",
        hasVoted: false,
        tokenBalance: 0,
      }

      setWalletState(newState)
      console.log("✅ Estado actualizado:", newState)

      return { account: accounts[0], chainId: "0xaa36a7", web3: web3Instance }
    } catch (error) {
      console.error("❌ Error en connectWallet:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      })
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia Testnet",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://sepolia.infura.io/v3/"],
              blockExplorerUrls: ["https://sepolia.etherscan.io/"],
            },
          ],
        })
      }
    }
  }, [])

  // Verificar conexión existente al cargar
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            const chainId = await window.ethereum.request({ method: "eth_chainId" })

            // Cargar Web3 si hay conexión existente
            if (!window.Web3) {
              const Web3 = (await import("web3")).default
              window.Web3 = Web3
            }

            const web3Instance = new window.Web3(window.ethereum)
            setWeb3(web3Instance)

            setWalletState({
              isConnected: true,
              account: accounts[0],
              chainId,
              hasVoted: false,
              tokenBalance: 0,
            })

            console.log("🔄 Conexión existente detectada:", accounts[0])
          }
        } catch (error) {
          console.error("Error checking existing connection:", error)
        }
      }
    }

    checkExistingConnection()
  }, [])

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("🔄 Cuentas cambiadas:", accounts)
        if (accounts.length === 0) {
          setWalletState({
            isConnected: false,
            account: null,
            chainId: null,
            hasVoted: false,
            tokenBalance: 0,
          })
          setWeb3(null)
          console.log("❌ Wallet desconectado")
        } else {
          setWalletState((prev) => ({
            ...prev,
            account: accounts[0],
          }))
          console.log("✅ Cuenta actualizada:", accounts[0])
        }
      }

      const handleChainChanged = (chainId: string) => {
        console.log("🌐 Red cambiada:", chainId)
        setWalletState((prev) => ({
          ...prev,
          chainId,
        }))
        // Recargar si no es Sepolia
        if (chainId !== "0xaa36a7") {
          console.log("🔄 Red incorrecta, recargando...")
          window.location.reload()
        }
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  return {
    walletState,
    setWalletState,
    web3,
    connectWallet,
    switchToSepolia,
    isLoading,
  }
}
