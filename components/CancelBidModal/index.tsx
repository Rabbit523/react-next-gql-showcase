import { chakra, Modal, ModalBody, ModalCloseButton, ModalOverlay, VStack } from '@chakra-ui/react'
import { getItemName, unionAssetToCurrencyAmount } from '@nftmall/sdk'
import { ActionButton, CancelBidModalProps, ChakraModalContent, ChakraText, ModalHeading, theme } from '@nftmall/uikit'
import useItemChainId from 'app/hooks/nftmall/useItemChainId'
import useOrderService from 'app/hooks/nftmall/useOrderService'
import { FC, useCallback, useMemo } from 'react'

const CancelBidModal: FC<CancelBidModalProps> = ({ order: bid, item, isOpen, onClose, onSuccess }) => {
  const orderService = useOrderService()
  const itemChainId = useItemChainId(item)
  const makeCurrencyAmount = useMemo(
    () => (bid?.make && itemChainId ? unionAssetToCurrencyAmount(bid.make, itemChainId) : undefined),
    [bid?.make, itemChainId]
  )
  const takeCurrencyAmount = useMemo(
    () => (bid?.take && itemChainId ? unionAssetToCurrencyAmount(bid.take, itemChainId) : undefined),
    [bid?.take, itemChainId]
  )
  const isBid = !takeCurrencyAmount
  // console.log({ makeCurrencyAmount, takeCurrencyAmount, itemChainId })

  const onAction = useCallback(async () => {
    await orderService.cancelBid(item, bid)
  }, [bid, item, orderService])

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ChakraModalContent rounded="2xl">
        <ModalBody p={0} zIndex={1}>
          <VStack align="initial" spacing={5}>
            <ModalHeading>Cancel {isBid ? 'Bid' : 'Listing'}</ModalHeading>
            <ModalCloseButton />
            <ChakraText type="secondary">
              Do you really want to cancel your {isBid ? 'bid' : 'listing'} for{' '}
              <chakra.span color={theme.colors.primaryPurple} fontWeight="bold" pr={2}>
                {getItemName(item)}
              </chakra.span>
              {/* by
              <chakra.span color={theme.colors.primaryPurple} fontWeight="bold" px={2}>
                {item?.ownerId && shortenAddress(item?.ownerId)}
              </chakra.span> */}
              ?
            </ChakraText>
            {makeCurrencyAmount && (
              <ChakraText textAlign="center">
                {makeCurrencyAmount.toSignificant(10)} {makeCurrencyAmount.currency.symbol} for{' '}
                {(isBid ? bid.take.value : bid.makeStock) || '1'} edition
                {/* FIXME: here bid?.makeStock is wrong. */}
              </ChakraText>
            )}
            <VStack width="100%">
              <ActionButton isPrimary showError showSpinner onAction={onAction} onSuccess={onSuccess}>
                Cancel {isBid ? 'Bid' : 'Listing'}
              </ActionButton>
            </VStack>
          </VStack>
        </ModalBody>
      </ChakraModalContent>
    </Modal>
  )
}

export default CancelBidModal
