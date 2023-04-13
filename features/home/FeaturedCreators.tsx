import { BoxProps, SimpleGrid, VStack } from '@chakra-ui/react'
import { HOME_BODY } from '@nftmall/sdk'
import { ChakraDivider, ChakraHeadingEmoji, ChakraHeadingProps, VUserCardProps } from '@nftmall/uikit'
import { User } from '@prisma/client'
import useGridColumnCount from 'app/hooks/nftmall/useGridColumnCount'
import { useActiveWeb3React } from 'app/services/web3'
import { apolloAPI } from 'app/utils/apollo'
import dynamic from 'next/dynamic'
import { FC, memo, useEffect, useMemo, useState } from 'react'

const NFTUserCardSkeleton = memo(dynamic(() => import('@nftmall/uikit').then((module) => module.NFTUserCardSkeleton)))
const VUserCard = memo(dynamic<VUserCardProps>(() => import('@nftmall/uikit').then((module) => module.VUserCard)))

interface FeaturedCreatorsProps {
  fallbackUsers: User[]
}

const FeaturedCreators: FC<FeaturedCreatorsProps> = ({ fallbackUsers }) => {
  const { account } = useActiveWeb3React()
  // const [featuredCreators, setFeaturedCreators] = useState<User[]>([])
  const featuredCreators = fallbackUsers || []

  const cardColumnCount = useGridColumnCount()
  // const skeletonArray = useMemo(() => {
  //   if (cardColumnCount) {
  //     return [...Array(cardColumnCount * 2)].map((_, index) => index)
  //   }
  //   return [0, 1, 2, 3, 4, 5]
  // }, [cardColumnCount])

  // useEffect(() => {
  //   let isCancel = false
  //   const fetchData = async () => {
  //     try {
  //       const featuredUsers = await apolloAPI.fetchFeaturedUsers(14)
  //       if (isCancel) return
  //       setFeaturedCreators(featuredUsers)
  //     } catch (e) {
  //       console.error(e)
  //     }
  //   }
  //   fetchData()
  //   return () => {
  //     isCancel = true
  //   }
  // }, []) // once

  if (!featuredCreators?.length) return null

  return (
    <VStack width="100%" align="initial" spacing={{ base: 12, lg: 24 }} zIndex={1}>
      <VStack align="initial" spacing={4}>
        <ChakraHeadingEmoji
          emoji={HOME_BODY.featuredCreators.emoji}
          text={HOME_BODY.featuredCreators.title}
          textAlign="center"
        />
        {/* <Flex align="center" width="100%" justifyContent={'center'}>
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
        </Flex> */}
        <ChakraDivider />
        <VStack spacing={12} py={4}>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xxl: 4, xxxl: 5, el: 8 }} spacing={8} w="100%">
            {/* {featuredCreators?.length > 0 ?  */}
            {featuredCreators.map((user: User) => (
              <VUserCard
                key={user.userId}
                account={account}
                user={user}
                // onFollow={(user, mode) => onHandleFollow(user, mode)}
              />
            ))}
            {/* : skeletonArray.map((index) => <NFTUserCardSkeleton key={`creator-skeleton-${index}`} />) */}
          </SimpleGrid>
        </VStack>
      </VStack>
    </VStack>
  )
}

export default FeaturedCreators
