import { Box, Flex, Grid, GridItem, HStack, LinkBox, LinkOverlay, SimpleGrid, Stack, VStack } from '@chakra-ui/react'
import { HOME_BODY, nextApiFetchers, NextCollection, uriToHttps } from '@nftmall/sdk'
import {
  Banner,
  BlogCard,
  ChakraBlog,
  ChakraDivider,
  ChakraExternalLink,
  ChakraGradientText,
  ChakraHeading,
  ChakraHeadingEmoji,
  ChakraLayout,
  ChakraSlider,
  ChakraText,
  CollectionInfoCard,
  FoundationCard,
  HomeGradientEffects,
  PrimaryGradientButton,
  Roadmap,
  SecondaryGradientButton,
  StyledGridEffectBox,
} from '@nftmall/uikit'
import { User } from '@prisma/client'
import FeaturedCreators from 'app/features/home/FeaturedCreators'
import TrendingCollections from 'app/features/home/TrendingCollections'
import useGridColumnCount from 'app/hooks/nftmall/useGridColumnCount'
import { apolloAPI } from 'app/utils/apollo'
import { GetStaticProps } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { FC, Fragment, useMemo } from 'react'

import { defaultHomeBlogs, REVALIDATE_2_MIN, REVALIDATE_3_HOUR, templateBlogs } from '../utils/constants'

interface HomeProps {
  topCollections?: NextCollection[]
  trendingCollections?: NextCollection[]
  featuredUsers?: User[]
}

