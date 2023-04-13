import { Box, Center, Flex, HStack } from '@chakra-ui/react'
import { getNextCollectionName, getNextCollectionURI, NextCollection } from '@nftmall/sdk'
import { BadgeSVG, ChakraText, CollectionLogo, NextChakraLink } from '@nftmall/uikit'
import { useNextCollection } from 'app/services/our-api/hooks'
import { ChainIcon } from '@nftmall/uikit'
import { FC } from 'react'

interface CollectionLabelProps {
  collectionId: string
  fallbackCollection?: NextCollection
  width?: number
}

const CollectionLabel: FC<CollectionLabelProps> = ({ collectionId, fallbackCollection, width, ...rest }) => {
  const {
    data: collection,
    isLoading: isNextCollectionLoading,
    error,
  } = useNextCollection({
    variables: { collectionId },
    shouldFetch: !!collectionId,
    swrConfig: {
      refreshInterval: 120 * 1000, // once per 2 mins.
      fallbackData: fallbackCollection,
    },
  })

  return (
    <NextChakraLink
      href={getNextCollectionURI(collection)}
      position="relative"
      _hover={{ textDecoration: 'none' }}
      aria-hidden="true"
    >
      <Flex gridColumnGap={4}>
        <Flex position="relative" {...rest}>
          <CollectionLogo collection={collection} width={width ? 40 : undefined} showVerifiedBadge />
        </Flex>

        <Box>
          <HStack alignItems={'center'} spacing={2}>
            <ChakraText fontSize="md" type="main" noOfLines={1}>
              {getNextCollectionName(collection)}
            </ChakraText>
            <ChainIcon unionId={collectionId} size={18} />
          </HStack>
          {/* <ChakraText fontSize="sm" fontWeight="bold" noOfLines={1} wordBreak="break-all">
            {getNextCollectionName(collection)}
          </ChakraText>
          <ChainIcon unionId={collectionId} /> */}
          <ChakraText fontSize="sm" fontWeight="bold" type="secondary">
            Collection
          </ChakraText>
        </Box>
      </Flex>
    </NextChakraLink>
  )
}

export default CollectionLabel
