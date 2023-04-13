import {
  ItemFilterDto,
  nextApiFetchers,
  NextCollection,
  NextCollectionFilterDto,
  NFTMALL_ERC721_ADDRESS,
  SWRParam,
  unionApiClient,
} from '@nftmall/sdk'
import { Item } from '@rarible/api-client'
import { ChainId } from '@sushiswap/core-sdk'
import stringify from 'fast-json-stable-stringify'
import { useCallback, useEffect, useMemo } from 'react'
import useSWR, { KeyLoader, SWRResponse } from 'swr'
import useSWRInfinite, { SWRInfiniteConfiguration, SWRInfiniteKeyLoader, SWRInfiniteResponse } from 'swr/infinite'

const useCollectionSearch = ({ variables, shouldFetch = true, swrConfig = undefined }: SWRParam) => {
  const filterDto = variables?.filterDto as NextCollectionFilterDto
  if (shouldFetch && !variables) {
    console.warn('Empty variables provided' + stringify(variables))
  }
  return useSWR(
    shouldFetch ? ['collections', filterDto] : null,
    ([path, dto]) => nextApiFetchers.collection.filter(dto),
    swrConfig
  )
}

interface useNextCollectionProps extends SWRParam {
  variables: {
    collectionId: string
  }
}
// Collection stat
export const useNextCollection = ({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: useNextCollectionProps): SWRResponse<NextCollection, any> => {
  return useSWR(
    shouldFetch ? `collections/${variables.collectionId}` : null,
    ([path, dto]) => nextApiFetchers.collection.getById(variables.collectionId),
    swrConfig
  )
}

// Collection stat
export const useTopCollections = ({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: SWRParam): SWRResponse<NextCollection[], any> => {
  const filterDto = {
    count: variables?.count || 12,
    hasMetadata: true,
    needGoodCollection: true,
  }
  return useSWR(
    shouldFetch ? ['topCollection', filterDto] : null,
    ([path, dto]) => nextApiFetchers.collection.topCollections(dto),
    swrConfig
  )
  // Top collection no longer uses collection filtering
  // const filterDto: NextCollectionFilterDto = {
  //   sortBy: variables?.sortBy,
  //   count: 12,
  //   skip: 0,
  //   hasMetadata: true,
  //   needGoodCollection: true,
  // }
  // return useCollectionSearch({ variables: { filterDto }, shouldFetch, swrConfig })
}

// ===== items

interface InfiniteItemFilteringProps extends SWRParam {
  variables: ItemFilterDto
  cacheKeyPrefix?: string
  swrConfig?: SWRInfiniteConfiguration
}

export const useInfiniteItemFiltering = ({
  variables,
  cacheKeyPrefix = '/item',
  shouldFetch = true,
  swrConfig = undefined,
}: InfiniteItemFilteringProps): SWRInfiniteResponse<Item[], any> => {
  const getKey = (
    pageIndex: number,
    previousPageData: any
  ): [
    string,
    {
      skip: number
      count: number
    }
  ] => {
    if (previousPageData && !previousPageData?.length) return null
    const dto = {
      ...variables,
      skip: pageIndex * variables.count,
      count: variables.count,
    }
    const cacheKey = `${cacheKeyPrefix}:${stringify(dto)}`
    return [cacheKey, dto]
  }
  return useSWRInfinite(
    shouldFetch ? getKey : null,
    ([cacheKey, dto]) => {
      console.log({ cacheKey, dto })
      return nextApiFetchers.item.filter(dto)
    },
    swrConfig
  )
}

interface ItemInfiniteScrollRes {
  swrRes: SWRInfiniteResponse<Item[], any>
  items: Item[]
  isLoadingInitialData: boolean
  isLoadingMore: boolean
  isEmpty: boolean
  isReachingEnd: boolean
  isRefreshing: boolean
  loadNextPage: () => void
  reset: () => void // when
}

export const useItemInfiniteScroll = ({
  variables,
  cacheKeyPrefix = '/item',
  shouldFetch = true,
  swrConfig = undefined,
}: InfiniteItemFilteringProps): ItemInfiniteScrollRes => {
  const swrRes = useInfiniteItemFiltering({
    variables,
    cacheKeyPrefix,
    shouldFetch,
    swrConfig,
  })
  const { data, error, mutate, size, setSize, isValidating } = swrRes
  const items: Item[] = useMemo(() => {
    if (!data) return []
    const linear = items?.length ? [...items] : []
    data.forEach((val, index) => linear.push(...val))
    console.log({ linear })
    return linear
  }, [data])
  const isLoadingInitialData = !data && !error
  const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = data?.[0]?.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < variables.count)
  const isRefreshing = isValidating && data && data.length === size

  const loadNextPage = useCallback(() => !isReachingEnd && setSize(size + 1), [isReachingEnd, setSize, size])

  const reset = useCallback(() => {
    setSize(1)
    mutate()
  }, [setSize, mutate])

  const stringifiedFilter = useMemo(() => stringify(variables), [variables])

  useEffect(() => {
    if (stringifiedFilter && variables) {
      if (!isLoadingInitialData) {
        console.log('Resetting', variables)
        reset()
      }
    }
    // only monitor `stringifiedFilter`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringifiedFilter])

  return {
    swrRes,
    items,
    isLoadingInitialData,
    isLoadingMore,
    isEmpty,
    isReachingEnd,
    isRefreshing,
    loadNextPage,
    reset,
  }
}

export const useRecentItemsInfiniteScroll = ({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: InfiniteItemFilteringProps) => {
  return useItemInfiniteScroll({
    // HOTFIX: https://github.com/NFTmall/NFTmall/issues/1056
    variables: {
      count: variables?.count || 12,
      collectionId: NFTMALL_ERC721_ADDRESS[ChainId.BTTC].toLowerCase(),
      skip: 0,
      // salesIn: 'FIXED_PRICE',
    },
    cacheKeyPrefix: 'recent items',
    shouldFetch,
    swrConfig,
  })
}

export const useOwnedItemsInfiniteScroll = ({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: InfiniteItemFilteringProps) => {
  return useItemInfiniteScroll({
    variables: {
      ownerId: variables.ownerId,
      count: variables?.count || 12,
      skip: 0,
    },
    cacheKeyPrefix: 'owned items',
    shouldFetch,
    swrConfig,
  })
}

export const useCreatedItemsInfiniteScroll = ({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: InfiniteItemFilteringProps) => {
  return useItemInfiniteScroll({
    variables: {
      creatorId: variables.creatorId,
      count: variables?.count || 12,
      skip: 0,
    },
    cacheKeyPrefix: 'created items',
    shouldFetch,
    swrConfig,
  })
}

export const useCollectionItemsInfiniteScroll = ({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: InfiniteItemFilteringProps) => {
  // console.warn(variables)
  return useItemInfiniteScroll({
    variables: {
      ...variables,
      needGoodItem: false,
      count: variables?.count || 12,
      skip: 0,
    },
    cacheKeyPrefix: `items in collection: ${variables?.collectionId}`,
    shouldFetch,
    swrConfig,
  })
}
