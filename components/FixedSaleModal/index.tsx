import { Box, Flex, Modal, ModalBody, ModalCloseButton, ModalOverlay, VStack } from '@chakra-ui/react'
import { getTokenBuyLink, tryParseAmount } from '@nftmall/sdk'
import {
  ActionButton,
  ChakraDefaultNumberInput,
  ChakraErrorText,
  ChakraEthInput,
  ChakraFormLabel,
  ChakraModalContent,
  ChakraText,
  FixedSaleModalProps,
  ModalHeading,
  ModalText,
  NextChakraLink,
} from '@nftmall/uikit'
import { CurrencyAmount } from '@sushiswap/core-sdk'
import useOrderService from 'app/hooks/nftmall/useOrderService'
import useSaleService from 'app/hooks/nftmall/useSaleService'
import JSBI from 'jsbi'
import { FC, useCallback, useMemo, useState } from 'react'

export const FixedSaleModal: FC<FixedSaleModalProps> = ({
  item,
  isOpen,
  showPriceInputOnly = false,
  onSuccess,
  onClose,
}) => {
  const orderService = useOrderService()
  const { myBalance, calculateSellPrices, isERC1155, currenciesForBuySell: currencyList } = useSaleService(item)
  const [currency, setCurrency] = useState(currencyList[0])
  const maxQuantity = myBalance
  const [quantity, setQuantity] = useState(maxQuantity || 1)
  const [inputValue, setInputValue] = useState<number>(0)
  const handlePriceInput = useCallback((value: number | undefined) => setInputValue(value || 0), [])
  const parsedPrice = useMemo(
    () => tryParseAmount(inputValue.toString(), currency) || CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(0)),
    [currency, inputValue]
  )
  const minBalance = useMemo(() => tryParseAmount('0.01', currency), [currency])

  const isMoreThanMinBalance: boolean = minBalance && !minBalance?.greaterThan(parsedPrice)

  const errorMsg = useMemo(() => {
    if (!isMoreThanMinBalance) {
      return `Enter at least ${minBalance?.toSignificant(10)} ${minBalance?.currency?.symbol}`
    }
    if (quantity > maxQuantity) {
      return `Quantity must be between 1 and ${maxQuantity}`
    }
    return ''
  }, [isMoreThanMinBalance, maxQuantity, minBalance, quantity])

  const pricingInfo = calculateSellPrices(parsedPrice, 'LISTING', quantity)

  const handleCurrencySelect = useCallback(
    (value: string) => {
      const cur = currencyList?.find((token) => token.symbol === value)
      if (cur) setCurrency(cur)
    },
    [currencyList, setCurrency]
  )

  const handleClose = useCallback(() => {
    setInputValue(0)
    // errorMsg(false)
    onClose()
  }, [onClose])

  const priceInput = (
    <Box>
      <ChakraEthInput
        currencyList={currencyList}
        tokenHandler={handleCurrencySelect}
        priceHandler={handlePriceInput}
        isInvalid={!!errorMsg}
      />
      {/* {!!errorMsg && <ChakraErrorText>{errorMsg}</ChakraErrorText>} */}
    </Box>
  )

  const onAction = useCallback(async () => {
    return await orderService.createSellOrder(item, parsedPrice, quantity)
  }, [item, orderService, parsedPrice, quantity])

  if (showPriceInputOnly) {
    return priceInput
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="sm">
      <ModalOverlay />
      <ChakraModalContent rounded="2xl">
        <ModalBody p={0} zIndex={1}>
          <ModalCloseButton />
          <VStack align="initial" spacing={8}>
            <ModalHeading>Set price</ModalHeading>
            {/* <ChakraText style={{ lineBreak: 'anywhere' }}>
              Enter new price.
              Enter new price. Your NFT will be pushed on top of marketplace
            </ChakraText> */}
            <VStack align="initial" spacing={3} width="100%">
              <ChakraFormLabel>Price</ChakraFormLabel>
              {priceInput}
              {isERC1155 && (
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
                </Box>
              )}
              <Flex justify="space-between">
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
              <Flex justify="space-between">
                <ChakraText type="secondary">You will receive</ChakraText>
                {pricingInfo?.afterFeeAmount && (
                  <ModalText
                    text={`${pricingInfo.afterFeeAmount?.toSignificant(10)} ${
                      pricingInfo.afterFeeAmount?.currency?.symbol
                    }`}
                  />
                )}
              </Flex>
              {currency.isGEM && (
                <Flex justify="space-between">
                  <ChakraText fontWeight="bold">
                    You can buy GEM{' '}
                    <NextChakraLink textDecoration="underline" href={getTokenBuyLink(currency)} isExternal>
                      here
                    </NextChakraLink>
                    .
                  </ChakraText>
                </Flex>
              )}
              {!!errorMsg && <ChakraErrorText>{errorMsg}</ChakraErrorText>}

              <ActionButton
                isPrimary
                showError
                showSpinner
                isDisabled={errorMsg ? true : undefined}
                onAction={onAction}
                onSuccess={onSuccess}
              >
                Submit
              </ActionButton>
            </VStack>
          </VStack>
        </ModalBody>
      </ChakraModalContent>
    </Modal>
  )
}
