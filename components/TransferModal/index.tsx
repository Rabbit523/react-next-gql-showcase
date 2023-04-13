import { CloseIcon } from '@chakra-ui/icons'
import { Box, chakra, HStack, IconButton, Modal, ModalBody, ModalOverlay, VStack } from '@chakra-ui/react'
import { isAddress, shortenAddress } from '@nftmall/sdk'
import {
  ChakraErrorText,
  ChakraFormLabel,
  ChakraInput,
  ChakraModalContent,
  ChakraText,
  ModalHeading,
  PrimaryGradientButton,
  theme,
  TransferModalProps,
} from '@nftmall/uikit'
import { ChangeEvent, ClipboardEvent, FC, useCallback, useEffect, useState } from 'react'

const TransferModal: FC<TransferModalProps> = ({
  onDismiss = () => null,
  account,
  nftName,
  onHandleResolveDomain,
  onTransfer,
  isOpen,
}) => {
  const [address, setAddress] = useState('')
  const [isError, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout>()

  useEffect(() => {
    if (isError && isLoading) {
      setIsLoading(false)
    }
  }, [isError, isLoading])

  const onHandleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.value !== '' && e.target.value.length > 2) {
        if (typingTimeout) {
          clearTimeout(typingTimeout)
        }
        const timeout = setTimeout(async () => {
          if (e.target.value.includes('.')) {
            // FIXME: https://github.com/NFTmall/NFTmall/issues/1064
            const resolve = await onHandleResolveDomain(e.target.value)
            isAddress(resolve) ? setAddress(resolve) : setError(resolve)
          }
        }, 1500)
        setTypingTimeout(timeout)
      } else {
        setAddress(e.target.value)
      }
      if (e.target.value && isError) {
        setError('')
      }
    },
    [isError, onHandleResolveDomain, typingTimeout]
  )

  const onHandlePaste = useCallback((e: ClipboardEvent<HTMLInputElement>) => {
    setAddress(e.clipboardData.getData('text/plain'))
  }, [])

  const handleClose = useCallback(() => {
    setIsLoading(false)
    setError('')
    setAddress('')
    onDismiss()
  }, [onDismiss])

  const onHandleTransfer = useCallback(() => {
    setIsLoading(true)
    const fromAddress = account.toLowerCase()
    const toAddress = address.toLowerCase()
    // NOTE: receiver's address should be put
    if (toAddress) {
      // NOTE: if valid address, continue. if not, resolve domain
      if (fromAddress === toAddress) {
        setError('Cannot transfer this NFT to yourself.')
      } else if (isAddress(toAddress)) {
        onTransfer(toAddress)
        handleClose()
      } else {
        setError('Invalid address or unstoppable domain')
      }
    } else {
      setError('This field is required.')
    }
  }, [account, address, handleClose, onTransfer])

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
      <ModalOverlay />
      <ChakraModalContent rounded="2xl">
        <ModalBody padding={0} zIndex={1}>
          <HStack width="100%" alignItems="center" justify="space-between" mb={6}>
            <ModalHeading>Transfer NFT</ModalHeading>
            <IconButton variant="text" onClick={handleClose} aria-label="Close the dialog">
              <CloseIcon />
            </IconButton>
          </HStack>
          <VStack spacing={5} width="100%" align="initial">
            <ChakraText type="secondary">
              You are about to transfer your NFT{' '}
              <chakra.span color={theme.colors.primaryPurple} fontWeight="bold">
                {nftName}
              </chakra.span>{' '}
              to another address. This action cannot be undone.
            </ChakraText>
            <Box width="100%">
              <ChakraFormLabel color={theme.colors.yellow} fontSize="sm" textTransform="capitalize">
                <span className="emoji" role="img" aria-label="" aria-hidden="false">
                  ⚡
                </span>{' '}
                receiver's wallet address or unstoppable domain name
              </ChakraFormLabel>
              <ChakraInput isInvalid={!!isError} onChange={onHandleChange} onPaste={(e) => onHandlePaste(e)} />
              {isError && <ChakraErrorText>&#x2613; {isError}</ChakraErrorText>}
            </Box>
            <ChakraText type="secondary">
              <chakra.span color={theme.colors.primaryPurple} fontWeight="bold">
                {nftName}
              </chakra.span>{' '}
              will be transfered to{' '}
              {isAddress(address) ? (
                <chakra.span color={theme.colors.primaryPurple} fontWeight="bold">
                  {address}
                </chakra.span>
              ) : (
                '...'
              )}
            </ChakraText>
            <PrimaryGradientButton onClick={onHandleTransfer} isLoading={isLoading}>
              Transfer
            </PrimaryGradientButton>
          </VStack>
        </ModalBody>
      </ChakraModalContent>
    </Modal>
  )
}

export default TransferModal
