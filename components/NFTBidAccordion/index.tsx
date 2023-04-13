import { Box } from '@chakra-ui/react'
import { ChakraAccordionProps, ChakraText, NFTBidAccordionProps, SpinnerProps } from '@nftmall/uikit'
import { useSortedBidsByItem } from 'app/services/union-api/hooks'
import dynamic from 'next/dynamic'
import { FC, memo, useMemo } from 'react'

import BidItem from '../BidItem'

const ChakraAccordion = memo(
  dynamic<ChakraAccordionProps>(() => import('@nftmall/uikit').then((module) => module.ChakraAccordion))
)

const Spinner = memo(dynamic<SpinnerProps>(() => import('@nftmall/uikit').then((module) => module.Spinner)))

export const NFTBidAccordion: FC<NFTBidAccordionProps> = ({
  item,
  saleType,
  bidders,
  activeAuction,
  activeOrder,
  chainId,
  highestBid,
  rate,
  isOwner,
  isBidableAuction,
  account,
  onAccept,
  onCancel,
  handleFollow,
}) => {
  const { data: sortedBids, isLoading } = useSortedBidsByItem({
    variables: {
      itemId: item.id,
    },
    shouldFetch: !!item?.id,
    swrConfig: {
      refreshInterval: 1 * 60 * 1000,
    },
  })
  const accordionContent = useMemo(() => {
    if (isLoading) {
      return (
        <Box height="100px" position="relative">
          <Spinner size="md" thickness="3px" />
        </Box>
      )
    } else if (sortedBids?.length) {
      // const isAuctionEnded = saleType === SaleType.AUCTION_TIMED && !isBidableAuction
      // const saleType = activeOrder ? SaleType.FIXED_PRICE : activeAuction ? saleType : 'NOT_SALE'
      // const balances = getWalletBalance(account?.toLowerCase())
      return sortedBids.map((bid, index) => (
        <BidItem
          item={item}
          bid={bid}
          order={bid}
          rate={rate}
          isHighestBid={index === 0} //{highestBid?.maker === bid.maker && bid.status === OrderStatus.ACTIVE}
          isBorderBottom={index < sortedBids.length}
          saleType={saleType}
          isAuctionEnded={false} // {isAuctionEnded}
          onAccept={onAccept}
          onCancel={onCancel}
          // handleFollow={handleFollow}
          key={bid.id}
        />
      ))
    } else {
      return <ChakraText type="secondary">No bids. Be the first one to place a bid!</ChakraText>
    }
  }, [isLoading, item, onAccept, onCancel, rate, saleType, sortedBids])

  return <ChakraAccordion title="Bids">{accordionContent}</ChakraAccordion>
}

export default NFTBidAccordion
