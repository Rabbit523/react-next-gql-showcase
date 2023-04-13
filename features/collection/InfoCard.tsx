import { Box, BoxProps, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import {
  CLOUDNIARY_THEME_URL,
  CURRENCY_ICON,
  defaultProfileSocialFields,
  getNextCollectionDescription,
  getNextCollectionName,
  hasValues,
  NextCollection,
  parseUnionId,
  truncateAddress,
  uriToSocialLink,
} from '@nftmall/sdk'
import {
  ChainIcon,
  ChakraDivider,
  ChakraExternalLink,
  ChakraGradientText,
  ChakraHeading,
  ChakraSpan,
  ChakraText,
  CollectionCardEffectSVG,
  CollectionLogo,
  CollectionState,
  CopyButton,
  Image,
  MultiPortalButton,
  PencilUploadButton,
  reactIcons,
  SharePortalButton,
  ShowMore,
  theme,
} from '@nftmall/uikit'
import { FC, ReactNode, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'

import UserLabel from './UserLabel'

interface IAvatar extends BoxProps {
  collection: NextCollection
  isProject?: boolean
  isOwner?: boolean
  onUpload?: () => void
}

export function CollectionStatsRender(props: CollectionState) {
  const { label, currency, value } = props
  return (
    <VStack justifyContent="center" spacing={0} key={label}>
      <HStack>
        {currency && (
          <Image
            src={CLOUDNIARY_THEME_URL + CURRENCY_ICON[currency]}
            alt={currency}
            width={16}
            height={16}
            className="border-radius-full"
            priority
          />
        )}
        <Text fontWeight="bold" fontSize={{ base: 'md', xl: 'xl' }} wordBreak="keep-all" as="span" whiteSpace="nowrap">
          {value}
        </Text>
      </HStack>
      <ChakraText
        as="span"
        textAlign="center"
        fontSize={{ base: 'sm', xl: 'md' }}
        type="main"
        textTransform="capitalize"
      >
        {label}
      </ChakraText>
    </VStack>
  )
}

function AvatarRender(props: IAvatar) {
  const { collection, isProject, isOwner, onUpload, ...rest } = props
  const [isHover, setIsHover] = useState(false)

  const content = (
    <Box
      width={20}
      height={20}
      position="relative"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      {...rest}
    >
      <CollectionLogo collection={collection} width={100} showVerifiedBadge badgeSize={8} />
      {isHover && isOwner && (
        <PencilUploadButton
          aria-label="upload avatar"
          position="absolute"
          left="50%"
          top="50%"
          transform="translate(-50%, -50%)"
          width="100%"
          height="100%"
          background={isMobile ? 'rgba(0, 0, 0, 0.5)' : 'transparent'}
          borderRadius="0.375rem"
          _hover={{ background: 'rgba(0, 0, 0, 0.5)' }}
          onClick={onUpload}
        />
      )}
    </Box>
  )
  return content
}

export interface InfoCardProps extends BoxProps {
  collection: NextCollection
  isProject?: boolean
  isOwner?: boolean
  shareLink?: string
  handleEditClick?: () => void
  handleSetRoyalty?: () => void
  handleUpload?: () => void
  handleReport: () => void
  children?: ReactNode
}

const InfoCard: FC<InfoCardProps> = ({
  collection,
  shareLink,
  handleReport,
  handleEditClick,
  handleSetRoyalty,
  handleUpload,
  isProject = false,
  isOwner = false,
  children,
  ...rest
}) => {
  const socialLinks = useMemo(() => {
    if (collection?.meta?.links) {
      return JSON.parse(JSON.stringify(collection?.meta?.links || {}))
    }
    return null
  }, [collection])

  const parsedCollectionId = parseUnionId(collection.id)

  return (
    <Box
      borderRadius="xl"
      background="transparent"
      className="collection-card--noise"
      height="100%"
      padding={{ base: 5, xxxl: 10 }}
      position="relative"
      zIndex={1}
      {...rest}
    >
      <Box position="absolute" top={0} left={0} zIndex={-1} width="100%" height="100%">
        <CollectionCardEffectSVG />
      </Box>
      <Box w={{ base: 6, xxxl: 12 }} h={{ base: 6, xxxl: 12 }} position="absolute" top={2} right={4}>
        <ChainIcon chainId={collection.chainId} />
      </Box>
      <VStack align="inital" spacing={{ base: 5, xxxl: 10 }} width="100%">
        <HStack spacing={3} width="100%" alignItems="end" justifyContent="space-between">
          <AvatarRender collection={collection} isOwner={isOwner} onUpload={handleUpload} />
          <HStack spacing={3} width="fit-content">
            <SharePortalButton href={shareLink} size="md" />
            {/* <CardSelectButton onClick={handleEditClick} borderRadius="full" width="max-content" minWidth={24}>
                  Edit
                </CardSelectButton> */}
            <MultiPortalButton handleReport={handleReport} handleRoyalty={handleSetRoyalty} hasRoyalty={false} />
          </HStack>
        </HStack>
        <VStack width="100%" zIndex={1} spacing={4}>
          <VStack align="initial" spacing={1} width="100%">
            <ChakraHeading fontSize={{ base: 'xl', md: '2xl', xxxl: '3xl' }}>
              {getNextCollectionName(collection)}
            </ChakraHeading>
            {collection?.meta?.slug && (
              <ChakraGradientText fontSize={{ base: 'lg', xxxl: 'xl' }}>@{collection?.meta?.slug}</ChakraGradientText>
            )}
          </VStack>
          <VStack width="100%" spacing={{ base: 4, xxxl: 6 }}>
            <ShowMore>
              <ChakraText fontSize="sm">{getNextCollectionDescription(collection)}</ChakraText>
            </ShowMore>

            {socialLinks && hasValues(socialLinks) && (
              <HStack w="100%" alignItems="initial" spacing={{ base: 2, xxxl: 5 }}>
                {defaultProfileSocialFields.map(
                  ({ type: key }, index) =>
                    socialLinks[key] && (
                      <ChakraExternalLink
                        key={key}
                        border={0}
                        href={uriToSocialLink(socialLinks[key], key)}
                        fontSize="lg"
                      >
                        <Flex
                          justifyContent="center"
                          alignItems="center"
                          minWidth={5}
                          minHeight={5}
                          color={theme.colors.primaryPurple}
                        >
                          {reactIcons[key as keyof typeof reactIcons]}
                        </Flex>
                      </ChakraExternalLink>
                    )
                )}
              </HStack>
            )}
          </VStack>

          <VStack w="100%" alignItems="start" spacing={2}>
            {/* <ChakraDivider borderColor={theme.colors.dark.primaryStroke} my={{ base: 6, xxxl: 8 }} /> */}
            {collection.owner && (
              <HStack>
                <ChakraSpan type="main" whiteSpace="nowrap" fontSize={{ base: 'sm', lg: 'md' }}>
                  Created by
                </ChakraSpan>
                <UserLabel userId={collection.owner} />
              </HStack>
            )}
            <HStack>
              <ChakraSpan type="main" whiteSpace="nowrap" fontSize={{ base: 'sm', lg: 'md' }}>
                Address
              </ChakraSpan>
              <CopyButton
                toCopy={parsedCollectionId.address}
                toDisplay={truncateAddress(parsedCollectionId.lowercaseAddress)}
                variant="ghost"
              ></CopyButton>
            </HStack>
          </VStack>
          <ChakraDivider borderColor={theme.colors.dark.primaryStroke} my={{ base: 6, xxxl: 8 }} />

          {children}
        </VStack>
      </VStack>
    </Box>
  )
}

export default InfoCard
