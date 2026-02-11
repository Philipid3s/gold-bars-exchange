import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { polygonAmoy } from 'viem/chains'
import { web3Config } from '../config/web3'

export const AMOY_CHAIN = polygonAmoy

export const createViemClients = async () => {
  if (typeof window === 'undefined') return null
  const { ethereum } = window
  const rpcUrl = web3Config.rpcUrl

  if (ethereum) {
    const walletClient = createWalletClient({
      chain: AMOY_CHAIN,
      transport: custom(ethereum)
    })
    const publicClient = createPublicClient({
      chain: AMOY_CHAIN,
      transport: custom(ethereum)
    })
    return { walletClient, publicClient }
  }

  if (rpcUrl) {
    const publicClient = createPublicClient({
      chain: AMOY_CHAIN,
      transport: http(rpcUrl)
    })
    return { walletClient: null, publicClient }
  }

  return null
}

export const ensureAmoyChain = async (walletClient) => {
  if (!walletClient) return { ok: false, reason: 'no_wallet' }
  try {
    const chainId = await walletClient.getChainId()
    if (chainId === AMOY_CHAIN.id) return { ok: true, chainId }
    try {
      await walletClient.switchChain({ id: AMOY_CHAIN.id })
      return { ok: true, chainId: AMOY_CHAIN.id }
    } catch (switchErr) {
      try {
        await walletClient.addChain({ chain: AMOY_CHAIN })
        await walletClient.switchChain({ id: AMOY_CHAIN.id })
        return { ok: true, chainId: AMOY_CHAIN.id }
      } catch (addErr) {
        return { ok: false, reason: 'switch_failed' }
      }
    }
  } catch (err) {
    return { ok: false, reason: 'chain_check_failed' }
  }
}
