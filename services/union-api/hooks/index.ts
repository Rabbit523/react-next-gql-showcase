import {
  CollectionSaleStatsRes,
  ethApiClients,
  getCollectionSaleStats,
  makeUnionAddress,
  parseUnionId,
  SWRParam,
  unionApiClient,
} from '@nftmall/sdk'
import {
  ActivitySort,
  ActivityType,
  AuctionStatus,
  Collection,
  GetItemsByCollectionRequest,
  GetItemsByCreatorRequest,
  GetItemsByOwnerRequest,
  Item,
  Items,
  Orders,
  OrderStatus,
  Ownership,
} from '@rarible/api-client'
import { NftCollectionStats } from '@rarible/ethereum-api-client'
import { ChainId } from '@sushiswap/core-sdk'
import { useActiveWeb3React } from 'app/services/web3'
import axios from 'axios'
import { useMemo } from 'react'
import useSWR, { SWRResponse } from 'swr'
import useSWRInfinite, { SWRInfiniteResponse } from 'swr/infinite'

/**
 * get union adderss from connected account and chain id
 * @returns Union address or undefined
 */
export const useMyUnionAccount = () => {
  const { chainId, account } = useActiveWeb3React()
  const unionAccount = useMemo(() => {
    try {
      if (chainId && account) {
        // return makeUnionAddress(chainId, account)
        return makeUnionAddress(ChainId.MAINNET, account.toLowerCase())
      }
    } catch (e) {
      console.warn(e)
    }
    return undefined
  }, [chainId, account])
  return unionAccount
}

export const useItem = ({ variables, shouldFetch = true, swrConfig = undefined }: SWRParam): SWRResponse<Item, any> => {
  return useSWR(
    shouldFetch && variables?.itemId ? ['item.getItemById', variables] : null,
    () => unionApiClient.item.getItemById({ itemId: variables.itemId }),
    swrConfig
  )
}

