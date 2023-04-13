import { Box, BoxProps, ButtonProps, Flex, useColorModeValue } from '@chakra-ui/react'
import { compareAddresses, parseUnionId, SaleType, unionAssetToCurrencyAmount } from '@nftmall/sdk'
import { BidItemProps, ChakraDivider, CoinUSDPrice, NFTUserCard, OrderActionButton, theme } from '@nftmall/uikit'
import useAmIOwner from 'app/hooks/nftmall/useAmIOwner'
import { useActiveWeb3React } from 'app/services/web3'
import { useUserProfile } from 'app/state/profile/hook'
import { formatDistance } from 'date-fns'
import { FC, useMemo } from 'react'

const BidItem: FC<BidItemProps> = ({
  bid,
  item,
  isHighestBid = false,
  isBorderBottom = false,
  // isBidOwner,
  isAuctionEnded,
  rate,
  saleType,
  onAccept,
  onCancel,
  // account,
  currency,
  handleFollow,
}) => {
  const { account } = useActiveWeb3React()
  const { amIOwner: isNFTOwner } = useAmIOwner(item)
  const parsedItemId = useMemo(() => (item?.id ? parseUnionId(item.id) : null), [item?.id])
  const bidderUnionAddress = bid.maker
  // we are not using connected chainid here
  const { address: bidderAddress } = useMemo(() => parseUnionId(bid.maker), [bid.maker])
  const { data: bidderProfile, isLoading: isLoadingBidderProfile } = useUserProfile({
    variables: { id: bidderAddress },
    shouldFetch: !!bidderAddress,
  })

  const isBidOwner = account && bidderUnionAddress && compareAddresses(bidderAddress, account)
  const isAcceptable = !(saleType === SaleType.AUCTION_TIMED && ((!isHighestBid && isAuctionEnded) || !isAuctionEnded))
  const isAuctionActionBarVisible = !(
    saleType === SaleType.AUCTION_TIMED && (isNFTOwner ? !isHighestBid && isAuctionEnded : isAuctionEnded)
  )
  const highestBidItemBadgeBG = useColorModeValue(theme.colors.light.primaryStroke, theme.colors.dark.primaryStroke)
  const highestBidItemBadgeText = useColorModeValue(theme.colors.light.primaryText, theme.colors.dark.primaryText)
  const currencyBalance = useMemo(
    () => unionAssetToCurrencyAmount(bid?.make, parsedItemId?.chainId),
    [bid?.make, parsedItemId?.chainId]
  ) // getBalanceAmount(BigNumber.from(JSON.parse(JSON.stringify(order.make)).value))
  const priceInUSD = bid.takePriceUsd // BigNumber.from(tokenBalance).mul(currencyValue)
  const formattedBidTime = formatDistance(new Date(bid.createdAt), new Date(), { addSuffix: true }) // formatDateAgo(new Date(bid.createdAt))
  // console.error(bid)

  const NFTActionRenderer = useMemo(
    () => (props: ButtonProps) =>
      isNFTOwner ? (
        <OrderActionButton
          isPrimary
          onClick={() => {
            if (isAcceptable) {
              onAccept(bid)
            } else {
              console.error('Can not accept bid.')
            }
          }}
          isDisabled={!isAcceptable}
          {...props}
          data-cy="won-accept"
        >
          Accept
        </OrderActionButton>
      ) : isBidOwner ? (
        <OrderActionButton isPrimary={false} onClick={() => onCancel(bid)} {...props}>
          Cancel
        </OrderActionButton>
      ) : null,
    [isNFTOwner, isBidOwner, isAcceptable, onAccept, onCancel, bid]
  )

  const USDPriceRenderer = useMemo(
    () => (props: BoxProps) =>
      (
        <CoinUSDPrice
          justifyContent="center"
          marginLeft={2}
          currencyAmount={currencyBalance}
          usdPrice={priceInUSD}
          {...props}
        />
      ),
    [priceInUSD, currencyBalance]
  )

  // console.error({ bidderProfile })

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" paddingY={4}>
        <NFTUserCard
          user={bidderProfile || { address: bidderAddress }}
          account={account}
          handleFollow={handleFollow}
          description={formattedBidTime}
        />
        <Flex flex={1}>
          <Box flex={2}>
            <Flex
              flexDirection={{ base: 'column', lg: 'row' }}
              alignItems={{ base: 'start', lg: 'center' }}
              wordBreak="break-word"
            >
              <USDPriceRenderer display={{ base: 'flex', lg: 'none' }} />
              {/* FIXME: reenable this */}
              {/* {isHighestBid && (
                <Box
                  flex={1}
                  width={{ base: 32, md: 20, xl: 32 }}
                  display={{ base: 'none', lg: 'flex' }}
                  justifyContent="center"
                  alignItems="center"
                  marginLeft={{ base: 0, lg: 1 }}
                  whiteSpace="pre"
                  paddingX={2}
                  paddingY={0.5}
                  backgroundColor={highestBidItemBadgeBG}
                  fontSize="xs"
                  fontWeight="bold"
                  borderRadius="lg"
                  color={highestBidItemBadgeText}
                >
                  {isAuctionEnded ? 'WON BID' : 'HIGHEST BID'}
                </Box>
              )} */}
            </Flex>
          </Box>
          <USDPriceRenderer display={{ base: 'none', lg: 'flex' }} flex={1} />
          {isAuctionActionBarVisible && (
            <Flex alignItems="center" justifyContent="flex-end" flex={1} marginLeft={2}>
              <NFTActionRenderer />
            </Flex>
          )}
        </Flex>
      </Flex>
      {isBorderBottom && <ChakraDivider />}
    </Box>
  )
}

export default BidItem
