import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { connectorLocalStorageKey } from '@nftmall/sdk'
import {
  ChakraErrorText,
  ChakraExternalLink,
  ChakraModalContent,
  ChakraText,
  ModalHeading,
  SecondaryGradientButton,
} from '@nftmall/uikit'
import { ChainId } from '@sushiswap/core-sdk'
import { walletLocalStorageKey } from 'app/config/pancake'
import { useActiveWeb3React } from 'app/services/web3'
// import { useActiveWeb3React } from 'app/services/web3'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'

import { SUPPORTED_WALLETS, WalletInfo } from '../../config/wallets'
import usePrevious from '../../hooks/usePrevious'
import { useModalOpen, useNetworkModalToggle, useWalletModalToggle } from '../../state/application/hooks'
import { ApplicationModal } from '../../state/application/reducer'
import Option from './Option'
import PendingView from './PendingView'

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
}

const getPriority = (priority: WalletInfo['priority']) => (typeof priority === 'function' ? priority() : priority)

/**
 * Checks local storage if we have saved the last wallet the user connected with
 * If we find something we put it at the top of the list
 *
 * @returns sorted config
 */
const getPreferredConfig = () => {
  const sortedConfig = Object.values(SUPPORTED_WALLETS).sort(
    (a: WalletInfo, b: WalletInfo) => getPriority(a.priority) - getPriority(b.priority)
  )

  const preferredWalletName = typeof localStorage !== 'undefined' && localStorage?.getItem(walletLocalStorageKey)

  if (!preferredWalletName) {
    return sortedConfig
  }

  const preferredWallet = sortedConfig.find((sortedWalletConfig) => sortedWalletConfig.name === preferredWalletName)

  if (!preferredWallet) {
    return sortedConfig
  }

  return [
    preferredWallet,
    ...sortedConfig.filter((sortedWalletConfig) => sortedWalletConfig.name !== preferredWalletName),
  ]
}

