import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@sushiswap/core-sdk'
// import ms from 'ms.macro'

const NETWORK_POLLING_INTERVALS: { [chainId: number]: number } = {
  [ChainId.ARBITRUM]: 1000, // ms`1s`,
  [ChainId.ARBITRUM_TESTNET]: 1000, // ms`1s`,
  [ChainId.HARMONY]: 1000, // ms`1s`,
  [ChainId.MATIC]: 1000, // ms`1s`,
  // @nftmall
  [ChainId.THUNDERCORE]: 2000, // ms`1s`,
  [ChainId.THUNDERCORE_TESTNET]: 2000, // ms`1s`,
  [ChainId.BTTC]: 2000, // ms`1s`,
  [ChainId.BTTC_TESTNET]: 2000, // ms`1s`,
}

export default function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(
    provider,
    typeof provider.chainId === 'number'
      ? provider.chainId
      : typeof provider.chainId === 'string'
      ? parseInt(provider.chainId)
      : 'any'
  )
  library.pollingInterval = 15_000
  library.detectNetwork().then((network) => {
    const networkPollingInterval = NETWORK_POLLING_INTERVALS[network.chainId]
    if (networkPollingInterval) {
      console.debug('Setting polling interval', networkPollingInterval)
      library.pollingInterval = networkPollingInterval
    }
  })
  return library
}