const Home: FC<HomeProps> = ({ topCollections, trendingCollections, featuredUsers }) => {
  // const [trendingCols, setTrendingCols] = useState<User[]>([])
  const cardColumnCount = useGridColumnCount()
  const router = useRouter()
  // console.error({ topCollections, trendingCollections })

  // const skeletonArray = useMemo(() => {
  //   if (cardColumnCount) {
  //     return [...Array(cardColumnCount * 2)].map((_, index) => index)
  //   }
  //   return [0, 1, 2, 3, 4, 5]
  // }, [cardColumnCount])

  const projects = useMemo(() => {
    return HOME_BODY.upcomingProjects.projects // .filter((sale) => supportedChainIds.includes(sale.chainId))
  }, [])

  // useEffect(() => {
  //   let isCancel = false
  //   const fetchCollections = async () => {
  //     try {
  //       const res: User[] = await apolloAPI.fetchHotCollections()
  //       if (isCancel) return
  //       setTrendingCols(res)
  //     } catch (e) {
  //       console.error(e)
  //     }
  //   }

  //   fetchCollections()
  //   return () => {
  //     isCancel = true
  //   }
  // }, [])
  // const { data: collectionA } = useNextCollection({
  //   variables: { collectionId: 'ETHEREUM:0xb01e8837b11b1df35d40e68e854de8c84442da92' },
  // })
  // const { data: collectionB } = useNextCollection({
  //   variables: { collectionId: 'ETHEREUM:0xfd02ed5e99f0f5b41b732dce67c1f8c98075fdbd' },
  // })
  // const { data: collectionC } = useNextCollection({
  //   variables: { collectionId: 'ETHEREUM:0x2f7f57e2091a98f1c93882e75800b258a6e10e91' },
  // })

  return (
    <Fragment>
      <Banner from="home" />
      <ChakraLayout display="flex" flexDirection="column" mt={{ base: 12, md: 20, lg: 32 }}>
        <VStack align="initial" width="100%" spacing={{ base: 12, lg: 24 }} marginBottom={12} zIndex={1}>
          {/* =========== Top collections sorted by volume */}
          {/* <TopCollections fallbackCollections={topCollections} /> */}
          {/* =========== Launchpad projects */}
          {projects.length > 0 && (
            <VStack align="initial" spacing={4}>
              <HStack
                width="100%"
                mb={4}
                display="flex"
                flexDirection={{ base: 'column', md: 'row' }}
                spacing={0}
                gap={4}
                justifyContent="center"
              >
                <ChakraHeadingEmoji emoji={HOME_BODY.upcomingProjects.emoji} text={HOME_BODY.upcomingProjects.title} />
              </HStack>
              <ChakraDivider />
              {projects.map((project) => (
                <Stack spacing={2} width="100%" direction={{ base: 'column-reverse', md: 'row' }} key={project.address}>
                  <CollectionInfoCard flex={1} collection={project} handleReport={() => null} isProject>
                    {/* <EmailCollector placeholderText="Enter email to join waitlist." /> */}
                    <PrimaryGradientButton
                      size="lg"
                      onClick={() => {
                        router.push(`/launchpad/${project.meta.slug}`)
                      }}
                    >
                      {'View Project >'}
                    </PrimaryGradientButton>
                  </CollectionInfoCard>
                  <LinkBox position="relative" flex={2} minHeight={48}>
                    <LinkOverlay href={`/launchpad/${project.meta.slug}`}>
                      <Box
                        backgroundImage={project.meta.cover ? `url(${uriToHttps(project.meta.cover)})` : null}
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
          {/* =========== Featured items */}

          {/* =========== Recently listed items */}
          <TrendingCollections fallbackCollections={trendingCollections} />

          {/* =========== Featured creators */}
          <FeaturedCreators fallbackUsers={featuredUsers} />

          {/* =========== Recently listed items */}
          {/* <RecentlyListedItems /> */}

          {/* =========== Features */}
          <VStack align="initial" spacing={{ base: 8, md: 16 }} width="100%">
            <Flex align="center" width="100%" direction={{ base: 'column', lg: 'row' }} maxWidth="1600px" margin="auto">
              <Box position="relative" width={{ base: '100%', lg: '55%' }} minH={{ base: 80, xl: 96, xxxl: '500px' }}>
                <Image src={HOME_BODY.features.image} alt="banner" layout="fill" sizes="50vw" objectFit={'contain'} />
              </Box>
              <VStack
                align="initial"
                spacing={8}
                width={{ base: '100%', lg: '45%' }}
                pl={{ base: 0, lg: 4 }}
                pt={{ base: 4, lg: 0 }}
              >
                <ChakraGradientText fontSize={{ base: '14px', xxxl: '16px' }} letterSpacing="0.1rem">
                  {HOME_BODY.features.label}
                </ChakraGradientText>
                <ChakraHeading>{HOME_BODY.features.title}</ChakraHeading>
                <ChakraText type="secondary">{HOME_BODY.features.des}</ChakraText>
                <ChakraExternalLink border={0} href={HOME_BODY.features.link.href}>
                  <SecondaryGradientButton size="lg" width="max-content" aria-label="go to community">
                    {HOME_BODY.features.link.name}
                  </SecondaryGradientButton>
                </ChakraExternalLink>
              </VStack>
            </Flex>
            <VStack spacing={{ base: 8, md: 16 }} width="100%">
              <ChakraText maxW="80%" textAlign="center" fontSize="xl">
                {HOME_BODY.features.extra.des}
              </ChakraText>
              <VStack align="initial" spacing={4} position="relative" width="100%">
                <ChakraSlider
                  slidesToShow={cardColumnCount}
                  totalCount={HOME_BODY.features.extra.items[0].length}
                  autoPlay
                  arrows={false}
                  direction="left"
                  pauseOnHover={true}
                  isCollectionCard
                >
                  {HOME_BODY.features.extra.items[0].map((item) => (
                    <FoundationCard {...item} key={item.title} />
                  ))}
                </ChakraSlider>
                <ChakraSlider
                  slidesToShow={cardColumnCount}
                  totalCount={HOME_BODY.features.extra.items[1].length}
                  autoPlay
                  arrows={false}
                  direction="right"
                  pauseOnHover={true}
                  isCollectionCard
                >
                  {HOME_BODY.features.extra.items[1].map((item) => (
                    <FoundationCard {...item} key={item.title} />
                  ))}
                </ChakraSlider>
              </VStack>
            </VStack>
          </VStack>
          {/* =========== V2 is live! */}
          <VStack className="css-hover--effect" spacing={4} width="100%" position="relative" paddingY={24}>
            <StyledGridEffectBox />
            <ChakraHeading>{HOME_BODY.v2Live.title}</ChakraHeading>
            <ChakraText type="secondary" maxW={{ base: '90%', md: '60%' }} textAlign="center">
              {HOME_BODY.v2Live.description}
            </ChakraText>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 8, md: 10 }} paddingY={{ base: 6, md: 8 }}>
              {HOME_BODY.v2Live.links.map((link, idx) => {
                const Btn = idx === 0 || idx === 1 ? PrimaryGradientButton : SecondaryGradientButton
                return (
                  <ChakraExternalLink border={0} href={link.href} key={idx}>
                    <Btn minWidth="250px" px={{ base: 6, xl: 8 }}>
                      Buy GEM on {link.label}
                    </Btn>
                  </ChakraExternalLink>
                )
              })}
            </SimpleGrid>
            {/* <EffectButton href="/create">Mint NFT</EffectButton> */}
          </VStack>
          {/* =========== Documents section */}
          <VStack spacing={4} width="100%">
            <ChakraGradientText fontSize={{ base: '14px', xxxl: '16px' }} letterSpacing="0.1rem">
              {HOME_BODY.readDocsGuys.label}
            </ChakraGradientText>
            <ChakraHeading>{HOME_BODY.readDocsGuys.title}</ChakraHeading>
            <ChakraText type="secondary" maxW="80%" textAlign="center">
              {HOME_BODY.readDocsGuys.des}
            </ChakraText>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={12}>
              {templateBlogs.map((blog) => (
                <ChakraBlog {...blog} key={blog.title} />
              ))}
            </SimpleGrid>
          </VStack>
          {/* =========== Roadmap */}
          <VStack spacing={4} width="100%" position="relative">
            <HomeGradientEffects />
            <ChakraGradientText fontSize={{ base: '14px', xxxl: '16px' }} letterSpacing="0.1rem">
              {HOME_BODY.roadmap.label}
            </ChakraGradientText>
            <ChakraHeading>{HOME_BODY.roadmap.title}</ChakraHeading>
            <ChakraText type="secondary" maxW="80%" textAlign="center">
              {HOME_BODY.roadmap.des}
            </ChakraText>
            <Roadmap data={HOME_BODY.roadmap.data} />
          </VStack>
          {/* =========== Text + image cards */}
          <Flex justify="center" width="100%">
            <Grid
              templateColumns="repeat(6,1fr)"
              templateRows="repeat(1,1fr)"
              gap={{ base: 4, default: 8, xxxl: 12 }}
              zIndex={1}
            >
              {defaultHomeBlogs.map((blog, index) => (
                <GridItem display="grid" colSpan={{ base: 6, md: 2 }} maxW="600px" maxH="fit-content" key={blog.title}>
                  <BlogCard blog={blog} index={index} />
                </GridItem>
              ))}
            </Grid>
          </Flex>
        </VStack>
      </ChakraLayout>
    </Fragment>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  // if (process.env.NODE_ENV !== 'production') {
  try {
    const [topCollections, trendingCollections, featuredUsers] = await Promise.all([
      nextApiFetchers.collection.topCollections({
        count: 12,
        needGoodCollection: true,
        hasMetadata: true,
      }),
      nextApiFetchers.collection.trendingCollections(),
      apolloAPI.fetchFeaturedUsers(6),
    ])
    // console.log({ topCollections, trendingCollections })
    return {
      props: {
        topCollections,
        trendingCollections,
        featuredUsers,
      },
      revalidate: REVALIDATE_3_HOUR,
    }
  } catch (e) {
    console.error('=========Homepage PAGE: getStaticProps: Error', context, e)
  }
  // }
  return {
    props: {
      topCollections: null,
      trendingCollections: null,
      featuredUsers: null,
    },
    revalidate: REVALIDATE_2_MIN, // if something goes wrong revalidate once per 1 min.
  }
}

export default Home