export default function WalletModal() {
  const displayCount = 100
  const [showMore, setShowMore] = useState(false)
  const sortedConfig = useMemo(() => {
    if (typeof window === 'undefined') return []
    return getPreferredConfig()
  }, [])
  // Filter out WalletConnect if user is inside TrustWallet built-in browser
  const walletsToShow =
    typeof window !== 'undefined' && window.ethereum?.isTrust
      ? sortedConfig.filter((wallet) => wallet.name !== 'WalletConnect')
      : sortedConfig
  const displayListConfig = showMore ? walletsToShow : walletsToShow.slice(0, displayCount)

  const { isActive, account, connector, isWrongNetwork, disconnect } = useActiveWeb3React()
  // const { i18n } = useLingui()
  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)
  const [pendingWallet, setPendingWallet] = useState<WalletInfo>()
  const [pendingError, setPendingError] = useState<boolean>()
  const walletModalOpen = useModalOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useWalletModalToggle()
  const toggleNetworkModal = useNetworkModalToggle()
  const previousAccount = usePrevious(account)
  const activePrevious = usePrevious(isActive)
  const connectorPrevious = usePrevious(connector)

  const router = useRouter()
  const queryChainId = Number(router.query.chainId)
  const cookieChainId = ChainId.BTTC // FIXME: Cookies.get('chain-id')
  const defaultChainId = ChainId.BTTC // cookieChainId ? Number(cookieChainId) : 1

  const [error, setError] = useState(undefined)

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) toggleWalletModal()
  }, [account, previousAccount, toggleWalletModal, walletModalOpen])

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false)
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [walletModalOpen])

  useEffect(() => {
    if (
      walletModalOpen &&
      ((isActive && !activePrevious) || (connector && connector !== connectorPrevious && !error))
    ) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [setWalletView, isActive, error, connector, walletModalOpen, activePrevious, connectorPrevious])

  // close wallet modal if Fortmatic modal is active
  // useEffect(() => {
  //   if (connector?.constructor?.name === 'FormaticConnector') {
  //     connector.on(OVERLAY_READY, () => {
  //       toggleWalletModal()
  //     })
  //   }
  // }, [toggleWalletModal, connector])

  const handleBack = useCallback(() => {
    setPendingError(undefined)
    setWalletView(WALLET_VIEWS.ACCOUNT)
  }, [])

  const handleDeactivate = useCallback(() => {
    disconnect()
    setPendingError(undefined)
    setError(undefined)
    setWalletView(WALLET_VIEWS.ACCOUNT)
  }, [disconnect])

  const tryActivation = useCallback(async (walletInfo: WalletInfo) => {
    // handleDeactivate()
    if (!walletInfo || !walletInfo?.connector) {
      setError(new Error('Empty connector! Unable to connect.'))
      return
    }
    const { connector } = walletInfo

    const conn = typeof connector === 'function' ? await connector() : connector

    console.log('Attempting activation of', walletInfo.name)

    // log selected wallet

    gtag('event', 'Change Wallet', {
      event_category: 'Wallet',
      event_label: walletInfo.name,
    })

    setPendingWallet(walletInfo) // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING)

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    // if (conn instanceof WalletConnectConnector && conn.walletConnectProvider?.wc?.uri) {
    //   console.debug('Wallet connector already tried to connect, reset')
    //   conn.walletConnectProvider = undefined
    // }

    try {
      await conn.activate()
      setError(undefined)
      // TODO: Save last used connector id
      if (walletInfo.id) {
        window.localStorage.setItem(connectorLocalStorageKey, walletInfo.id)
      } else {
        console.warn('Connection id not defined!', walletInfo.id)
      }
    } catch (e) {
      setError(e)
    }
  }, [])

  // get wallets user can switch too, depending on device/browser
  // const options = useMemo(() => {
  //   const isMetamask = typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask
  //   return Object.keys(SUPPORTED_WALLETS).map((key) => {
  //     const option = SUPPORTED_WALLETS[key]

  //     // check for mobile options
  //     if (isMobile) {
  //       // disable portis on mobile for now
  //       if (option.name === 'Portis') {
  //         return null
  //       }

  //       if (option.mobile) {
  //         // NOTE: if following if is used, sometimes no wallet options appear on mobile which is very frustrating
  //         // if (typeof window !== 'undefined' && !window.web3 && !window.ethereum && option.mobile) {
  //         // No injected web3 provider.
  //         return (
  //           <Option
  //             onClick={() => !option.href && tryActivation(option.connector, key)}
  //             id={`connect-${key}`}
  //             key={key}
  //             active={option.connector && option.connector === connector}
  //             link={option.href}
  //             header={option.name}
  //             subheader={null}
  //             // icon={'https://app.sushi.com' + '/images/wallets/' + option.iconName}
  //             icon={option.iconName}
  //           />
  //         )
  //         // }
  //       }
  //       return null
  //     }
  //     // Below are for desktop wallets V

  //     // overwrite injected when needed
  //     if (option.connector === metaMask) {
  //       // don't show injected if there's no injected provider
  //       if (typeof window !== 'undefined' && !(window.web3 || window.ethereum)) {
  //         if (option.name === 'MetaMask') {
  //           return (
  //             <Option
  //               id={`connect-${key}`}
  //               key={key}
  //               header={'Install Metamask'}
  //               subheader={null}
  //               link={'https://metamask.io/'}
  //               // icon="https://app.sushi.com/images/wallets/metamask.png"
  //               icon={option.iconName}
  //             />
  //           )
  //         } else {
  //           return null // dont want to return install twice
  //         }
  //       }
  //       // don't return metamask if injected provider isn't metamask
  //       else if (option.name === 'MetaMask' && !isMetamask) {
  //         return null
  //       }
  //       // likewise for generic
  //       else if (option.name === 'Injected' && isMetamask) {
  //         return null
  //       }
  //     }

  //     // return rest of options
  //     return (
  //       !isMobile &&
  //       !option.mobileOnly && (
  //         <Option
  //           id={`connect-${key}`}
  //           onClick={() => {
  //             console.log({ option, connector, same: option.connector === connector })
  //             // tryActivation(option.connector, key)
  //             // option.connector === connector
  //             //   ? setWalletView(WALLET_VIEWS.ACCOUNT)
  //             //   : !option.href && tryActivation(option.connector, key)
  //             !option.href && tryActivation(option.connector, key)
  //           }}
  //           key={key}
  //           active={option.connector === connector}
  //           link={option.href}
  //           header={option.name}
  //           subheader={null} // use option.descriptio to bring back multi-line
  //           icon={option.iconName}
  //           // icon={'https://app.sushi.com' + '/images/wallets/' + option.iconName}
  //         />
  //       )
  //     )
  //   })
  // }, [connector, tryActivation])

  return (
    <Modal isOpen={walletModalOpen} onClose={toggleWalletModal} isCentered size="lg">
      <ModalOverlay />
      {error ? (
        <ModalContent rounded="2xl">
          <ModalHeading mb={4}>{isWrongNetwork ? 'Wrong Network' : 'Error connecting'}</ModalHeading>
          <ModalBody padding={0}>
            <VStack spacing={5} width="100%" align="initial">
              <Text>Please disconnect and try again.</Text>
              <ChakraErrorText>
                {isWrongNetwork ? 'Please connect to one of the supported networks.' : ''}
                {error?.message}
              </ChakraErrorText>
              <SecondaryGradientButton onClick={handleDeactivate} aria-label="disconnect wallet">
                Disconnect
              </SecondaryGradientButton>
            </VStack>
          </ModalBody>
        </ModalContent>
      ) : (
        <ChakraModalContent rounded="2xl">
          <ModalHeading mb={4}>Connect a Wallet</ModalHeading>
          <ModalCloseButton aria-label="close wallet modal" />
          <ModalBody padding={0} zIndex={1}>
            <VStack width="100%" spacing={4}>
              {walletView === WALLET_VIEWS.PENDING ? (
                <PendingView
                  walletInfo={pendingWallet}
                  error={pendingError}
                  setPendingError={setPendingError}
                  tryActivation={tryActivation}
                />
              ) : (
                <SimpleGrid width="100%" columns={{ base: 1, md: 2 }} spacing={4}>
                  {/* {options} */}
                  {displayListConfig.map((wallet) => (
                    <Box key={wallet.name}>
                      <Option walletConfig={wallet} login={tryActivation} onDismiss={toggleWalletModal} />
                    </Box>
                  ))}
                </SimpleGrid>
              )}
              {walletView !== WALLET_VIEWS.PENDING && (
                <VStack width="100%" spacing={0}>
                  <ChakraText>New to Web3 Wallets?</ChakraText>
                  <ChakraExternalLink textDecoration={'underline'} href="https://ethereum.org/wallets/">
                    Learn more about wallets
                  </ChakraExternalLink>
                </VStack>
              )}
            </VStack>
          </ModalBody>
        </ChakraModalContent>
      )}
    </Modal>
  )
}
