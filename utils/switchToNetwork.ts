import { BigNumber } from '@ethersproject/bignumber'
import { hexStripZeros } from '@ethersproject/bytes'
import { Web3Provider } from '@ethersproject/providers'
import { SUPPORTED_NETWORKS, WindowChain } from '@nftmall/sdk'
import { ChainId } from '@sushiswap/core-sdk'

import { addNetwork } from './addNetwork'

interface SwitchNetworkArguments {
  library: Web3Provider
  chainId?: ChainId
}

// provider.request returns Promise<any>, but wallet_switchEthereumChain must return null or throw
// see https://github.com/rekmarks/EIPs/blob/3326-create/EIPS/eip-3326.md for more info on wallet_switchEthereumChain
export async function switchToNetwork({ library, chainId }: SwitchNetworkArguments): Promise<null | void> {
  const formattedChainId = hexStripZeros(BigNumber.from(chainId).toHexString())

  if (!library?.provider?.request) {
    const provider = (window as WindowChain).ethereum
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: formattedChainId }],
      })
    } catch (error) {
      if (error.code === 4902 && chainId !== undefined) {
        const info = SUPPORTED_NETWORKS[chainId]
        await addNetwork({ library, chainId, info })
        await switchToNetwork({ library, chainId })
      } else {
        throw error
      }
    }
  }
  if (!chainId && library?.getNetwork) {
    ;({ chainId } = await library.getNetwork())
  }

  try {
    await library?.provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: formattedChainId }],
    })
  } catch (error) {
    // 4902 is the error code for attempting to switch to an unrecognized chainId
    if (error.code === 4902 && chainId !== undefined) {
      const info = SUPPORTED_NETWORKS[chainId]

      // metamask (only known implementer) automatically switches after a network is added
      // the second call is done here because that behavior is not a part of the spec and cannot be relied upon in the future
      // metamask's behavior when switching to the current network is just to return null (a no-op)
      await addNetwork({ library, chainId, info })
      await switchToNetwork({ library, chainId })
    } else {
      throw error
    }
  }
}
