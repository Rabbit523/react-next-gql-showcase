import { Box, Link } from '@chakra-ui/react'
import { ChakraGradientText, NextChakraLink } from '@nftmall/uikit'
import { FC } from 'react'

interface AnnouncementProps {
  text?: string
  link?: string
}

const Announcement: FC<AnnouncementProps> = ({ text, link }) => {
  if (!text) return null
  const textContent = (
    <ChakraGradientText
      bgGradient="linear-gradient(118.38deg, #00B7FF -6.94%, #906DFE 78.4%)"
      fontWeight="semibold"
      fontSize={{ base: 'sm', lg: 'md' }}
    >
      {text}
    </ChakraGradientText>
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

export default Announcement
