import {
  Box,
  BoxProps,
  Flex,
  HStack,
  Img,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Stack,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { defaultMetaData, getCloudinaryUrlByUrlWH, LAUNCHPAD_BODY, uriToHttps } from '@nftmall/sdk'
import {
  BannerProps,
  BlogCardProps,
  ChakraHeading,
  ChakraHeadingProps,
  ChakraLayout,
  ChakraText,
  CollectionInfoCardProps,
  theme,
} from '@nftmall/uikit'
import useToast from 'app/hooks/nftmall/useToast'
import { supportedChainIds } from 'app/utils/constants'
import { restAPI } from 'app/utils/rest'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { Fragment, memo, useEffect, useMemo } from 'react'

const Banner = memo(dynamic<BannerProps>(() => import('@nftmall/uikit').then((module) => module.Banner)))
const BlogCard = memo(dynamic<BlogCardProps>(() => import('@nftmall/uikit').then((module) => module.BlogCard)))
const ChakraHeadingEmoji = memo(
  dynamic<ChakraHeadingProps>(() => import('@nftmall/uikit').then((module) => module.ChakraHeadingEmoji))
)
const CollectionInfoCard = memo(
  dynamic<CollectionInfoCardProps>(() => import('@nftmall/uikit').then((module) => module.CollectionInfoCard))
)
const StandardCard = (props: BoxProps) => {
  const { children, ...rest } = props
  const bgColor = useColorModeValue(theme.colors.light.fourthStroke, theme.colors.dark.fourthStroke)
  const borderColor = useColorModeValue(theme.colors.light.thirdStroke, theme.colors.dark.primaryStroke)
  return (
    <LinkBox
      bg={bgColor}
      borderColor={borderColor}
      borderWidth={1}
      padding={{ base: 8, md: 4, xxl: 8 }}
      position="relative"
      rounded={{ sm: 'md' }}
      {...rest}
    >
      {children}
    </LinkBox>
  )
}

function Index() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/')
  }, [])

  const { toastError, toastInfo, toastSuccess } = useToast()

  const projects = useMemo(() => {
    return LAUNCHPAD_BODY[1].sales.filter((sale) => supportedChainIds.includes(sale.chainId))
  }, [])

  const handleSubmit = (email: string) => {
    restAPI
      .subscribe(email)
      .then((res: any) => {
        if (res.message) {
          toastInfo('Info', res.message)
        } else {
          toastSuccess('Thanks for signing up!')
        }
      })
      .catch((e) => {
        console.error(e)
        toastError('An error occurred.', e.message)
      })
  }
  return null

  /*
  return (
    <Fragment>
      <NextSeo {...defaultMetaData} title={`Launchpad | NFTmall`} />
      <Banner from="launchpad" />
      <ChakraLayout display="flex">
        <VStack align="initial" width="100%" spacing={{ base: 12, lg: 24 }} marginY={12} zIndex={1}>
          <VStack align="initial" spacing={8} width="100%">
            <ChakraHeading>{LAUNCHPAD_BODY[0].title}</ChakraHeading>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={{ base: 4, default: 8, xxxl: 12 }}>
              {LAUNCHPAD_BODY[0].steps.map((step) => (
                <StandardCard key={step.title}>
                  <VStack align="initial" width="100%" height="100%" spacing={4}>
                    <Box w={16} h={16} mb={4}>
                      <Img
                        alt={step.title}
                        rounded="lg"
                        objectFit="contain"
                        width="100%"
                        height="100%"
                        src={getCloudinaryUrlByUrlWH(step.src, 64)}
                      />
                    </Box>
                    <ChakraText fontSize="lg" fontWeight="bold">
                      {step.title}
                    </ChakraText>
                    <ChakraText fontSize="sm">{step.description}</ChakraText>
                    <LinkOverlay
                      href={step.link.href}
                      color={theme.colors.primaryPurple}
                      isExternal
                      borderBottom="1px solid"
                      width="max-content"
                    >
                      {step.link.label}
                    </LinkOverlay>
                  </VStack>
                </StandardCard>
              ))}
            </SimpleGrid>
          </VStack>
          {projects.length > 0 && (
            <VStack align="initial" spacing={4}>
              <ChakraHeadingEmoji emoji={LAUNCHPAD_BODY[1].emoji} text={LAUNCHPAD_BODY[1].title} />
              {projects.map((sale) => (
                <Stack
                  spacing={2}
                  width="100%"
                  direction={{ base: 'column-reverse', md: 'row' }}
                  key={sale.collectionId}
                >
                  <CollectionInfoCard flex={1} collection={sale} handleReport={() => null} isProject />
                  <LinkBox position="relative" flex={2} minHeight={48}>
                    <LinkOverlay href={`/launchpad/${sale.slug}`}>
                      <Box
                        backgroundImage={sale.cover ? `url(${uriToHttps(sale.cover)})` : null}
                        backgroundSize="cover"
                        backgroundPosition="center center"
                        borderRadius="lg"
                        position="absolute"
                        width="100%"
                        height="100%"
                      />
                    </LinkOverlay>
                  </LinkBox>
                </Stack>
              ))}
            </VStack>
          )}
          <Flex justify="center" width="100%">
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 8, md: 12 }}>
              {LAUNCHPAD_BODY[2].items.map((item) => (
                <StandardCard padding={8} key={item.title}>
                  <VStack spacing={8} width="100%">
                    <HStack align="center" spacing={8} width="100%">
                      <Box w={14} h={14}>
                        <Img
                          alt={item.title}
                          rounded="lg"
                          objectFit="contain"
                          width="100%"
                          height="100%"
                          src={getCloudinaryUrlByUrlWH(item.src, 56)}
                        />
                      </Box>
                      <ChakraText fontSize="xl" fontWeight="bold">
                        {item.title}
                      </ChakraText>
                    </HStack>
                    <ChakraText>{item.description}</ChakraText>
                  </VStack>
                </StandardCard>
              ))}
            </SimpleGrid>
          </Flex>
          <Flex justify="center" width="100%">
            <SimpleGrid columns={1} spacing={{ base: 8, md: 12 }} width="100%">
              {LAUNCHPAD_BODY[3].items.map((item, index) => (
                <BlogCard blog={item} index={index} handleSubmit={handleSubmit} key={item.title} />
              ))}
            </SimpleGrid>
          </Flex>
        </VStack>
      </ChakraLayout>
    </Fragment>
  )
  */
}

export default memo(Index)