export const useCollection = ({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: SWRParam): SWRResponse<Collection, any> => {
  return useSWR(
    shouldFetch && variables?.collectionId ? ['collection.getCollectionById', variables] : null,
    () => unionApiClient.collection.getCollectionById({ collection: variables.collectionId }),
    swrConfig
  )
}

// export function useCollection(collectionId: string) {
//   return useSWR(collectionId ? ['collection.getCollectionById', collectionId] : null, () =>
//     unionApiClient.collection.getCollectionById({ collection: collectionId })
//   )
//   // return useSWR(collectionId ? ['collection.getCollectionById', collectionId] : null, (params) => {
//   //   console.warn(params)
//   //   return unionApiClient.collection.getCollectionById({ collection: collectionId })
//   // })
// }

export function useOwnership({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: SWRParam): SWRResponse<Ownership, any> {
  // ${blockchain}:${token}:${tokenId}:${owner}
  return useSWR(
    shouldFetch && variables?.ownershipId ? ['ownership.getOwnershipById', variables] : null,
    () => unionApiClient.ownership.getOwnershipById({ ownershipId: variables.ownershipId }),
    swrConfig
  )
}

export function useItemOwnerships({ variables, shouldFetch = true, swrConfig = undefined }: SWRParam) {
  return useSWR(
    shouldFetch && variables?.itemId ? ['ownership.getOwnershipsByItem', variables] : null,
    () => unionApiClient.ownership.getOwnershipsByItem({ itemId: variables?.itemId }),
    swrConfig
  )
}

export function useItemRoyalties({ variables, shouldFetch = true, swrConfig = undefined }: SWRParam) {
  return useSWR(
    shouldFetch && variables?.itemId ? ['item.getItemRoyaltiesById', variables] : null,
    () => unionApiClient.item.getItemRoyaltiesById({ itemId: variables?.itemId }),
    swrConfig
  )
}

export function useAllSellOrdersByItem({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: SWRParam): SWRResponse<Orders, any> {
  const itemId = variables?.itemId
  const maker = variables?.maker
  const status = variables?.status || [OrderStatus.ACTIVE]
  // console.warn({ shouldFetch, itemId, variables })
  return useSWR(
    shouldFetch && itemId ? ['order.getSellOrdersByItem', variables] : null,
    async () => unionApiClient.order.getSellOrdersByItem({ itemId, status, maker }),
    swrConfig
  )
}

export function useSortedSellOrdersByItem(param: SWRParam) {
  const swrRes = useAllSellOrdersByItem(param)
  const sellOrders = swrRes.data?.orders
  const sortedSellOrders = useMemo(
    () => sellOrders?.sort((a, b) => Number.parseFloat(a.makePriceUsd) - Number.parseFloat(b.makePriceUsd)),
    [sellOrders]
  )
  // console.warn({ sellOrders, sortedSellOrders, data: swrRes.data })
  return {
    ...swrRes,
    data: sortedSellOrders,
  }
}

// export function useActiveSellOrderByItem(param) {
//   const swrRes = useAllSellOrdersByItem(param)
//   return {
//     ...swrRes,
//     data: swrRes.data?.orders?.at(0),
//   }
// }

export function useAllBidOrdersByItem({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: SWRParam): SWRResponse<Orders, any> {
  const itemId = variables?.itemId
  const maker = variables?.maker
  const status = variables?.status || [OrderStatus.ACTIVE]
  return useSWR(
    shouldFetch && itemId ? ['order.getOrderBidsByItem', variables] : null,
    () =>
      // TODO: make it infinite scroll using `continuation`
      unionApiClient.order.getOrderBidsByItem({ itemId, status, maker }),
    swrConfig
  )
}

export function useSortedBidsByItem(param: SWRParam) {
  const swrRes = useAllBidOrdersByItem(param)
  const bids = swrRes.data?.orders
  const sortedBids = useMemo(
    () => bids?.sort((a, b) => Number.parseFloat(a.makePriceUsd) - Number.parseFloat(b.makePriceUsd)),
    [bids]
  )
  return {
    ...swrRes,
    data: sortedBids,
  }
}

export function useAuctionById({ variables, shouldFetch = true, swrConfig = undefined }: SWRParam) {
  return useSWR(
    shouldFetch && variables?.auctionId ? ['auction.getAuctionById', variables] : null,
    () =>
      // NOTE: this contains `continuation` prop
      unionApiClient.auction.getAuctionById({ id: variables?.auctionId }),
    swrConfig
  )
}

export function useAllAuctionsByItem({ variables, shouldFetch = true, swrConfig = undefined }: SWRParam) {
  return useSWR(
    shouldFetch && variables?.itemId ? ['auction.getAuctionsByItem', variables?.itemId] : null,
    () =>
      // NOTE: this contains `continuation` prop
      unionApiClient.auction.getAuctionsByItem({ itemId: variables?.itemId }),
    swrConfig
  )
}

export function useActiveAuctionByERC721Item(param: SWRParam) {
  const swrRes = useAllAuctionsByItem(param)
  const activeAuctions = swrRes.data?.auctions?.filter((auction) => auction.status === AuctionStatus.ACTIVE)
  return {
    ...swrRes,
    data: activeAuctions?.at(0),
  }
}

export function useTransferHistoryByItem({ variables, shouldFetch = true, swrConfig = undefined }: SWRParam) {
  const itemId = variables?.itemId
  const args = {
    itemId,
    type: [ActivityType.TRANSFER, ActivityType.MINT],
    sort: ActivitySort.LATEST_FIRST,
  }
  return useSWR(shouldFetch && itemId ? ['activity.getActivitiesByItem', args] : null, () =>
    // NOTE: this contains `continuation` prop
    unionApiClient.activity.getActivitiesByItem(args)
  )
}
/*
export interface GetActivitiesByItemRequest {
    type: Array<ActivityType>;
    itemId?: string;
    contract?: string;
    tokenId?: string;
    continuation?: string;
    cursor?: string;
    size?: number;
    sort?: ActivitySort;
}
*/

/**
 * not working. don't use.
 * @param collectionId
 * @returns
 */
// export function useAPI(key, fetcher, args) {
//   const cachekey = key ? { key, args } : null
//   console.log({ key, cachekey, fetcher, args })
//   // const call = async (param) => {await fetcher(param)}
//   // console.log(call(param))
//   return useSWR(cachekey, (param) => {
//     console.warn(param)
//     return fetcher(param.args)
//   })
// }

// Infinite scroll

interface ItemsByOwnerParams extends SWRParam {
  variables: GetItemsByOwnerRequest
}

// https://swr.vercel.app/examples/infinite-loading
export const useItemsByOwner = ({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: ItemsByOwnerParams): SWRInfiniteResponse<Items, any> => {
  const getKey = (pageIndex: number, previousPageData: Items): GetItemsByOwnerRequest | null => {
    // reached the end
    if (previousPageData && !previousPageData.items?.length) return null
    // first page, we don't have `previousPageData`
    if (pageIndex === 0)
      return {
        owner: variables.owner,
        size: variables.size,
      } //`/items/byOwner?owner=${variables.owner}&size=${variables.size}`
    // add the cursor to the API endpoint
    return {
      owner: variables.owner,
      size: variables.size,
      continuation: previousPageData.continuation,
    } // `/items/byOwner?owner=${variables.owner}&size=${variables.size}&continuation=${previousPageData.continuation}`
  }
  // FIXME: getKey().... we may get kinda conflict with other api calls with same params.
  // we may need to add one more unique field...
  return useSWRInfinite(
    shouldFetch ? getKey : null,
    (params) => {
      return unionApiClient.item.getItemsByOwner(params)
      // console.log({ arg0, arg1 })
      // return unionApiClient.item.getItemsByOwner({
      //   owner: variables.owner,
      //   continuation: variables.continuation,
      //   size: variables.size,
      // })
    },
    swrConfig
  )
}

interface ItemsByCreatorParams extends SWRParam {
  variables: GetItemsByCreatorRequest
}

export const useItemsByCreator = ({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: ItemsByCreatorParams): SWRInfiniteResponse<Items, any> => {
  const getKey = (pageIndex: number, previousPageData: Items): GetItemsByCreatorRequest | null => {
    if (previousPageData && !previousPageData.items?.length) return null
    if (pageIndex === 0) {
      return {
        creator: variables.creator,
        size: variables.size,
      }
    }
    return {
      creator: variables.creator,
      size: variables.size,
      continuation: previousPageData.continuation,
    }
  }
  return useSWRInfinite(
    shouldFetch ? getKey : null,
    (params) => unionApiClient.item.getItemsByCreator(params),
    swrConfig
  )
}

interface ItemsByCollectionParams extends SWRParam {
  variables: GetItemsByCollectionRequest
}

export const useItemsByCollection = ({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: ItemsByCollectionParams): SWRInfiniteResponse<Items, any> => {
  const getKey = (pageIndex: number, previousPageData: Items): GetItemsByCollectionRequest | null => {
    if (previousPageData && !previousPageData.items?.length) return null
    if (pageIndex === 0) {
      return {
        collection: variables.collection,
        size: variables.size,
      }
    }
    return {
      collection: variables.collection,
      size: variables.size,
      continuation: previousPageData.continuation,
    }
  }
  return useSWRInfinite(
    shouldFetch ? getKey : null,
    (params) => unionApiClient.item.getItemsByCollection(params),
    swrConfig
  )
}

/**
 * fetch user's owned collections
 * @param ownerUnionAddress union address
 * @returns
 */
export function useUnionCollectionsByOwner({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: SWRParam): SWRResponse<Collection[], any> {
  const ownerUnionAddress = variables?.ownerUnionAddress
  return useSWR(
    shouldFetch && ownerUnionAddress ? ['collection.getCollectionsByOwner', variables] : null,
    async () => {
      const res = await unionApiClient.collection.getCollectionsByOwner({
        owner: ownerUnionAddress,
        blockchains: variables.blockchains,
        size: 50, // TODO: infinite scroll
      })
      return res.collections
    },
    swrConfig
  )
}

// ================== collection stats

export function useCollectionItemStats({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: SWRParam): SWRResponse<NftCollectionStats, any> {
  const collectionId = variables?.collectionId
  const parsedCollectionId = useMemo(() => {
    return collectionId ? parseUnionId(collectionId) : undefined
  }, [collectionId])

  return useSWR(
    shouldFetch && parsedCollectionId ? ['nftCollection.getNftCollectionStats', variables] : null,
    async () => {
      const res = await ethApiClients[parsedCollectionId.chainId].nftCollection.getNftCollectionStats({
        collection: parsedCollectionId.lowercaseAddress,
      })
      return res
    },
    swrConfig
  )
}

export function useCollectionSaleStats({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: SWRParam): SWRResponse<CollectionSaleStatsRes, any> {
  const collectionId = variables?.collectionId
  const parsed = useMemo(() => {
    return collectionId ? parseUnionId(collectionId) : undefined
  }, [collectionId])

  return useSWR(
    shouldFetch && parsed ? ['order/aggregations/aggregateNftCollectionStats', variables] : null,
    async () => getCollectionSaleStats(parsed.chainId, parsed.lowercaseAddress),
    swrConfig
  )
}
