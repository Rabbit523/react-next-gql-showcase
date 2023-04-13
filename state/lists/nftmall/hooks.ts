import { SUPPORTED_CURRENCIES } from '@nftmall/sdk'
import { ChainId, Currency } from '@sushiswap/core-sdk'

import DEFAULT_TOKEN_LIST from '../../../config/tokenLists/default.tokenlist.json'
import { listToTokenMap } from '../hooks'

export const supportedCurrencyMap = listToTokenMap(DEFAULT_TOKEN_LIST)

// @nftgeek
export function useSupportedCurrenciesByChainId(chainId: ChainId | undefined): Currency[] {
  return SUPPORTED_CURRENCIES[chainId] || []
}
