import {
  chakra,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalOverlay,
  SimpleGrid,
  VStack,
} from '@chakra-ui/react'
import { CLOUDNIARY_THEME_URL, delay, NETWORK_ICON, NETWORK_LABEL, SUPPORTED_NETWORKS } from '@nftmall/sdk'
import {
  ChakraErrorText,
  ChakraModalContent,
  ChakraText,
  Image,
  ModalHeading,
  NetworkModalProps,
  TertiaryButton,
  theme,
} from '@nftmall/uikit'
import { ChainId } from '@sushiswap/core-sdk'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'
import { useActiveWeb3React } from 'app/services/web3'
import { supportedChainIds } from 'app/utils/constants'
import { FC, useCallback, useState } from 'react'
import { FiChevronRight } from 'react-icons/fi'

const NetworkModal: FC<NetworkModalProps> = ({ supposedChainId, isNFTRequest, isOpen, onClose }) => {
  const { connector, chainId, library, account } = useActiveWeb3React()

  const [error, setError] = useState<Error>(undefined)
  const [desiredChainId, setDesiredChainId] = useState<number>(-1) // useState<number>(isNetwork ? 1 : -1)

  const handleNetworkChange = useCallback(
    async (selectedChainId: number) => {
      // if we're already connected to the desired chain, return
      if (selectedChainId === chainId) {
        setError(undefined)
        onClose()
        return
      }

      console.error(selectedChainId)

      // if they want to connect to the default chain and we're already connected, return
      if (selectedChainId === -1 && chainId !== undefined) {
        setError(undefined)
        onClose()
        return
      }
      setDesiredChainId(selectedChainId)
      try {
        if (connector instanceof WalletConnect || connector instanceof Network) {
          await connector.activate(selectedChainId === -1 ? undefined : selectedChainId)
        } else if (connector instanceof MetaMask || connector instanceof CoinbaseWallet) {
          await connector.activate(selectedChainId === -1 ? undefined : SUPPORTED_NETWORKS[selectedChainId]) // getAddChainParameters(selectedChainId)
        }
        setError(undefined)
        // give a bit of delay and close modal after successful connect
        delay(1_000)
        onClose()
      } catch (e) {
        console.error('Error while switching network. ', e)
        setError(e)
      }
      setDesiredChainId(-1)
    },
    [chainId, connector, onClose]
  )

  // const handleNetworkChange = useCallback(
  //   async (key) => {
  //     console.log('starting to switch to ', key)
  //     try {
  //       await switchToNetwork({ library, chainId: key })
  //       await delay(1500)
  //       onClose() // after connecting wallet, close
  //     } catch (e) {
  //       console.warn('failed to switch: ', e)
  //     }
  //   },
  //   [library, onClose, chainId, account]
  // )

  // const handleNetworkChange = useCallback(
  //   async (key) => {
  //     console.debug(`Switching to chain ${key}`, SUPPORTED_NETWORKS[key], library)
  //     // toggleNetworkModal()
  //     const params = SUPPORTED_NETWORKS[key]
  //     try {
  //       await library.send('wallet_switchEthereumChain', [{ chainId: `0x${key.toString(16)}` }, account])
  //       // gtag('event', 'Switch', {
  //       //   event_category: 'Chain',
  //       //   event_label: params.chainName,
  //       // })
  //     } catch (switchError) {
  //       console.debug({ switchError })
  //       // This error code indicates that the chain has not been added to MetaMask.
  //       // @ts-ignore TYPE NEEDS FIXING
  //       if (switchError.code === 4902) {
  //         try {
  //           await library?.send('wallet_addEthereumChain', [params, account])
  //         } catch (addError) {
  //           // handle "add" error
  //           console.error(`Add chain error ${addError}`)
  //         }
  //       }
  //       console.error(`Switch chain error ${switchError}`)
  //       // handle other "switch" errors
  //     }
  //   },
  //   [account, library]
  // )

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ChakraModalContent rounded="2xl">
        <ModalHeading mb={4}>Select a Network</ModalHeading>
        <ModalCloseButton />
        <ModalBody p={0} zIndex={1}>
          <VStack alignItems="start" spacing={4} width="100%">
            <ChakraText type="secondary">
              You are currently browsing{' '}
              <chakra.span color={theme.colors.primaryPurple} fontWeight="bold" pr={2}>
                NFTmall
              </chakra.span>
              {NETWORK_LABEL[chainId] ? 'on the' : 'on a'}
              <chakra.span
                color={NETWORK_LABEL[chainId] ? theme.colors.yellow : theme.colors.errorText}
                fontWeight="bold"
                px={2}
              >
                {/* wrong */}
                {NETWORK_LABEL[chainId] || 'wrong'}
              </chakra.span>
              network.
              <br />
              Please select a supported network down below.
            </ChakraText>
            {error && (
              <ChakraErrorText>
                {error?.message || 'Error while switching network. Please reload and try again.'}
              </ChakraErrorText>
            )}

            {isNFTRequest && supposedChainId && (
              <ChakraText>
                You need to switch the network to
                <chakra.span color={theme.colors.yellow} fontWeight="bold" px={1}>
                  {NETWORK_LABEL[supposedChainId]}
                </chakra.span>
              </ChakraText>
            )}

            <SimpleGrid width="100%" columns={{ base: 1 }} spacing={4}>
              {supportedChainIds?.map((key: ChainId) => {
                const isDisabled = false // [ChainId.AVALANCHE].includes(key)
                return (
                  <TertiaryButton
                    key={key}
                    size="lg"
                    fontSize="lg"
                    className="btn-outline--gradient"
                    width="100%"
                    disabled={desiredChainId === key}
                    isLoading={desiredChainId === key}
                    isActive={chainId === key}
                    onClick={() => handleNetworkChange(key)}
                  >
                    <HStack justify="initial" align="center" width="100%" spacing={2}>
                      <Image
                        src={CLOUDNIARY_THEME_URL + NETWORK_ICON[key]}
                        alt={`Switch to ${NETWORK_LABEL[key]} Network`}
                        width={24}
                        height={24}
                        className="border-radius-full"
                      />
                      <ChakraText noOfLines={2}>
                        {NETWORK_LABEL[key]} {/* {isDisabled && '(Soon)'} */}
                      </ChakraText>
                      <Icon as={FiChevronRight} color="inverted" boxSize="5" />
                    </HStack>
                  </TertiaryButton>
                )
              })}
            </SimpleGrid>
          </VStack>
        </ModalBody>
      </ChakraModalContent>
    </Modal>
  )
}

export default NetworkModal
