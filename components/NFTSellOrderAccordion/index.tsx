import { Box } from '@chakra-ui/react'
import { SaleType } from '@nftmall/sdk'
import { ChakraAccordionProps, ChakraText, SpinnerProps } from '@nftmall/uikit'
import { Currency } from '@prisma/client'
import { Item } from '@rarible/api-client'
import { useSortedSellOrdersByItem } from 'app/services/union-api/hooks'
import dynamic from 'next/dynamic'
import { FC, memo, useMemo } from 'react'

import SellOrderItem from '../SellOrderItem'

const ChakraAccordion = memo(
  dynamic<ChakraAccordionProps>(() => import('@nftmall/uikit').then((module) => module.ChakraAccordion))
)

const Spinner = memo(dynamic<SpinnerProps>(() => import('@nftmall/uikit').then((module) => module.Spinner)))

export interface NFTSellOrderAccordionProps {
  item: Item
  saleType: SaleType
  rate?: Currency[]
  onAccept?: (bid: any) => void
  onCancel?: (bid: any) => void
}

export const NFTSellOrderAccordion: FC<NFTSellOrderAccordionProps> = ({ item, saleType, rate, onAccept, onCancel }) => {
  const { data: sortedSellOrders, isLoading } = useSortedSellOrdersByItem({
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
    } else if (sortedSellOrders?.length) {
      // const isAuctionEnded = saleType === SaleType.AUCTION_TIMED && !isBidableAuction
      // const saleType = activeOrder ? SaleType.FIXED_PRICE : activeAuction ? saleType : 'NOT_SALE'
      // const balances = getWalletBalance(account?.toLowerCase())
      return sortedSellOrders.map((order, index) => (
        <SellOrderItem
          item={item}
          order={order}
          isHighestBid={index === 0} //{highestBid?.maker === bid.maker && bid.status === OrderStatus.ACTIVE}
          isBorderBottom={index < sortedSellOrders.length}
          saleType={saleType}
          isAuctionEnded={false} // {isAuctionEnded}
          onAccept={onAccept}
          onCancel={onCancel}
          // handleFollow={handleFollow}
          key={order.id}
        />
      ))
    } else {
      return <ChakraText type="secondary">No listings yet.</ChakraText>
    }
  }, [isLoading, item, onAccept, onCancel, saleType, sortedSellOrders])

  return <ChakraAccordion title="Listings">{accordionContent}</ChakraAccordion>
}

export default NFTSellOrderAccordion
