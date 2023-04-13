import { Box, BoxProps, Flex, HStack, Text, useColorModeValue, VStack } from '@chakra-ui/react'
import { getNextCollectionName, getNextCollectionURI, getProfileURI, parseUnionId, truncateAddress } from '@nftmall/sdk'
import { ChakraText, CollectionLogo, NextChakraLink, NFTUserCard, theme } from '@nftmall/uikit'
import { ChainIcon } from '@nftmall/uikit'
import { FC, useMemo } from 'react'

import { CollectionItemProps, SearchResultsProps, UserItemProps } from './types'

const SearchItemWrapper: FC<BoxProps> = ({ background, children }) => (
  <Flex
    width="100%"
    align="center"
    padding={2}
    _hover={{
      cursor: 'pointer',
      outline: 'none',
      background: background,
      borderRadius: '4px',
    }}
    _focus={{
      cursor: 'pointer',
      outline: 'none',
      background: background,
      borderRadius: '4px',
    }}
  >
    {children}
  </Flex>
)

const CollectionItem: FC<CollectionItemProps> = ({ collection, onSearchClear, hoverBg }) => {
  const href = getNextCollectionURI(collection)
  const parsed = useMemo(() => (collection ? parseUnionId(collection.id) : undefined), [collection])

  return (
    <NextChakraLink href={href} position="relative" onClick={onSearchClear} width="100%">
      <SearchItemWrapper background={hoverBg}>
        <CollectionLogo collection={collection} width={40} showVerifiedBadge />
        <Box flex={1} marginLeft={2}>
          <HStack alignItems={'center'} spacing={2}>
            <ChakraText fontSize="md" noOfLines={1}>
              {getNextCollectionName(collection)}
            </ChakraText>
            <ChainIcon unionId={collection.id} size={16} />
          </HStack>
          {/* <ChakraText fontSize="md" fontWeight="bold" noOfLines={1}>
            {getNextCollectionName(collection)} <ChainIcon unionId={collection.id} />
          </ChakraText> */}
          {/* <ChakraText fontSize="sm" noOfLines={1} type="secondary">
            By&nbsp;{collection?.owner}
          </ChakraText> */}
          <ChakraText fontSize="sm" noOfLines={1} type="secondary">
            {truncateAddress(parsed.lowercaseAddress)}
          </ChakraText>
        </Box>
      </SearchItemWrapper>
    </NextChakraLink>
  )
}

const UserItem: FC<UserItemProps> = ({ user, onSearchClear, account }) => {
  const href = getProfileURI(user, account)
  return (
    <NextChakraLink href={href} position="relative" onClick={onSearchClear} width="100%">
      <SearchItemWrapper>
        <NFTUserCard user={user} isLinkable={false} account={account} />
        <Box flex={1} marginLeft={2}>
          <ChakraText fontSize="sm" noOfLines={1}>
            {user.name}
          </ChakraText>
          <ChakraText fontSize="sm" noOfLines={1} type="secondary">
            {/* {followings} followers */}
            {user?.username && `@${user?.username}`}
          </ChakraText>
        </Box>
      </SearchItemWrapper>
    </NextChakraLink>
  )
}

// const NFTItem: FC<NFTItemProps> = (props) => {
//   return null
//   const { nft } = props
//   const href = `/nft/${nft.slug || nft.nftId}`
//   let description = ''
//   if (nft.auctions.length > 0) {
//     const auction = nft.auctions[0]
//     if (SaleType.AUCTION_UNLIMITED /*auction.type*/ === SaleType.AUCTION_UNLIMITED) {
//       description = 'Open for bids'
//     } else if (SaleType.AUCTION_TIMED /*auction.type*/ === SaleType.AUCTION_TIMED) {
//       if (auction.status !== AuctionStatus.FAILED) {
//         const price = getBalanceAmount(BigNumber.from(auction.minPrice)).toFixed(2)
//         const currency = '' // getCurrency(auction.currencyId, auction.chainId)
//         description = `from ${price} ${currency}`
//       }
//     }
//   }
//   if (nft.orders.length > 0) {
//     const activeSellOrder = nft.orders.find((order: Order) => order.sellOrder)
//     if (activeSellOrder) {
//       const price = getBalanceAmount(BigNumber.from((activeSellOrder.take as Asset).value))
//       const currency = '' // getCurrency(activeSellOrder.take as Asset, activeSellOrder.chainId)
//       description = `${price.toString()} ${currency}`
//     }
//     const bidders = nft.orders
//       .filter((order: Order) => !order.sellOrder)
//       .sort((a, b) => {
//         const assetA: Asset = JSON.parse(JSON.stringify(a.make))
//         const currencyA = '' // getCurrency(assetA, a.chainId)
//         const currencyAValue = getCurrencyValue(rate, currencyA)
//         const assetB: Asset = JSON.parse(JSON.stringify(b.make))
//         const currencyB = '' // getCurrency(assetB, b.chainId)
//         const currencyBValue = getCurrencyValue(rate, currencyB)

