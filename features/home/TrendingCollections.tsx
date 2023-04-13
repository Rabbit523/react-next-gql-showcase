import { HStack, VStack } from '@chakra-ui/react'
import { HOME_BODY, NextCollection } from '@nftmall/sdk'
import { ChakraDivider, ChakraHeadingEmoji, ChakraSlider, CollectionCard } from '@nftmall/uikit'
import { FC } from 'react'

interface TrendingCollectionsProps {
  fallbackCollections: NextCollection[]
}

const TrendingCollections: FC<TrendingCollectionsProps> = ({ fallbackCollections }) => {
  const collections = fallbackCollections

  if (!collections?.length) {
    return null
  }

  const cols = collections?.map((col) => <CollectionCard key={col.id} collection={col} />)

  return (
    <VStack align="initial" spacing={4} mt={{ base: 1, md: 10, lg: 16 }}>
      <HStack
        width="100%"
        display="flex"
        flexDirection={{ base: 'column', md: 'row' }}
        spacing={0}
        gap={4}
        justifyContent="center"
      >
        <ChakraHeadingEmoji
          emoji={HOME_BODY.trendingCollections.emoji}
          text={HOME_BODY.trendingCollections.title}
          zIndex={1}
        />
      </HStack>
      <ChakraDivider />

      <ChakraSlider totalCount={collections.length} slidesToShow={1} isCollectionCard>
        {cols}
      </ChakraSlider>
    </VStack>
  )
}

export default TrendingCollections
