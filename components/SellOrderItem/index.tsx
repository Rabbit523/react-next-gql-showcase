import { Box, ButtonProps, Flex, Text, VStack } from '@chakra-ui/react'
import { compareAddresses, parseUnionId, parseUnionOrderId, unionAssetToCurrencyAmount } from '@nftmall/sdk'
import { ChakraDivider, NFTUserCard, OrderActionButton } from '@nftmall/uikit'
import { Item, Order } from '@rarible/api-client'
import { useActiveWeb3React } from 'app/services/web3'
import { useUserProfile } from 'app/state/profile/hook'
import { formatDistance } from 'date-fns'
import { FC, useMemo } from 'react'

export interface SellOrderItemProps {
  order: Order
  item: Item
  // rate?: Rate[]
  isBidOwner?: boolean
  isNFTOwner?: boolean
  isAuctionEnded?: boolean
  isHighestBid?: boolean
  isBorderBottom?: boolean
  saleType?: string
  account?: string
  currency?: string
  // handleFollow?: (user: User, mode: number) => Promise<string>
  onCancel?: (order: Order) => void
  onAccept?: (order: Order) => void
}

const SellOrderItem: FC<SellOrderItemProps> = ({
  order,
  item,
  isHighestBid = false,
  isBorderBottom = false,
  isAuctionEnded,
  saleType,
  onAccept,
  onCancel,
  currency,
}) => {
  const { account } = useActiveWeb3React()
  // const { amIOwner: isNFTOwner } = useAmIOwner(item)
  const sellerUnionAddress = order.maker
  // we are not using connected chainid here
  const { chainId } = parseUnionOrderId(order.id)
  const { address: sellerAddress } = parseUnionId(order.maker)
  const { data: sellerProfile, isLoading: isLoadingsellerProfile } = useUserProfile({
    variables: { id: sellerAddress },
    shouldFetch: !!sellerAddress,
  })

  const isMyListing = account && sellerUnionAddress && compareAddresses(sellerAddress, account)
  const canIBuy = !isMyListing // !(saleType === SaleType.AUCTION_TIMED && ((!isHighestBid && isAuctionEnded) || !isAuctionEnded))
  const currencyBalance = useMemo(() => unionAssetToCurrencyAmount(order?.take, chainId), [chainId, order?.take]) // getBalanceAmount(BigNumber.from(JSON.parse(JSON.stringify(order.make)).value))
  const priceInUSD = order.makePriceUsd // BigNumber.from(tokenBalance).mul(currencyValue)
  const formattedBidTime = formatDistance(new Date(order.createdAt), new Date(), { addSuffix: true }) //  formatDateAgo(new Date(order.createdAt))

  // console.log({ sellerProfile, createdAt: order.createdAt })

  // TODO: make this as a separate compoent and share with BidItem
  const NFTActionRenderer = useMemo(
    () => (props: ButtonProps) =>
      !isMyListing ? (
        <OrderActionButton
          onClick={() => {
            // if (canIBuy) {
            onAccept(order)
            // } else {
            //   console.error('Can not accept bid.')
            // }
          }}
          // isDisabled={!canIBuy}
          {...props}
          data-cy="won-accept"
        >
          Buy
        </OrderActionButton>
      ) : (
        <OrderActionButton onClick={() => onCancel(order)} {...props}>
          Cancel
        </OrderActionButton>
      ),
    [isMyListing, onAccept, onCancel, order]
  )

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" paddingY={4} gap={4}>
        <NFTUserCard
          user={sellerProfile || { address: sellerAddress }}
          account={account}
          description={formattedBidTime}
          width={64}
        />
        <VStack spacing={0}>
          <Text size="md" fontWeight="bold">
            {order.makePrice} {currencyBalance?.currency.symbol}
          </Text>
          <Text fontWeight="bold">X {order.makeStock}</Text>
        </VStack>
        <Flex alignItems="center" justifyContent="flex-end" flex={1} marginLeft={2}>
          <NFTActionRenderer />
        </Flex>
      </Flex>
      {isBorderBottom && <ChakraDivider />}
    </Box>
  )
}

export default SellOrderItem