//         if (currencyA === currencyB) {
//           return BigNumber.from(assetB.value).sub(BigNumber.from(assetA.value)).toNumber()
//         } else {
//           const valueAInUSD: BigNumber = BigNumber.from(assetA.value).mul(currencyAValue)
//           const valueBInUSD: BigNumber = BigNumber.from(assetB.value).mul(currencyBValue)
//           return valueBInUSD.sub(valueAInUSD).toNumber()
//         }
//       })
//     if (bidders.length > 0) {
//       const highestBid = bidders[0]
//       const price = getBalanceAmount(BigNumber.from((highestBid.make as Asset).value))
//       const currency = '' // getCurrency(highestBid.make as Asset, highestBid.chainId)
//       description = description.concat(` • Heighest bid ${price.toFixed(2)} ${currency}`)
//     }
//   }
//   return (
//     <NextChakraLink href={href} position="relative" onClick={onSearchClear} width="100%">
//       <SearchItemWrapper>
//         <Box width={8} height={8}>
//           {nft.mimeType.includes('video') ? (
//             <Image src={getCloudinaryUrlByNFTWH(nft, 32).split('.').slice(0, -1).join('.') + '.png'} />
//           ) : (
//             <Image src={getCloudinaryUrlByNFTWH(nft, 32)} />
//           )}
//         </Box>
//         <Box flex={1} marginLeft={2}>
//           <ChakraText fontSize="sm" noOfLines={1}>
//             {nft.name}
//           </ChakraText>
//           <ChakraText fontSize="sm" noOfLines={1} type="secondary">
//             {description}
//           </ChakraText>
//         </Box>
//       </SearchItemWrapper>
//     </NextChakraLink>
//   )
// }

export const SearchResults: FC<SearchResultsProps> = ({ searchResults, rate, onSearchClear, account, ...rest }) => {
  const { collectionResults, userResults } = searchResults
  const hoverBg = useColorModeValue(theme.colors.light.fourthStroke, theme.colors.dark.fourthStroke)

  return (
    <VStack spacing={10} width="100%" {...rest}>
      <Box width="100%">
        <ChakraText fontSize="sm" fontWeight="bold" type="main" textTransform="uppercase">
          Users
        </ChakraText>
        {userResults?.length > 0 ? (
          <VStack width="100%" marginTop={2} spacing={2}>
            {userResults.map((user) => (
              <UserItem
                user={user}
                key={user.userId}
                account={account}
                onSearchClear={onSearchClear}
                hoverBg={hoverBg}
              />
            ))}
          </VStack>
        ) : (
          <Text color="gray">Not Found</Text>
        )}
      </Box>

      <Box width="100%">
        <ChakraText fontSize="sm" fontWeight="bold" type="main" textTransform="uppercase">
          Collections
        </ChakraText>
        {collectionResults?.length > 0 ? (
          <VStack width="100%" marginTop={2} spacing={2}>
            {collectionResults.map((item) => (
              <CollectionItem collection={item} key={item.id} onSearchClear={onSearchClear} hoverBg={hoverBg} />
            ))}
          </VStack>
        ) : (
          <Text color="gray">Not Found</Text>
        )}
      </Box>
    </VStack>
  )
}
