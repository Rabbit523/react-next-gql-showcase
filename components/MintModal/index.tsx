import { Box, Modal, ModalBody, ModalCloseButton, ModalOverlay, Stack, Text, VStack } from '@chakra-ui/react'
import { ActionButton, ChakraModalContent, ModalHeading } from '@nftmall/uikit'
import { FC, useCallback, useMemo, useState } from 'react'
import Confetti from 'react-confetti'

import { Step } from '../CreateCollectionModal/Step'
import { useStep } from '../CreateCollectionModal/useStep'

const IS_TESTING = false

export interface MintModalProps {
  handleUpload: () => void
  handleConfirmTx: () => void
  isOpen: boolean
  isProcessingIPFS: boolean
  hasIpfsProtocal: boolean
  isAuthorizationLoading: boolean
  isNFTAuhorized: boolean
  isMinting: boolean
  isMinted: boolean
  isOrderLoading: boolean
  isOrdered: boolean
  isUnlockSale: boolean
  isLockSigning: boolean
  isUnlimitedAuction: boolean
  isAuctionSigning: boolean
  isAuctionSigned: boolean
  isTimedAuction: boolean
  price: number
  unlockedContent: string
  viewNFT: () => void
  onCancel: () => void
}

export const MintModal: FC<MintModalProps> = ({
  handleUpload,
  handleConfirmTx,
  isOpen,
  isMinted,
  isTimedAuction,
  isOrdered,
  isUnlimitedAuction,
  isAuctionSigned,
  price,
  onCancel,
  viewNFT,
}): JSX.Element => {
  const [isConfettiCompleted, setIsConfettiCompleted] = useState(false)
  const isConfetti = useMemo(() => {
    if (price && price > 0) {
      if (isTimedAuction || isUnlimitedAuction) {
        return isAuctionSigned ? true : false
      } else {
        return isOrdered ? true : false
      }
    } else {
      return isMinted ? true : false
    }
  }, [isAuctionSigned, isMinted, isOrdered, isTimedAuction, isUnlimitedAuction, price])

  const handleConfetti = useCallback(() => {
    setIsConfettiCompleted(true)
  }, [])

  const closeHandlerWithConfirmation = useCallback(() => {
    if (window.confirm('Do you want to stop minting NFT?')) {
      onCancel()
    }
  }, [onCancel])

  const [currentStep, { goToNextStep, goToPrevStep, canGoToNextStep, canGoToPrevStep, setStep, reset }] = useStep({
    maxStep: 3,
    initialStep: 0,
  })

  const goNext = useCallback(() => {
    if (canGoToNextStep) {
      goToNextStep()
      return
    }
    console.log('Unable to go to next step')
  }, [canGoToNextStep, goToNextStep])

  const steps = [
    {
      title: '1. Upload files',
      description: `Upload to IPFS - decentralized file storage.`,
      child: (
        <ActionButton isPrimary showError showSpinner onAction={handleUpload} onSuccess={goNext}>
          {`Continue >`}
        </ActionButton>
      ),
    },
    {
      title: '2. Mint',
      description: `Confirm a blockchain transaction. This process may take up to 1 minute.`,
      child: (
        <ActionButton isPrimary showError showSpinner onAction={handleConfirmTx} onSuccess={goNext}>
          {`Confirm >`}
        </ActionButton>
      ),
    },
    {
      title: '3. Finish',
      description: '',
      child: (
        <VStack spacing={4}>
          <Text fontSize="lg">{`Congratulations! 🎉 Your NFT has been minted. 🥳`}</Text>
          {/* <PrimaryGradientButton
                onClick={viewNFT}
                disabled={!isConfettiCompleted}
                display={isConfetti ? 'block' : 'none'}
              >
                View NFT
              </PrimaryGradientButton> */}
          <ActionButton isPrimary showSpinner onAction={viewNFT} disabled={!isConfettiCompleted}>
            View NFT!
          </ActionButton>
        </VStack>
      ),
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={closeHandlerWithConfirmation} isCentered size="md">
      <ModalOverlay />
      <ChakraModalContent rounded="2xl" paddingLeft={4}>
        <ModalCloseButton />
        {isConfetti && (
          <Box position="absolute">
            <Confetti
              recycle={false}
              width={324}
              height={price && price > 0 ? 500 : 350}
              onConfettiComplete={handleConfetti}
            />
          </Box>
        )}
        <ModalBody p={0} zIndex={1}>
          <ModalHeading>Follow Steps</ModalHeading>
          <Stack spacing="0" mt={4}>
            {steps.map((step, id) => (
              <Step
                key={id}
                // cursor="pointer"
                onClick={() => IS_TESTING && setStep(id)}
                title={step.title}
                description={step.description}
                isActive={currentStep === id}
                isCompleted={currentStep > id}
                isLastStep={steps.length === id + 1}
                // width="100%"
              >
                {step.child}
              </Step>
            ))}
          </Stack>
        </ModalBody>
      </ChakraModalContent>
    </Modal>
  )
}
