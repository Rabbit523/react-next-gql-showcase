import { BoxProps, ButtonProps, SimpleGrid, VStack } from '@chakra-ui/react'
import { HOME_BODY } from '@nftmall/sdk'
import { ChakraHeadingProps } from '@nftmall/uikit'
import { NFTActionCard } from 'app/components/NFTActionCard'
import { useRecentItemsInfiniteScroll } from 'app/services/our-api/hooks'
import dynamic from 'next/dynamic'
import { FC, memo, useMemo } from 'react'

const ChakraDivider = memo(dynamic<BoxProps>(() => import('@nftmall/uikit').then((module) => module.ChakraDivider)))
const ChakraHeadingEmoji = memo(
  dynamic<ChakraHeadingProps>(() => import('@nftmall/uikit').then((module) => module.ChakraHeadingEmoji))
)
const MarketplaceGradientEffects = memo(
  dynamic(() => import('@nftmall/uikit').then((module) => module.MarketplaceGradientEffects))
)

const NFTActionCardSkeleton = memo(
  dynamic(() => import('@nftmall/uikit').then((module) => module.NFTActionCardSkeleton))
)
const SecondaryGradientButton = memo(
  dynamic<ButtonProps>(() => import('@nftmall/uikit').then((module) => module.SecondaryGradientButton))
)

const RecentlyListedItems: FC = () => {
  const count = 24
  const skeletonArray = useMemo(() => {
    return [...Array(count)].map((_, index) => index)
  }, [count])

  const { items, isLoadingInitialData, isLoadingMore, isEmpty, isReachingEnd, isRefreshing, loadNextPage } =
    useRecentItemsInfiniteScroll({
      variables: { count },
      swrConfig: {
        refreshInterval: 60 * 1000,
      },
    })

  // console.error({ items, isLoadingInitialData, isLoadingMore, isEmpty, isReachingEnd, isRefreshing })
  return (
    <VStack align="initial" spacing={4} position="relative">
      {items?.length > 0 && <MarketplaceGradientEffects />}
      <ChakraHeadingEmoji
        textAlign={'center'}
        emoji={HOME_BODY.recentlyListed.emoji}
        text={HOME_BODY.recentlyListed.title}
        zIndex={1}
      />
      <ChakraDivider />
      <VStack spacing={12} py={4}>
        <SimpleGrid
          columns={{
            base: 1,
            md: 2,
            lg: 3,
            xl: 4,
            xxl: 5,
            xxxl: 6,
            el: 8,
            exl: 11,
          }}
          spacingX={4}
          spacingY={6}
          width="100%"
        >
          {items?.length > 0 &&
            items.map((item) => {
              // FIXME: https://github.com/NFTmall/NFTmall/issues/1055
              if (item?.bestSellOrder) return <NFTActionCard key={item.id} itemId={item.id} fallbackItem={item} />
              return null
            })}
          {(isLoadingInitialData || isLoadingMore || !items) &&
            skeletonArray.map((index) => <NFTActionCardSkeleton key={`recent-skeleton-${index}`} />)}
        </SimpleGrid>
        {!(isLoadingInitialData || isLoadingMore) && !isReachingEnd && (
          <SecondaryGradientButton aria-label="load more" maxW="fit-content" size="lg" px={16} onClick={loadNextPage}>
            Load More
          </SecondaryGradientButton>
        )}
      </VStack>
    </VStack>
  )
}

export default RecentlyListedItems
