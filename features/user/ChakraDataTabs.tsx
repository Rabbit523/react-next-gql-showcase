import { HStack, Tab, TabList, TabPanels, Tabs, useMediaQuery } from '@chakra-ui/react'
import { defaultProfileTabs, defaultSearchTabs } from '@nftmall/sdk'
import { ChakraText, DataTabProps } from '@nftmall/uikit'
import { FC, useMemo } from 'react'

import ItemsCreated from './ItemsCreated'
import ItemsOwned from './ItemsOwned'

export const ChakraDataTabs: FC<DataTabProps> = ({
  targetAccount, // NOT currently connected account.
  canLoadMore,
  collections,
  activeTabIndex,
  data,
  isSearch,
  isInFullWidth,
  tabCounts,
  isLoading,
  loadMore,
  limit,
  onChange,
  onClick,
}) => {
  // const [isLargerThan769] = useMediaQuery(['(min-width: 769px)'])
  // const skeletonArray = useMemo(() => {
  //   return [...Array(limit)].map((_, index) => index)
  // }, [limit])
  // const activeTabIndex = useMemo(
  //   () => (isSearch ? defaultSearchTabs : defaultProfileTabs).findIndex((tab) => tab.key === curTab),
  //   [curTab, isSearch]
  // )
  return (
    <Tabs index={activeTabIndex} onChange={onChange} isLazy>
      <TabList border="none" overflowX="auto" overflowY="hidden" width="100%">
        {(isSearch ? defaultSearchTabs : defaultProfileTabs).map((tab, index) => (
          <Tab
            key={tab.label}
            fontWeight="bold"
            whiteSpace="nowrap"
            _focus={{ outline: 'none' }}
            textTransform={isSearch ? 'uppercase' : 'none'}
          >
            <HStack spacing={4}>
              <ChakraText fontWeight="bold" type={index === activeTabIndex ? 'primary' : 'secondary'}>
                {tab.label}
              </ChakraText>
              {tabCounts && (
                <ChakraText type={index === activeTabIndex ? 'main' : 'primary'}>{tabCounts[tab.countKey]}</ChakraText>
              )}
            </HStack>
          </Tab>
        ))}
      </TabList>

      <TabPanels>
        <ItemsOwned targetAccount={targetAccount} key="tab-owned-items" limit={12} />
        <ItemsCreated targetAccount={targetAccount} key="tab-created-items" limit={12} />
        {/* {data?.map((tab) => (
          <TabPanel key={tab.key} paddingX={0} position="relative">
            {tab.content?.length > 0 && collections && (collections || []).length > 0 && (
              <ChakraInfiniteScroll
                onBottomHit={loadMore}
                isLoading={isLoading}
                hasMoreData={canLoadMore}
                loadOnMount={false}
              >
                <VStack spacing={8}>
                  <ChakraGrid isOptimized={isSearch ? isInFullWidth : isLargerThan769}>
                    {tab.content.map((item: any, index: number) =>
                      tab.cardType === 'NFT' ? null : tab.cardType === 'PROFILE' ? ( // /> //   data-cy={index === 0 ? 'first-nft-card' : undefined} //   handleFollow={(user, mode) => handleFollow(user, mode)} //   handleLike={(likes, nft, mode) => handleLike(likes, nft, mode)} //   rate={rate} //   nft={item.__typename === 'nft' || isSearch ? (item as NFT) : (item as { nft: NFT }).nft} //   collection={getMatchCollection(collections, item as NFT)} //   cardSize={cardSize} //   account={account} //   } //     item.__typename === 'nft' || isSearch ? (item as NFT).slug : (item as { nft: NFT }).nft.slug //   key={ // <NFTActionCard
                        <VUserCard
                          key={(item as { user: User }).user.userId}
                          account={account}
                          user={(item as { user: User }).user}
                          onFollow={(user, mode) => handleFollow(user, mode)}
                        />
                      ) : tab.cardType === 'USER' ? (
                        <VUserCard
                          key={(item as User).userId}
                          account={account}
                          user={item as User}
                          onFollow={(user, mode) => handleFollow(user, mode)}
                        />
                      ) : (
                        <CollectionCard key={(item as User).userId} user={item as User} />
                      )
                    )}
                  </ChakraGrid>
                </VStack>
              </ChakraInfiniteScroll>
            )}
            {isLoading && (
              <VStack spacing={8} py={4}>
                <ChakraGrid isOptimized={isSearch ? isInFullWidth : isLargerThan769}>
                  {skeletonArray.map((index) =>
                    tab.cardType === 'NFT' ? (
                      <NFTActionCardSkeleton key={`nft-skeleton-${index}`} />
                    ) : tab.cardType === 'COLLECTION' ? (
                      <CollectionCardSkeleton key={`collection-skeleton-${index}`} />
                    ) : (
                      <NFTUserCardSkeleton key={`user-skeleton-${index}`} />
                    )
                  )}
                </ChakraGrid>
              </VStack>
            )}
            {!isLoading && tab.content?.length <= 0 && (
              <VStack justify="center" minH={80} my={3} spacing={4}>
                <ChakraHeading>No items found</ChakraHeading>
                <ChakraText>Come back soon! Or try to browse something for you on our marketplace</ChakraText>
                <PrimaryGradientButton maxW="fit-content" px={8} onClick={onClick}>
                  Browse marketplace
                </PrimaryGradientButton>
              </VStack>
            )}
          </TabPanel>
        ))} */}
      </TabPanels>
    </Tabs>
  )
}
