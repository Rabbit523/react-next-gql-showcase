import { Box, TabPanel, useMediaQuery, VStack } from '@chakra-ui/react'
import { makeUnionAddress } from '@nftmall/sdk'
import { ChakraInfiniteScroll, NFTActionCardSkeleton } from '@nftmall/uikit'
import { Item } from '@rarible/api-client'
import { ChainId } from '@sushiswap/core-sdk'
import { NFTActionCard } from 'app/components/NFTActionCard'
import { useItemsByCollection, useItemsByCreator } from 'app/services/union-api/hooks'
import { FC, useCallback, useMemo } from 'react'

import { ChakraGrid } from './common'
import PlaceholderForEmptyItems from './PlaceholderForEmptyItems'

interface ItemsByCollectionProps {
  unionId: string
  limit?: number
  isSearch?: boolean
  isInFullWidth?: boolean
}

const DEFAULT_PAGE_SIZE = 12

const ItemsByCollection: FC<ItemsByCollectionProps> = ({
  unionId,
  limit = DEFAULT_PAGE_SIZE,
  isSearch = false,
  isInFullWidth = false,
  ...rest
}) => {
  const [isLargerThan769] = useMediaQuery(['(min-width: 769px)'])
  const skeletonArray = useMemo(() => {
    return [...Array(limit)].map((_, index) => index)
  }, [limit])
  // console.log({ isLoadingInitialData, isLoadingMore, isEmpty, isReachingEnd, isRefreshing })

  // const { items, isLoadingInitialData, isLoadingMore, isEmpty, isReachingEnd, isRefreshing, loadNextPage } =
  //   useCreatedItemsInfiniteScroll({
  //     variables: { creatorId: targetAccount, count: limit },
  //     shouldFetch: !!targetAccount,
  //     swrConfig: {
  //       refreshInterval: 30 * 1000,
  //     },
  //   })
  const { data, error, mutate, size, setSize, isValidating } = useItemsByCollection({
    variables: {
      collection: unionId,
      size: limit,
    },
    swrConfig: {
      refreshInterval: 10 * 60 * 1000,
    },
  })
  const items: Item[] = useMemo(() => {
    if (!data) return []
    const linear = []
    data.forEach((val, index) => linear.push(...val.items))
    return linear
  }, [data])
  const isLoadingInitialData = !data && !error
  const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = data?.[0]?.items.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.items?.length < limit)
  const isRefreshing = isValidating && data && data.length === size

  const loadNextPage = useCallback(() => !isReachingEnd && setSize(size + 1), [isReachingEnd, setSize, size])

  const unDeletedItems = useMemo(() => {
    return items.filter((item) => !item?.deleted)
  }, [items])

  return (
    <Box>
      {items?.length > 0 && (
        <ChakraInfiniteScroll
          onBottomHit={loadNextPage}
          isLoading={isLoadingInitialData || isLoadingMore}
          hasMoreData={!isReachingEnd}
          loadOnMount={false}
        >
          <VStack spacing={8}>
            <ChakraGrid isOptimized={isSearch ? isInFullWidth : isLargerThan769}>
              {unDeletedItems.map((item: any, index: number) => (
                <NFTActionCard itemId={item.id} fallbackItem={item} key={`tab-created-items-${item.id}`} />
              ))}
              {(isLoadingMore || isLoadingInitialData) &&
                skeletonArray.map((index) => (
                  <NFTActionCardSkeleton key={`tab-created-items-nft-skeleton-${items?.length}-${index}`} />
                ))}
            </ChakraGrid>
          </VStack>
        </ChakraInfiniteScroll>
      )}
      {(isEmpty || (!isLoadingInitialData && unDeletedItems.length === 0)) && <PlaceholderForEmptyItems />}
    </Box>
  )
}

export default ItemsByCollection
