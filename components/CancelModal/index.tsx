import { Modal, ModalBody, ModalCloseButton, ModalOverlay, VStack } from '@chakra-ui/react'
import { ActionButton, CancelModalProps, ChakraModalContent, ChakraText, ModalHeading } from '@nftmall/uikit'
import { FC } from 'react'

const CancelModal: FC<CancelModalProps> = ({
  title,
  description,
  hasCancel,
  onClick,
  onDismiss = () => null,
  primaryBtnName,
}) => {
  return (
    <Modal isOpen={true} onClose={onDismiss} isCentered size="md">
      <ModalOverlay />
      <ChakraModalContent rounded="2xl">
        <ModalBody p={0} zIndex={1}>
          <ModalCloseButton />
          <VStack alignItems="initial" spacing={8}>
            <ModalHeading>{title}</ModalHeading>

            {typeof description === 'string' ? <ChakraText type="secondary">{description}</ChakraText> : description}
            <VStack width="100%" spacing={6}>
              <ActionButton isPrimary showError showSpinner onAction={onClick}>
                {primaryBtnName}
              </ActionButton>
              {/* {hasCancel && <SecondaryGradientButton onClick={onDismiss}>Cancel</SecondaryGradientButton>} */}
            </VStack>
          </VStack>
        </ModalBody>
      </ChakraModalContent>
    </Modal>
  )
}
export default CancelModal
