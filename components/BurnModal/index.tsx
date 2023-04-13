import { chakra, Modal, ModalBody, ModalOverlay, VStack } from '@chakra-ui/react'
import { getItemName } from '@nftmall/sdk'
import { ActionButton, BurnModalProps, ChakraModalContent, ChakraText, ModalHeading, theme } from '@nftmall/uikit'
import useNFTService from 'app/hooks/nftmall/useNFTService'
import { FC, useCallback } from 'react'

const BurnModal: FC<BurnModalProps> = ({ item, isOpen, onDismiss = () => null, onSuccess }) => {
  const nftService = useNFTService()
  const nftName = getItemName(item)

  const onAction = useCallback(async () => {
    await nftService.burn(item.id)
  }, [item, nftService])

  return (
    <Modal isOpen={isOpen} onClose={onDismiss} isCentered size="md">
      <ModalOverlay />
      <ChakraModalContent rounded="2xl">
        <ModalBody p={0} zIndex={1}>
          <VStack alignItems="initial" spacing={5}>
            <ModalHeading>Burn NFT</ModalHeading>
            <ChakraText type="secondary">
              Are you sure to burn this NFT{' '}
              <chakra.span color={theme.colors.primaryPurple} fontWeight="bold" pr={2}>
                {nftName}
              </chakra.span>
              ?<br />
              It will be transferred to zero address and delisted from marketplace. This action cannot be undone.
            </ChakraText>
            <VStack width="100%" spacing={6}>
              {/* <PrimaryGradientButton onClick={onClick}>Burn</PrimaryGradientButton>
              <SecondaryGradientButton onClick={onDismiss}>Cancel</SecondaryGradientButton> */}
              <ActionButton isPrimary showError showSpinner onAction={onAction} onSuccess={onSuccess}>
                {`I understand, burn 🔥`}
              </ActionButton>
            </VStack>
          </VStack>
        </ModalBody>
      </ChakraModalContent>
    </Modal>
  )
}

export default BurnModal
