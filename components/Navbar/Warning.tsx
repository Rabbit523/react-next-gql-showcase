import { Box, Text } from '@chakra-ui/react'
import { NextChakraLink } from '@nftmall/uikit'
import { FC } from 'react'

interface WarningProps {
  text?: string
  link?: string
}

const Warning: FC<WarningProps> = () => {
  const link = '/account/settings'
  const textContent = (
    <Text fontWeight="semibold" fontSize={{ base: 'sm', lg: 'md' }}>
      To get notified when your NFT is sold, add an email to{' '}
      <Text as="span" textDecoration="underline">
        your profile.
      </Text>
    </Text>
  )
  let linkContent = null
  if (link) {
    linkContent = (
      <NextChakraLink fontSize="md" href={link} isExternal={link?.includes('http') ? true : undefined}>
        {textContent}
      </NextChakraLink>
    )
  } else {
    linkContent = textContent
  }
  return (
    <Box flex={1} display="flex" justifyContent="center" alignItems="center">
      {linkContent}
    </Box>
  )
}

export default Warning
