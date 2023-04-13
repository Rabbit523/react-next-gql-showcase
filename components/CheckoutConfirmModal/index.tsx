import { Box, chakra, Flex, Modal, ModalBody, ModalOverlay, useColorModeValue, VStack } from '@chakra-ui/react'
import { shortenAddress } from '@nftmall/sdk'
import {
  ChakraExternalLink,
  ChakraFormLabel,
  ChakraModalContent,
  ChakraText,
  CheckoutConfirmModalProps,
  Image,
  PrimaryGradientButton,
  theme,
} from '@nftmall/uikit'
import Confetti from 'react-confetti'

const CheckoutConfirmModal = (props: CheckoutConfirmModalProps): JSX.Element => {
  const { nft, transactionLink, txHash, socialLinks, isOpen, onClose } = props
  const borderColor = useColorModeValue(theme.colors.light.thirdStroke, theme.colors.thirdPurple)

  const textRenderer = (text: string, hasOpacity: boolean, hasFlex: boolean, noOfLines = 0) => (
    <ChakraText
      flex={hasFlex ? 1 : 'initial'}
      width={!hasFlex ? 20 : 'auto'}
      minWidth={20}
      noOfLines={noOfLines}
      type={hasOpacity ? 'secondary' : 'primary'}
    >
      {text}
    </ChakraText>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ChakraModalContent rounded="2xl" position={{ base: 'absolute', md: 'relative' }} top={0}>
        <Box position="absolute">
          <Confetti recycle={false} width={324} height={700} />
        </Box>
        <ModalBody p={0} zIndex={1}>
          <VStack spacing={5}>
            <Box width="100%" position="relative" paddingTop="100%">
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
            </Box>
            <ChakraText type="secondary">
              You successfully purchased{' '}
              <chakra.span color={theme.colors.primaryPurple} fontWeight="bold" pr={2}>
                {nft?.meta?.name}
              </chakra.span>
              by
              <chakra.span color={theme.colors.primaryPurple} fontWeight="bold" px={2}>
                {nft?.ownerId ? shortenAddress(nft?.ownerId) : 'Unknown'}
              </chakra.span>
            </ChakraText>
            <VStack width="100%" spacing={2} p={6} border="1px" borderColor={borderColor} borderRadius="xl">
              <Flex width="100%">
                {textRenderer('Status', true, false)}
                {textRenderer('Transaction hash', true, true, 1)}
              </Flex>
              <Flex width="100%">
                {textRenderer('Success', false, false)}
                <ChakraExternalLink href={transactionLink} width="100%">
                  <ChakraText noOfLines={1} wordBreak="break-all">
                    {txHash}
                  </ChakraText>
                </ChakraExternalLink>
              </Flex>
            </VStack>
            <ChakraFormLabel>Let's show-off a little</ChakraFormLabel>
            <Flex width="100%" justify="space-between">
              {socialLinks?.map((link) => (
                <ChakraExternalLink href={link.href} border={0} key={link.href} className="icon-link">
                  <VStack spacing={2}>
                    <>
                      {link.icon}
                      <ChakraText fontWeight="bold" fontSize="sm">
                        {link.label}
                      </ChakraText>
                    </>
                  </VStack>
                </ChakraExternalLink>
              ))}
            </Flex>
            <PrimaryGradientButton onClick={onClose}>Continue</PrimaryGradientButton>
          </VStack>
        </ModalBody>
      </ChakraModalContent>
    </Modal>
  )
}

export default CheckoutConfirmModal
