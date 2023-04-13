import { Box, chakra, Flex, Modal, ModalBody, ModalCloseButton, ModalOverlay, VStack } from '@chakra-ui/react'
import { formatCurrencyAmount, getItemName, getTokenBuyLink, tryParseAmount } from '@nftmall/sdk'
import {
  ActionButton,
  BidCheckoutModalProps,
  ChakraErrorText,
  ChakraEthInput,
  ChakraFormLabel,
  ChakraModalContent,
  ChakraText,
  ModalHeading,
  ModalText,
  NextChakraLink,
  theme,
} from '@nftmall/uikit'
import { CurrencyAmount, NATIVE, WNATIVE } from '@sushiswap/core-sdk'
import useOrderService from 'app/hooks/nftmall/useOrderService'
import useSaleService from 'app/hooks/nftmall/useSaleService'
import useCurrencyBalance from 'app/lib/hooks/useCurrencyBalance'
import { useActiveWeb3React } from 'app/services/web3'
import JSBI from 'jsbi'
import { FC, useCallback, useMemo, useState } from 'react'

const BidModal: FC<BidCheckoutModalProps> = ({ item, isOpen, onSuccess, onClose }) => {
  const orderService = useOrderService()
  const { calculateBuyPrices, currenciesForBidding: currencyList } = useSaleService(item)
  const [currency, setCurrency] = useState(currencyList[0])
  const maxQuantity = 1
  const [quantity, setQuantity] = useState(maxQuantity || 1)

  const { chainId, account } = useActiveWeb3React()
  const [inputValue, setInputValue] = useState<number>(0)
  const handlePriceInput = useCallback((value: number | undefined) => setInputValue(value || 0), [])
  const parsedPrice = useMemo(
    () => tryParseAmount(inputValue.toString(), currency) || CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(0)),
    [currency, inputValue]
  )

  const ethBalance = useCurrencyBalance(account, NATIVE[chainId])
  const selectedCurrencyBalance = useCurrencyBalance(account, currency)

  const minBalance = useMemo(() => tryParseAmount('0.01', currency), [currency])

  const isMoreThanMinBalance: boolean = minBalance && !minBalance?.greaterThan(parsedPrice)
  const isEnoughBalance: boolean = selectedCurrencyBalance && !!parsedPrice?.lessThan(selectedCurrencyBalance)
  const isWETHSelected: boolean = currency?.equals(WNATIVE[chainId])
  const isMoreWETHNeeded: boolean = isWETHSelected && !isEnoughBalance
  const balanceSumOfWETHandETH =
    isWETHSelected && selectedCurrencyBalance && ethBalance
      ? selectedCurrencyBalance.wrapped.add(ethBalance.wrapped)
      : null
  const canWrap: boolean =
    isMoreWETHNeeded && parsedPrice && balanceSumOfWETHandETH && parsedPrice.lessThan(balanceSumOfWETHandETH) // weth + eth > input
  const amountToWrap = canWrap ? parsedPrice.wrapped.subtract(selectedCurrencyBalance.wrapped) : null // (input - weth)
  const missingAmountToWrap =
    !amountToWrap && isMoreWETHNeeded && parsedPrice && balanceSumOfWETHandETH
      ? parsedPrice.subtract(balanceSumOfWETHandETH)
      : null // input - (wethBalance + nativeBalance)

  const errorMsg = useMemo(() => {
    if (!isMoreThanMinBalance) {
      return `Enter at least ${minBalance?.toSignificant(10)} ${minBalance?.currency?.symbol}`
    }
    if (isMoreWETHNeeded) {
      if (missingAmountToWrap) {
        return `You need ${missingAmountToWrap.toSignificant(10)} ${currency.symbol} more.`
      }
      return ''
    }
    if (!isEnoughBalance) {
      return `Insufficient balance.`
    }
    return ''
  }, [currency?.symbol, isEnoughBalance, isMoreThanMinBalance, isMoreWETHNeeded, minBalance, missingAmountToWrap])

  const pricingInfo = calculateBuyPrices(parsedPrice, 'BIDDING')

  const handleCurrencySelect = useCallback(
    (value: string) => {
      const cur = currencyList?.find((token) => token.symbol === value)
      if (cur) setCurrency(cur)
    },
    [currencyList]
  )

  const onAction = useCallback(async () => {
    return await orderService.placeBid(item, parsedPrice, quantity)
  }, [item, orderService, parsedPrice, quantity])

  const handleClose = useCallback(() => {
    setInputValue(0)
    // errorMsg(false)
    onClose()
  }, [onClose])

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ChakraModalContent rounded="2xl">
        <ModalBody p={0} zIndex={1}>
          <VStack alignItems="start" spacing={5} width="100%">
            <ModalHeading>Place a bid</ModalHeading>
            <ModalCloseButton />
            <ChakraText type="secondary">
              You are about to place a bid for{' '}
              <chakra.span color={theme.colors.primaryPurple} fontWeight="bold" pr={2}>
                {getItemName(item)}
              </chakra.span>
              {/* by
              <chakra.span color={theme.colors.primaryPurple} fontWeight="bold" px={2}>
                {item.ownerId && shortenAddress(item.ownerId)}
              </chakra.span> */}
            </ChakraText>
            <Box width="100%">
              <ChakraFormLabel color={theme.colors.yellow} fontSize="sm" textTransform="uppercase">
                <span className="emoji" role="img" aria-label="" aria-hidden="false">
                  ⚡
                </span>{' '}
                your bid
              </ChakraFormLabel>
              <ChakraEthInput
                tokenHandler={handleCurrencySelect}
                priceHandler={handlePriceInput}
                isInvalid={!!errorMsg}
                currencyList={currencyList}
                data-cy="input-bid"
              />
              {!!errorMsg && <ChakraErrorText>{errorMsg}</ChakraErrorText>}
            </Box>
            <VStack spacing={2} width="100%">
              <Flex width="100%" justify="space-between">
                <ModalText text="Your bidding balance" hasOpacity />
                {selectedCurrencyBalance && (
                  <ModalText
                    text={`${selectedCurrencyBalance?.toSignificant(10)} ${selectedCurrencyBalance?.currency?.symbol}`}
                  />
                )}
              </Flex>
              {currency?.wrapped?.equals(WNATIVE[currency.chainId]) && (
                <Flex width="100%" justify="space-between">
                  <ModalText text="Your native token balance" hasOpacity />
                  {ethBalance && <ModalText text={`${ethBalance?.toSignificant(10)} ${ethBalance.currency.symbol}`} />}
                </Flex>
              )}
              <Flex width="100%" justify="space-between">
                <ModalText text="Service fee" hasOpacity />
                {pricingInfo?.serviceFeePercent >= 0 && (
                  <ModalText
                    text={
                      pricingInfo.serviceFeePercent === 0
                        ? '0% 🎉'
                        : pricingInfo.serviceFeePercent === 100
                        ? '1%'
                        : '2%'
                    }
                  />
                )}
              </Flex>
              <Flex width="100%" justify="space-between">
                <ModalText text="You will pay" hasOpacity />
                {pricingInfo?.afterFeeAmount && (
                  <ModalText
                    text={`${formatCurrencyAmount(pricingInfo?.afterFeeAmount, 10)} ${
                      pricingInfo.afterFeeAmount?.currency?.symbol
                    }`}
                  />
                )}
              </Flex>
              {currency.isGEM && (
                <Flex width="100%" justify="space-between">
                  <ChakraText fontWeight="bold">
                    You can buy GEM{' '}
                    <NextChakraLink textDecoration="underline" href={getTokenBuyLink(currency)} isExternal>
                      here
                    </NextChakraLink>
                    .
                  </ChakraText>
                </Flex>
              )}
            </VStack>
            <VStack spacing={2} width="100%">
              <ActionButton
                isPrimary
                showError
                showSpinner
                isDisabled={errorMsg ? true : undefined}
                onAction={onAction}
                onSuccess={onSuccess}
              >
                {`I understand, continue >`}
              </ActionButton>
              {!errorMsg && isMoreWETHNeeded && amountToWrap && (
                <ModalText
                  text={
                    amountToWrap.toSignificant(10) +
                    ` ${ethBalance.currency.symbol} will be converted to` +
                    ` ${amountToWrap.toSignificant(10)} ${amountToWrap.currency.symbol}`
                  }
                />
              )}
            </VStack>
          </VStack>
        </ModalBody>
      </ChakraModalContent>
    </Modal>
  )
}

export default BidModal
