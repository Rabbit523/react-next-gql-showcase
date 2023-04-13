import { CloseIcon } from '@chakra-ui/icons'
import {
  Box,
  chakra,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalOverlay,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { IProject } from '@nftmall/sdk'
import {
  ActionButton,
  ChakraDefaultNumberInput,
  ChakraErrorText,
  ChakraFormLabel,
  ChakraModalContent,
  ChakraText,
  ModalHeading,
  ModalText,
  theme,
} from '@nftmall/uikit'
import { ApprovalState } from 'app/hooks'
import { useLaunchpadService } from 'app/hooks/nftmall/useLaunchpadService'
import useToast from 'app/hooks/nftmall/useToast'
import { useActiveWeb3React } from 'app/services/web3'
import { FC, useCallback, useMemo, useState } from 'react'

export interface MintModalProps {
  project: IProject
  isOpen: boolean
  onSuccess?: (txReceipt: any) => void
  onClose: () => void
}

const MintModal: FC<MintModalProps> = ({ project, isOpen, onSuccess, onClose }) => {
  const { account } = useActiveWeb3React()
  const { toastError } = useToast()
  const itemChainId = project.chainId
  const sale = project.meta
  const maxQuantity = sale.maxMintAmount
  const [quantity, setQuantity] = useState(maxQuantity || 1)

  const { paymentCurrency, payAmount, myWalletBalance, mint, approveState, approveCallback } = useLaunchpadService(
    project,
    quantity
  )

  // const totalAskCurrencyAmount =
  //   sellOrder?.take && itemChainId ? unionAssetToCurrencyAmount(sellOrder.take, itemChainId) : undefined

  // const priceEach =
  //   totalAskCurrencyAmount?.currency && tryParseAmount(sellOrder.makePrice, totalAskCurrencyAmount.currency)

  // const { collection, calculateBuyPrices } = useSaleService(item)
  // const orderService = useOrderService()

  const isEnoughBalance: boolean = myWalletBalance && !!payAmount?.lessThan(myWalletBalance)

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

  const onMintAction = useCallback(async () => {
    const txReceipt = await mint(quantity)
    console.log({ txReceipt })
    onClose()
    return txReceipt
  }, [mint, onClose, quantity])

  const onApproveAction = useCallback(async () => {
    await approveCallback()
  }, [approveCallback])

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ChakraModalContent rounded="2xl">
        <ModalBody p={0} zIndex={1}>
          <HStack width="100%" alignItems="center" justify="space-between" mb={6}>
            <ModalHeading>Checkout</ModalHeading>
            <IconButton variant="text" onClick={onClose} aria-label="Close the dialog">
              <CloseIcon />
            </IconButton>
          </HStack>
          <VStack align="initial" spacing={5}>
            <ChakraText type="secondary">
              You are about to buy{' '}
              <chakra.span color={theme.colors.primaryPurple} fontWeight="bold" pr={2}>
                {project.name}
              </chakra.span>
              {/* by
              <chakra.span color={theme.colors.primaryPurple} fontWeight="bold" px={2}>
                {item.ownerId && shortenAddress(item.ownerId)}
              </chakra.span> */}
            </ChakraText>
            <Box width="100%">
              <ChakraFormLabel>Price per item</ChakraFormLabel>
              <InputGroup variant="flushed">
                <Input
                  value={sale.presalePrice}
                  readOnly
                  _focus={{
                    borderColor: borderColor,
                  }}
                  _hover={{
                    borderColor: borderColor,
                  }}
                />
                <InputRightElement>{sale.currencySymbol}</InputRightElement>
              </InputGroup>
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
            </Box>
            <VStack spacing={2}>
              <Flex width="100%" justify="space-between">
                <ModalText text="Your balance" hasOpacity />
                {myWalletBalance && (
                  <ModalText text={`${myWalletBalance?.toSignificant(10)} ${myWalletBalance?.currency?.symbol}`} />
                )}
              </Flex>
              <Flex width="100%" justify="space-between">
                <ModalText text={`You will pay`} hasOpacity />
                {payAmount && <ModalText text={`${payAmount.toSignificant(10)} ${payAmount?.currency?.symbol}`} />}
              </Flex>
            </VStack>
            <VStack spacing={2}>
              {errorMsg && <ChakraErrorText>{errorMsg}</ChakraErrorText>}
              {approveState !== ApprovalState.APPROVED && (
                <ActionButton
                  isPrimary
                  showError
                  showSpinner
                  isDisabled={errorMsg ? true : undefined}
                  isLoading={approveState === ApprovalState.PENDING ? true : undefined}
                  onAction={onApproveAction}
                >
                  {approveState === ApprovalState.PENDING ? 'Approving' : `Approve spending ${paymentCurrency.symbol}`}
                </ActionButton>
              )}

              <ActionButton
                isPrimary={approveState === ApprovalState.APPROVED ? true : false}
                showError
                showSpinner
                isDisabled={errorMsg || approveState !== ApprovalState.APPROVED ? true : undefined}
                onAction={onMintAction}
                onSuccess={onSuccess}
              >
                {`Buy >`}
              </ActionButton>
              {/* <SecondaryGradientButton onClick={onClose}>Cancel</SecondaryGradientButton> */}
            </VStack>
          </VStack>
        </ModalBody>
      </ChakraModalContent>
    </Modal>
  )
}

export default MintModal
