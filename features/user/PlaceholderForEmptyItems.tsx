import { VStack } from '@chakra-ui/react'
import { ChakraHeading, ChakraText, NextChakraLink, PrimaryGradientButton } from '@nftmall/uikit'
import { FC } from 'react'

const PlaceholderForEmptyItems: FC = () => (
  <VStack justify="center" minH={80} my={3} spacing={4}>
    <ChakraHeading>No items found</ChakraHeading>
    <ChakraText>Come back soon! Or try to browse something for you on our marketplace</ChakraText>
    {/* FIXME: go to different route */}
    <NextChakraLink href="/#recent">
      <PrimaryGradientButton size="lg" width={{ base: '100%', xs: 'max-content' }} aria-label="go to marketplace">
        Browse marketplace
      </PrimaryGradientButton>
    </NextChakraLink>
  </VStack>
)

export default PlaceholderForEmptyItems
