import { Box, Flex, HStack, useColorMode } from '@chakra-ui/react'
import { CLOUDNIARY_THEME_URL, connectorLocalStorageKey } from '@nftmall/sdk'
import { ChakraText, Image, TertiaryButton } from '@nftmall/uikit'
import { walletLocalStorageKey } from 'app/config/pancake'
import { walletConnectConfig, WalletInfo } from 'app/config/wallets'
import { FC, ReactNode } from 'react'
import { isDesktop } from 'react-device-detect'

interface ConnectOption {
  walletConfig: WalletInfo
  header?: ReactNode
  subheader?: ReactNode | null
  login: (walletInfo: WalletInfo) => Promise<void>
  onDismiss?: () => void
}

const Option: FC<ConnectOption> = ({ walletConfig, login, header, subheader = null, onDismiss }) => {
  const { colorMode } = useColorMode()
  const { name, iconName, id } = walletConfig

  return (
    <TertiaryButton
      aria-label="wallet connect option"
      background="transparent"
      className="btn-outline--gradient"
      width="100%"
      height="auto"
      px={4}
      py={2}
      whiteSpace="normal"
      // isActive={active}
      // onClick={onClick}
      onClick={() => {
        // TW point to WC on desktop
        if (name === 'Trust Wallet' && walletConnectConfig && isDesktop) {
          login(walletConfig)
          localStorage?.setItem(walletLocalStorageKey, walletConnectConfig.name)
          localStorage?.setItem(connectorLocalStorageKey, walletConnectConfig.connectorId)
          // onDismiss()
          return
        }
        if (!window.ethereum && walletConfig.href) {
          window.open(walletConfig.href, '_blank', 'noopener noreferrer')
          // if (id === 'THUNDERCORE') {
          //   if (isAndroid) {
          //     const url = 'intent://instagram.com/#Intent;scheme=https;package=com.instagram.android;end'

          //     window.location.replace(url)
          //   } else if (isIOS) {
          //     try {
          //       window.location.replace('ttwallet://')
          //     } catch (e) {
          //       setTimeout(() => {
          //         window.location.replace('https://apps.apple.com/bg/app/tt-wallet/id1471222243')
          //       }, 10_000)
          //     }
          //   } else {
          //     window.location.replace('https://thundercore.com')
          //   }
          // }
        } else {
          login(walletConfig)
          localStorage?.setItem(walletLocalStorageKey, walletConfig.name)
          localStorage?.setItem(connectorLocalStorageKey, walletConfig.connectorId)
          // onDismiss()
        }
      }}
    >
      <HStack spacing={4} width="100%">
        <Box position="relative">
          <Image
            src={`${CLOUDNIARY_THEME_URL}wallets/${colorMode}/` + iconName}
            alt="wallet icon"
            width={32}
            height={32}
          />
        </Box>
        <Flex direction={subheader ? 'column' : 'row'} textAlign="left">
          <ChakraText>{header || walletConfig.name}</ChakraText>
          {subheader && <ChakraText pt={2}>{subheader || walletConfig.description}</ChakraText>}
        </Flex>
      </HStack>
    </TertiaryButton>
  )
}

export default Option
