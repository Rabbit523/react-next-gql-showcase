import { Box, Flex, VStack } from '@chakra-ui/react'
import { ChakraErrorText, ChakraText, SecondaryGradientButton, Spinner, SpinnerProps } from '@nftmall/uikit'
import { WalletInfo } from 'app/config/wallets'
import React, { FC } from 'react'

import Option from './Option'

interface PendingView {
  walletInfo: WalletInfo
  error?: boolean
  setPendingError(error: boolean): void
  tryActivation(walletInfo: WalletInfo): Promise<void>
}

const PendingView: FC<PendingView> = ({ walletInfo, error = false, setPendingError, tryActivation }) => {
  return (
    <VStack align="initial" width="100%" spacing={8}>
      <Box>
        {error ? (
          <VStack width="100%" spacing={2}>
            <ChakraErrorText>Error connecting.</ChakraErrorText>
            <SecondaryGradientButton
              aria-label="try-again-btn"
              onClick={() => {
                setPendingError(false)
                tryActivation(walletInfo)
              }}
            >
              Try Again
            </SecondaryGradientButton>
          </VStack>
        ) : (
          <Flex align="center" width="100%">
            <ChakraText type="secondary">Initializing</ChakraText>
            <Box w={8} position="relative">
              <Spinner thickness="2px" size="xs" />
            </Box>
          </Flex>
        )}
      </Box>
      <Option
        walletConfig={walletInfo}
        login={tryActivation}
        header={walletInfo.name}
        subheader={walletInfo.description}
      />
    </VStack>
  )
}

export default PendingView
