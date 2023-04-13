import { Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { defaultMetaData } from '@nftmall/sdk'
import { BackButton, Banner, ChakraHeading, ChakraLayout, ChakraText, TokenTypeSelectButton } from '@nftmall/uikit'
import { CollectionType } from '@rarible/api-client'
import Minting from 'app/features/create/Minting'
import useToast from 'app/hooks/nftmall/useToast'
import { useActiveWeb3React } from 'app/services/web3'
import { useWalletModalToggle } from 'app/state/application/hooks'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { FC, ReactNode, useCallback, useMemo, useState } from 'react'

interface CreatePageProps {
  children?: ReactNode
}

const CreatePage: FC<CreatePageProps> = () => {
  const router = useRouter()
  const { toastInfo } = useToast()
  const { account, chainId, isWrongNetwork } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const [isStep2, setIsStep2] = useState(false)
  const [collectionType, setCollectionType] = useState<CollectionType.ERC721 | CollectionType.ERC1155>()

  // TODO: may display 'can not mint on this chain' modal

  const collectibleTitle = useMemo(() => {
    return `Create ${collectionType === CollectionType.ERC721 ? 'single' : 'multiple'} collectible`
  }, [collectionType])

  const selectTokenType = useCallback(
    (type: CollectionType.ERC721 | CollectionType.ERC1155) => {
      if (account && chainId) {
        console.log('token selection: ', type)
        setCollectionType(type)
        setIsStep2(true)
      } else {
        toggleWalletModal()
      }
    },
    [account, chainId, toggleWalletModal]
  )

  const handleBackStep = useCallback(() => {
    setIsStep2(false)
  }, [])

  // If user is on wrong network, we must hide minting process
  if (!chainId || !account || isWrongNetwork) {
    return (
      <Flex width="100%" height="360px" justifyContent="center" alignItems={'center'}>
        <Text textAlign="center" fontWeight="bold" fontSize="xl">
          Please connect your wallet and switch to one of supported networks.
        </Text>
      </Flex>
    )
  }

  return (
    <>
      <NextSeo {...defaultMetaData} title={`Create NFT | NFTmall`} />
      <Banner from="mint" />
      <ChakraLayout display="flex" py={10}>
        {isStep2 ? (
          <Minting
            handleBackStep={handleBackStep}
            collectionType={collectionType}
            collectibleTitle={collectibleTitle}
          />
        ) : (
          <VStack maxWidth="1600px" marginX="auto" spacing={4} align="initial" zIndex={1}>
            <BackButton aria-label="go back" onClick={() => router.back()}>
              Go back
            </BackButton>
            <ChakraHeading as="h2">Create collectible</ChakraHeading>
            <ChakraText>
              Choose “Single” if you want your collectible to be one of a kind or “Multiple” if you want to sell one
              collectible multiple times.
            </ChakraText>
            <HStack maxW="800px" spacing={4} zIndex={1}>
              <TokenTypeSelectButton
                aria-label="ERC721"
                data-testid="ERC721"
                onClick={() => selectTokenType(CollectionType.ERC721)}
              >
                <Text as="span" fontSize="xl" fontWeight="bold">
                  Single
                </Text>
                <br />
                <Text as="span" color="gray" fontSize="md">
                  ERC-721
                </Text>
              </TokenTypeSelectButton>
              <TokenTypeSelectButton
                aria-label="ERC1155"
                data-testid="ERC1155"
                onClick={() => {
                  selectTokenType(CollectionType.ERC1155)
                }}
              >
                <Text as="span" fontSize="xl" fontWeight="bold">
                  Multiple
                </Text>
                <br />
                <Text as="span" color="gray" fontSize="md">
                  ERC-1155
                </Text>
              </TokenTypeSelectButton>
            </HStack>
            <ChakraText>
              We do not own your private keys and cannot access your funds without your confirmation.
            </ChakraText>
          </VStack>
        )}
      </ChakraLayout>
    </>
  )
}

export default CreatePage
