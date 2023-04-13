import { BLOCKCHAIN_TO_CHAINID, parseUnionId } from '@nftmall/sdk'
import { Item } from '@rarible/api-client'
import { useMemo } from 'react'

export const useItemChainId = (item: Item) => {
  return useMemo(() => {
    if (item?.blockchain) {
      return BLOCKCHAIN_TO_CHAINID[item.blockchain]
    }
    if (item?.id) {
      const parsed = parseUnionId(item.id)
      if (parsed) {
        return parsed.chainId
      }
    }
    console.warn(`useItemChainId: Invalid item`)
    return undefined
  }, [item?.id, item?.blockchain])
}

export default useItemChainId
