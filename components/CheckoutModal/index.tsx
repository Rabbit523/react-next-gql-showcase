import {
  Box,
  chakra,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalOverlay,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import {
  getItemName,
  getTokenBuyLink,
  isERC1155Collection,
  parseUnionId,
  tryParseAmount,
  unionAssetToCurrencyAmount,
} from '@nftmall/sdk'
import {
  ActionButton,
  ChakraDefaultNumberInput,
  ChakraErrorText,
  ChakraFormLabel,
  ChakraModalContent,
  ChakraText,
  CheckoutModalProps,
  ModalHeading,
  ModalText,
  NextChakraLink,
  SecondaryGradientButton,
  theme,
} from '@nftmall/uikit'
import useOrderService from 'app/hooks/nftmall/useOrderService'
import useSaleService from 'app/hooks/nftmall/useSaleService'
import useCurrencyBalance from 'app/lib/hooks/useCurrencyBalance'
import { useActiveWeb3React } from 'app/services/web3'
import { FC, useCallback, useMemo, useState } from 'react'

const CheckoutModal: FC<CheckoutModalProps> = ({ item, sellOrder, isOpen, onSuccess, onClose }) => {
  const { account } = useActiveWeb3React()
  const itemChainId = useMemo(() => (item?.id ? parseUnionId(item.id)?.chainId : undefined), [item?.id])
  const maxQuantity = parseInt(sellOrder.makeStock)
  const [quantity, setQuantity] = useState(maxQuantity || 1)
  const totalAskCurrencyAmount =
    sellOrder?.take && itemChainId ? unionAssetToCurrencyAmount(sellOrder.take, itemChainId) : undefined

  const priceEach =
    totalAskCurrencyAmount?.currency && tryParseAmount(sellOrder.makePrice, totalAskCurrencyAmount.currency)

  const { collection, calculateBuyPrices } = useSaleService(item)
  const orderService = useOrderService()

  const myWalletBalance = useCurrencyBalance(account, totalAskCurrencyAmount?.currency)
  const pricingInfo = calculateBuyPrices(priceEach, 'BUYING', quantity)
  const isEnoughBalance: boolean = myWalletBalance && !!pricingInfo.afterFeeAmount?.lessThan(myWalletBalance)

  const borderColor = useColorModeValue(theme.colors.light.thirdStroke, theme.colors.thirdPurple)

  const errorMsg = useMemo(() => {
    if (quantity > maxQuantity) {
      return `Quantity must be between 1 and ${maxQuantity}`
    }
    if (!isEnoughBalance) {
      return `Insufficient balance.`
    }
    return ''
  }, [isEnoughBalance, maxQuantity, quantity])

  // console.warn({ sellOrder, priceEach, pricingInfo })

  const onAction = useCallback(async () => {
    const txReceipt = await orderService.matchOrder(sellOrder, totalAskCurrencyAmount.currency.symbol, quantity)
    console.log({ txReceipt })
    return txReceipt
  }, [orderService, quantity, sellOrder, totalAskCurrencyAmount.currency.symbol])

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ChakraModalContent rounded="2xl">
        <ModalBody p={0} zIndex={1}>
          <VStack align="initial" spacing={5}>
            <ModalHeading>Checkout</ModalHeading>
            <ChakraText type="secondary">
              You are about to purchase{' '}
              <chakra.span color={theme.colors.primaryPurple} fontWeight="bold" pr={2}>
                {getItemName(item)}
              </chakra.span>
              {/* by
              <chakra.span color={theme.colors.primaryPurple} fontWeight="bold" px={2}>
                {item.ownerId && shortenAddress(item.ownerId)}
              </chakra.span> */}
            </ChakraText>
            <Box width="100%">
              <ChakraFormLabel>Price</ChakraFormLabel>
              <InputGroup variant="flushed">
                <Input
                  value={sellOrder ? sellOrder.makePrice : 0}
                  readOnly
                  _focus={{
                    borderColor: borderColor,
                  }}
                  _hover={{
                    borderColor: borderColor,
                  }}
                />
                <InputRightElement>{totalAskCurrencyAmount.currency.symbol}</InputRightElement>
              </InputGroup>
              {isERC1155Collection(collection) && (
                <Box>
                  <ChakraFormLabel>Quantity</ChakraFormLabel>
                  <ChakraDefaultNumberInput
                    keepWithinRange
                    allowMouseWheel
                    defaultValue={maxQuantity}
                    min={1}
                    max={maxQuantity}
                    step={1}
                    // value={quantity}
                    onChange={(q) => {
                      if (parseInt(q) > 0) {
                        setQuantity(parseInt(q))
                      }
                    }}
                  />
                  {/* <ChakraInput
                    type="number"
                    // placeholder="e.g. 10"
                    min={1}
                    max={item.supply}
                    step={1}
                    value={ownership.value}
                    isDisabled
                    // onChange={(e) => {
                    //   if (parseInt(e.target.value) > 0) {
                    //     setSupply(parseInt(e.target.value))
                    //   }
                    // }}
                  /> */}
                  {/* <ChakraText type="secondary">Amount of tokens</ChakraText> */}
                </Box>
              )}
            </Box>
            <VStack spacing={2}>
              <Flex width="100%" justify="space-between">
                <ModalText text="Your balance" hasOpacity />
                {myWalletBalance && (
                  <ModalText text={`${myWalletBalance?.toSignificant(10)} ${myWalletBalance?.currency?.symbol}`} />
                )}
              </Flex>
              <Flex width="100%" justify="space-between">
                <ModalText
                  text={`Service fee (${
                    pricingInfo?.serviceFeePercent >= 0 &&
                    (pricingInfo.serviceFeePercent === 0
                      ? '0% 🎉'
                      : pricingInfo.serviceFeePercent === 100
                      ? '1%'
                      : '2%')
                  })`}
                  hasOpacity
                />
                {pricingInfo?.serviceFeeAmount && (
                  <ModalText
                    text={`${pricingInfo.serviceFeeAmount?.toSignificant(10)} ${
                      pricingInfo.serviceFeeAmount?.currency?.symbol
                    }`}
                  />
                )}
              </Flex>
              <Flex width="100%" justify="space-between">
                <ModalText text={`You will pay`} hasOpacity />
                {pricingInfo?.afterFeeAmount && (
                  <ModalText
                    text={`${pricingInfo.afterFeeAmount?.toSignificant(10)} ${
                      pricingInfo.afterFeeAmount?.currency?.symbol
                    }`}
                  />
                )}
              </Flex>
              {totalAskCurrencyAmount?.currency.isGEM && (
                <Flex justify="space-between">
                  <ChakraText fontWeight="bold">
                    You can buy GEM{' '}
                    <NextChakraLink
                      textDecoration="underline"
                      href={getTokenBuyLink(totalAskCurrencyAmount?.currency)}
                      isExternal
                    >
                      here
                    </NextChakraLink>
                    .
                  </ChakraText>
                </Flex>
              )}
            </VStack>
            <VStack spacing={2}>
              {errorMsg && <ChakraErrorText>{errorMsg}</ChakraErrorText>}
              {/* <PrimaryGradientButton disabled={!!errorMsg} onClick={onHandleContinue}>
                I understand, continue
              </PrimaryGradientButton> */}
              <ActionButton
                isPrimary
                showError
                showSpinner
                isDisabled={errorMsg ? true : undefined}
                onAction={onAction}
                onSuccess={onSuccess}
              >
                I understand, continue
              </ActionButton>
              <SecondaryGradientButton onClick={onClose}>Cancel</SecondaryGradientButton>
            </VStack>
          </VStack>
        </ModalBody>
      </ChakraModalContent>
    </Modal>
  )
}

export default CheckoutModal
