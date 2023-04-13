import { chakra, Flex, Modal, ModalBody, ModalCloseButton, ModalOverlay, VStack } from '@chakra-ui/react'
import { getItemName, unionAssetToCurrencyAmount } from '@nftmall/sdk'
import {
  AcceptBidRequestModalProps,
  ActionButton,
  ChakraErrorText,
  ChakraModalContent,
  ChakraText,
  ModalHeading,
  ModalText,
  theme,
} from '@nftmall/uikit'
import useOrderService from 'app/hooks/nftmall/useOrderService'
import useSaleService from 'app/hooks/nftmall/useSaleService'
import { FC, useCallback, useMemo } from 'react'

export const AcceptBidModal: FC<AcceptBidRequestModalProps> = ({ bid, item, isOpen, onClose, onSuccess }) => {
  const orderService = useOrderService()
  const { itemChainId, calculateSellPrices } = useSaleService(item)

  const bidCurrencyAmount = useMemo(
    () => (bid?.make && itemChainId ? unionAssetToCurrencyAmount(bid.make, itemChainId) : undefined),
    [bid?.make, itemChainId]
  ) // need to make something here
  const pricingInfo = useMemo(
    () => (bid && bidCurrencyAmount ? calculateSellPrices(bidCurrencyAmount, 'ACCEPTING_BID') : undefined),
    [bid, bidCurrencyAmount, calculateSellPrices]
  )

  const onAction = useCallback(async () => {
    await orderService.acceptBid(item, bid)
  }, [bid, item, orderService])

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ChakraModalContent rounded="2xl">
        <ModalBody p={0} zIndex={1}>
          <ModalHeading>Accept bid</ModalHeading>
          <VStack spacing={5}>
            <ModalCloseButton />
            {/* <Box width="100%" position="relative" paddingTop="100%">
              {nft?.meta?.animation ? (
                <video
                  id={nft?.tokenId}
                  src={nft?.meta?.animation?.url['ORIGINAL']}
                  loop
                  muted
                  playsInline
                  style={{
                    position: 'absolute',
                    top: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '0.75rem',
                  }}
                  controls
                />
              ) : (
                <Image
                  src={nft?.meta?.image?.url['ORIGINAL']}
                  alt="nft source"
                  objectFit="contain"
                  placeholder="blur"
                  blurDataURL={nft?.meta?.image?.url['ORIGINAL']}
                  layout="fill"
                />
              )}
            </Box> */}

            <ChakraText type="secondary">
              You are about to accept bid for{' '}
              <chakra.span color={theme.colors.primaryPurple} fontWeight="bold" pr={2}>
                {getItemName(item)}
              </chakra.span>
              {/* by
              <chakra.span color={theme.colors.primaryPurple} fontWeight="bold" px={2}>
                {shortenAddress(bid?.maker)}
              </chakra.span> */}
            </ChakraText>
            <VStack spacing={2} width="100%">
              {/* TODO: Incorrect stock count */}
              <Flex width="100%" justify="space-between">
                <ModalText text="Editions in stock" hasOpacity />
                <ModalText text="1 / 1 edition" />
              </Flex>
              <Flex width="100%" justify="space-between">
                <ModalText text="Price" hasOpacity />
                {pricingInfo?.price && (
                  <ModalText
                    text={`${pricingInfo?.price?.toSignificant(10)} ${pricingInfo?.price?.currency?.symbol}`}
                  />
                )}
              </Flex>
              <Flex width="100%" justify="space-between">
                <ModalText text="Service fee" hasOpacity />
                {!Number.isNaN(pricingInfo?.serviceFeePercent) && (
                  <ModalText
                    text={
                      pricingInfo?.serviceFeePercent === 0
                        ? '0% 🎉'
                        : pricingInfo?.serviceFeePercent === 100
                        ? '1%'
                        : '2%'
                    }
                  />
                )}
              </Flex>
              <Flex width="100%" justify="space-between">
                <ModalText text="You will get" hasOpacity />
                {pricingInfo?.afterFeeAmount && (
                  <ModalText
                    text={`${pricingInfo.afterFeeAmount?.toSignificant(10)} ${
                      pricingInfo.afterFeeAmount?.currency?.symbol
                    }`}
                  />
                )}
              </Flex>
            </VStack>
            <VStack spacing={2} width="100%">
              {pricingInfo?.error && <ChakraErrorText>{pricingInfo?.error}</ChakraErrorText>}
              <ActionButton
                isPrimary
                showError
                showSpinner
                isDisabled={pricingInfo?.error ? true : undefined}
                onAction={onAction}
                onSuccess={onSuccess}
              >
                Accept bid
              </ActionButton>
            </VStack>
          </VStack>
        </ModalBody>
      </ChakraModalContent>
    </Modal>
  )
}
