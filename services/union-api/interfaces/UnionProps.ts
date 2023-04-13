import { ChainId } from '@sushiswap/core-sdk'
import { SWRConfiguration } from 'swr'

export interface UnionProps {
  chainId?: ChainId
  variables?: { [key: string]: any }
  shouldFetch?: boolean
  swrConfig?: SWRConfiguration
}
