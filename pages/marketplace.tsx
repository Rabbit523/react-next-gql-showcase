import {
  Flex,
  VStack,
  Grid,
  GridItem,
  SimpleGrid,
  BoxProps,
  ContainerProps,
  ButtonProps,
  useMediaQuery,
} from '@chakra-ui/react'
import { getMatchCollection, MARKETPLACE_BODY } from '@nftmall/sdk'
import {
  BannerProps,
  BlogCardProps,
  ChakraHeadingProps,
  ChakraSliderProps,
  CollectionCardProps,
  NFTActionCardProps,
  VUserCardProps,
} from '@nftmall/uikit'
import { NFT, User } from '@prisma/client'
import { useActiveWeb3React } from 'app/services/web3'
import { handleNFTLike, handleUserFollow } from 'app/hooks/nftmall/useSignMessage'
import useToast from 'app/hooks/nftmall/useToast'
import { useCurrencyExchangeRate } from 'app/hooks/nftmall/useTokenBalances'
import { useWalletModalToggle } from 'app/state/application/hooks'
import { useProfile } from 'app/state/profile/hook'
import { apolloAPI } from 'app/utils/apollo'
import { defaultBlogs } from 'app/utils/constants'
import dynamic from 'next/dynamic'
import { Fragment, memo, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import useGridColumnCount from 'app/hooks/nftmall/useGridColumnCount'
import { useWindowSize } from 'app/hooks/useWindowSize'
import TopCollections from 'app/features/home/TopCollections'

const Banner = memo(dynamic<BannerProps>(() => import('@nftmall/uikit').then((module) => module.Banner)))
const BlogCard = memo(dynamic<BlogCardProps>(() => import('@nftmall/uikit').then((module) => module.BlogCard)))
const ChakraDivider = memo(dynamic<BoxProps>(() => import('@nftmall/uikit').then((module) => module.ChakraDivider)))
const ChakraHeadingEmoji = memo(
  dynamic<ChakraHeadingProps>(() => import('@nftmall/uikit').then((module) => module.ChakraHeadingEmoji))
)
const ChakraLayout = memo(dynamic<ContainerProps>(() => import('@nftmall/uikit').then((module) => module.ChakraLayout)))
const ChakraSlider = memo(
  dynamic<ChakraSliderProps>(() => import('@nftmall/uikit').then((module) => module.ChakraSlider))
)
const CollectionCard = memo(
  dynamic<CollectionCardProps>(() => import('@nftmall/uikit').then((module) => module.CollectionCard))
)
const CollectionCardSkeleton = memo(
  dynamic(() => import('@nftmall/uikit').then((module) => module.CollectionCardSkeleton))
)
const MarketplaceGradientEffects = memo(
  dynamic(() => import('@nftmall/uikit').then((module) => module.MarketplaceGradientEffects))
)
const NFTActionCardSkeleton = memo(
  dynamic(() => import('@nftmall/uikit').then((module) => module.NFTActionCardSkeleton))
)
const NFTUserCardSkeleton = memo(dynamic(() => import('@nftmall/uikit').then((module) => module.NFTUserCardSkeleton)))
const SecondaryGradientButton = memo(
  dynamic<ButtonProps>(() => import('@nftmall/uikit').then((module) => module.SecondaryGradientButton))
)
const VUserCard = memo(dynamic<VUserCardProps>(() => import('@nftmall/uikit').then((module) => module.VUserCard)))

function Index() {
  const { account } = useActiveWeb3React()
  const { data: rate, isLoading: isLoadingRate } = useCurrencyExchangeRate()
  const { profile } = useProfile()
  const toggleWalletModal = useWalletModalToggle()
  const [collections, setCollections] = useState<User[]>([])
  const [hotCollections, setHotCollections] = useState<User[]>([])
  const [featuredNFTs, setFeaturedNFTs] = useState<NFT[]>([])
  const [featuredCreators, setFeaturedCreators] = useState<User[]>([])
  // const [canCreatorsLoadMore, setCanCreatorsLoadMore] = useState(false)
  const [recentNFTs, setRecentNFTs] = useState<NFT[]>([])
  const [recentNFTsCache, setRecentNFTsCache] = useState<NFT[]>([])
  const [recentNFTsOffset, setRecentNFTsOffset] = useState(0)
  const [isRecentLoading, setIsRecentLoading] = useState(false)
  const [canRecentLoadMore, setCanRecentLoadMore] = useState(true)
  const { toastError, toastSuccess } = useToast()
  const [isLargerThan768] = useMediaQuery(['(min-width: 768px)'])
  const cardColumnCount = useGridColumnCount()
  const size = useWindowSize()
  const skeletonArray = useMemo(() => {
    if (cardColumnCount) {
      return [...Array(cardColumnCount * 2)].map((_, index) => index)
    }
    return [0, 1, 2, 3, 4, 5]
  }, [cardColumnCount])
  const nftSourceSize = useMemo(() => {
    if (cardColumnCount) {
      const scrollbarWidth = isMobile ? 0 : 15
      const gridSpaceWidth = isLargerThan768 ? (cardColumnCount - 1) * 16 : 0
      const nftGroupWidth = ((size.width - scrollbarWidth) * 90) / 100 - gridSpaceWidth
      return Math.round(nftGroupWidth / cardColumnCount) - 36
    }
    return 0
  }, [size.width, cardColumnCount, isLargerThan768, isMobile])
  const fetchRecentNFTs = async (isInitial: boolean) => {
    try {
      if (isInitial) {
        setIsRecentLoading(true)
      }
      const limit = isInitial ? cardColumnCount * 4 : cardColumnCount * 2
      const offset = isInitial ? 0 : recentNFTsOffset
      const res: NFT[] = await apolloAPI.fetchRecentNFTs(offset, limit)
      if (res.length < limit) {
        setCanRecentLoadMore(false)
      }
      if (isInitial) {
        const stackNFTs = res.slice(0, res.length - res.length / 2)
        const cacheNFTs = res.slice(res.length - res.length / 2, res.length)
        setRecentNFTs(stackNFTs)
        setRecentNFTsCache(cacheNFTs)
      } else {
        setRecentNFTsCache(res)
      }
      setIsRecentLoading(false)
      setRecentNFTsOffset(offset + limit)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    let isCancel = false
    const fetchData = async () => {
      try {
        const allCollections = apolloAPI.fetchAllCollections()
        const featuredCollections = apolloAPI.fetchHotCollections()
        const fetchFeaturedNFTs = apolloAPI.fetchFeaturedNFTs(14)
        const featuredUsers = apolloAPI.fetchFeaturedUsers(14)
        const res = await Promise.all([allCollections, featuredCollections, fetchFeaturedNFTs, featuredUsers])
        if (isCancel) return
        setCollections(res[0])
        setHotCollections(res[1])
        setFeaturedNFTs(res[2])
        setFeaturedCreators(res[3])
      } catch (e) {
        console.error(e)
      }
    }
    fetchData()
    return () => {
      isCancel = true
    }
  }, [])

  useEffect(() => {
    let isCancel = false
    if (cardColumnCount) {
      if (isCancel) return
      fetchRecentNFTs(true)
    }
    return () => {
      isCancel = true
    }
  }, [cardColumnCount])

  const onHandleLike = async (likes: number, nft: NFT, mode: number): Promise<string> => {
    return ''
    // if (!account) {
    //   toggleWalletModal()
    //   return ''
    // } else {
    //   const res = await handleNFTLike(likes, nft, profile.userId, mode, account, library)
    //   if (res) {
    //     const msg = mode ? `You saved like for '${nft.name}'NFT.` : `You remove like for the '${nft.name}'NFT.`
    //     toastSuccess('Success', msg)
    //   } else {
    //     toastError('Error', res)
    //   }
    //   return res
    // }
  }

  const onHandleFollow = async (user: User, mode: number): Promise<string> => {
    return ''
    // if (!account) {
    //   toggleWalletModal()
    //   return ''
    // } else {
    //   const res = await handleUserFollow(user, mode, account, library)
    //   if (res) {
    //     const msg = mode
    //       ? `You followed '${user.name || user.userId}'.`
    //       : `You unfollowed '${user.name || user.userId}'.`
    //     toastSuccess('Success', msg)
    //   } else {
    //     toastError('Error', res)
    //   }
    //   return res
    // }
  }

  const onLoadMore = () => {
    setRecentNFTs([...recentNFTs, ...recentNFTsCache])
    setRecentNFTsCache([])
    fetchRecentNFTs(false)
  }

  return (
    <Fragment>
      <Banner from="marketplace" />
      <ChakraLayout display="flex" flexDirection="column" pt={{ base: 4, md: 8, default: 16 }}>
        <VStack width="100%" align="initial" spacing={{ base: 12, lg: 24 }} marginBottom={12} zIndex={1}>
          <TopCollections />
          {/* // NOTE: HOT COLLECTIONS */}
          {/* <VStack align="initial" spacing={4}>
            <ChakraHeadingEmoji emoji={MARKETPLACE_BODY[0].emoji} text={MARKETPLACE_BODY[0].title} />
            <ChakraDivider />
            <ChakraSlider
              totalCount={hotCollections?.length || skeletonArray.length}
              slidesToShow={cardColumnCount - 1}
              isCollectionCard
            >
              {hotCollections?.length > 0
                ? hotCollections.map((collection: User) => <CollectionCard key={collection.userId} user={collection} />)
                : skeletonArray.map((index) => <CollectionCardSkeleton key={`collection-skeleton-${index}`} />)}
            </ChakraSlider>
          </VStack> */}
          {/* // NOTE: FEATURED NFTS */}
          {/* <VStack align="initial" spacing={4}>
            <ChakraHeadingEmoji emoji={MARKETPLACE_BODY[1].emoji} text={MARKETPLACE_BODY[1].title} />
            <ChakraDivider />
            <ChakraSlider
              totalCount={featuredNFTs?.length || skeletonArray.length}
              slidesToShow={cardColumnCount - 1}
              isCollectionCard
            >
              {featuredNFTs?.length > 0 && (collections || []).length > 0
                ? featuredNFTs.map((nft: NFT, index: number) =>
                    getMatchCollection(collections, nft) ? (
                      <NFTActionCard
                        key={`featured-${index}`}
                        account={account}
                        collection={getMatchCollection(collections, nft)}
                        isFullHeight
                        nft={nft}
                        rate={rate}
                        handleLike={(likes, nft, mode) => onHandleLike(likes, nft, mode)}
                        handleFollow={(user, mode) => onHandleFollow(user, mode)}
                      />
                    ) : null
                  )
                : skeletonArray.map((index) => <NFTActionCardSkeleton key={`featured-skeleton-${index}`} />)}
            </ChakraSlider>
          </VStack> */}
          {/* // NOTE: HOT CREATORS */}
          {/* <VStack align="initial" spacing={4}>
            <Flex align="center" justify="space-between" width="100%">
              <ChakraHeadingEmoji emoji={MARKETPLACE_BODY[2].emoji} text={MARKETPLACE_BODY[2].title} />
              {canCreatorsLoadMore && (
                <SecondaryGradientButton
                  aria-label="load more"
                  maxW="fit-content"
                  px={8}
                  onClick={() => onLoadMore('user')}
                >
                  View All Creators
                </SecondaryGradientButton>
              )}
            </Flex>
            <ChakraDivider />
            <VStack spacing={12} py={4}>
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xxl: 4, xxxl: 5, el: 8 }} spacing={8} w="100%">
                {featuredCreators?.length > 0
                  ? featuredCreators.map((user: User) => (
                      <VUserCard
                        key={user.userId}
                        account={account}
                        user={user}
                        onFollow={(user, mode) => onHandleFollow(user, mode)}
                      />
                    ))
                  : skeletonArray.map((index) => <NFTUserCardSkeleton key={`creator-skeleton-${index}`} />)}
              </SimpleGrid>
            </VStack>
          </VStack> */}
          {/* // NOTE: RECENT NFTS */}
          {/* <VStack align="initial" spacing={4} position="relative">
            {recentNFTs?.length > 0 && collections && <MarketplaceGradientEffects />}
            <ChakraHeadingEmoji emoji={MARKETPLACE_BODY[3].emoji} text={MARKETPLACE_BODY[3].title} zIndex={1} />
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
                spacing={4}
                width="100%"
              >
                {recentNFTs?.length > 0 &&
                  collections &&
                  recentNFTs.map((nft: NFT) => (
                    <NFTActionCard
                      key={nft.tokenId}
                      account={account}
                      cardSize={nftSourceSize}
                      collection={getMatchCollection(collections, nft)}
                      nft={nft}
                      rate={rate}
                      handleLike={(likes, nft, mode) => onHandleLike(likes, nft, mode)}
                      handleFollow={(user, mode) => onHandleFollow(user, mode)}
                    />
                  ))}
                {(isRecentLoading || !recentNFTs) &&
                  skeletonArray.map((index) => <NFTActionCardSkeleton key={`recent-skeleton-${index}`} />)}
              </SimpleGrid>
              {!isRecentLoading && canRecentLoadMore && (
                <SecondaryGradientButton
                  aria-label="load more"
                  maxW="fit-content"
                  size="lg"
                  px={16}
                  onClick={onLoadMore}
                >
                  Load more
                </SecondaryGradientButton>
              )}
            </VStack>
          </VStack> */}
        </VStack>
        {/* // NOTE: BLOGS */}
        <Grid
          templateColumns={{ base: 'repeat(6,1fr)', el: 'repeat(5,1fr)' }}
          templateRows="repeat(1,1fr)"
          gap={{ base: 4, default: 8 }}
          zIndex={1}
        >
          {defaultBlogs.map((blog, index) => (
            <GridItem
              display="grid"
              colSpan={{ base: 6, md: 3, xl: index < 2 ? 3 : 2, el: 1 }}
              maxH={{ base: 'fit-content', xl: index < 2 ? 80 : 'fit-content', el: 'fit-content' }}
              key={blog.title}
            >
              <BlogCard blog={blog} index={index} />
            </GridItem>
          ))}
        </Grid>
      </ChakraLayout>
    </Fragment>
  )
}

export default memo(Index)
