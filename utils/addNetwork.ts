// import { BigNumber } from '@ethersproject/bignumber'
// import { hexStripZeros } from '@ethersproject/bytes'
import { Web3Provider } from '@ethersproject/providers'
import { Network, WindowChain } from '@nftmall/sdk'
import { ChainId } from '@sushiswap/core-sdk'

interface AddNetworkArguments {
  library: Web3Provider
  chainId: ChainId
  info: Network
}

// provider.request returns Promise<any>, but wallet_switchEthereumChain must return null or throw
// see https://github.com/rekmarks/EIPs/blob/3326-create/EIPS/eip-3326.md for more info on wallet_switchEthereumChain
export async function addNetwork({ library, chainId, info }: AddNetworkArguments): Promise<null | void> {
  if (!library?.provider?.request) {
    const provider = (window as WindowChain).ethereum
    try {
      await provider.send('wallet_addEthereumChain', [info])
    } catch (error) {
      console.error('error adding eth network: ', chainId, info, error)
    }
  }
  try {
    await library?.send('wallet_addEthereumChain', [info])
    // NOTE: this is referred by uniswap
    // await library?.provider.request({
    //   method: 'wallet_addEthereumChain',
    //   params: info,
    // })
  } catch (error) {
    console.error('error adding eth network: ', chainId, info, error)
  }
}
