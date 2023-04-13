import {
  Box,
  Container,
  Flex,
  FlexProps,
  HStack,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorModeValue,
  useMediaQuery,
  VStack,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import {
  BIG_ZERO,
  defaultMetaData,
  getCloudinaryUrlByUrlWH,
  IParams,
  IProject,
  LAUNCHPAD_BODY,
  ProjectStatus,
  uriToSocialLink,
  ZERO_ADDRESS,
} from '@nftmall/sdk'
import {
  BlogCard,
  ChakraExternalLink,
  ChakraHeading,
  ChakraLayout,
  ChakraText,
  LoadingModal,
  NextChakraLink,
  PrimaryGradientButton,
  ProjectCard,
  reactIcons,
  SaleCard,
  SecondaryGradientButton,
  theme,
} from '@nftmall/uikit'
import { CHAIN_KEY } from '@sushiswap/core-sdk'
import NetworkModal from 'app/components/NetworkModal'
import MintModal from 'app/features/launchpad/MintModal'
import { useLaunchpadService } from 'app/hooks/nftmall/useLaunchpadService'
import useToast from 'app/hooks/nftmall/useToast'
import { useActiveWeb3React } from 'app/services/web3'
import { useWalletModalToggle } from 'app/state/application/hooks'
import { REVALIDATE_1_DAY, supportedChainIds } from 'app/utils/constants'
import { restAPI } from 'app/utils/rest'
import { GetStaticPaths, GetStaticProps } from 'next'
import Image from 'next/image'
import { NextSeo } from 'next-seo'
import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CountdownTimeDelta } from 'react-countdown'
// import ReactMarkdown from 'react-markdown'

interface LaunchpadProjectProps {
  project: IProject
}
interface TabDetailItem extends FlexProps {
  type?: string
  value?: any
  isLink?: boolean
}

function TabDetailItem(props: TabDetailItem) {
  const { children, type, value, isLink = false, ...rest } = props
  const borderColor = useColorModeValue(theme.colors.light.thirdStroke, theme.colors.dark.secondaryStroke)
  return (
    <Flex
      align="center"
      justify="space-between"
      padding={2}
      borderBottom="1px solid"
      borderColor={borderColor}
      {...rest}
    >
      {children ? (
        children
      ) : (
        <Fragment>
          {type && <ChakraText>{type}</ChakraText>}
          {value &&
            (isLink ? <ChakraExternalLink href={value}>{value}</ChakraExternalLink> : <ChakraText>{value}</ChakraText>)}
        </Fragment>
      )}
    </Flex>
  )
}

function Index(props: LaunchpadProjectProps) {
  const { project } = props
  const { account, chainId } = useActiveWeb3React()
  const borderColor = useColorModeValue(theme.colors.light.thirdStroke, theme.colors.dark.secondaryStroke)
  const bgColor = useColorModeValue(theme.colors.light.cardBg, theme.colors.dark.cardBg)
  const sale = project.meta
  const { getTotalSupply, getOwnedSupply, getTotalRaised, mint } = useLaunchpadService(project)

  const [isLargerThan1280] = useMediaQuery(['(min-width: 1280px)'])
  const [curTab, setCurTab] = useState(0)
  const [saleAmount, setSaleAmount] = useState(sale.maxMintAmount)
  const [status, setStatus] = useState<ProjectStatus>()
  const [isLoading, setIsLoading] = useState(false)
  const [isNetworkModal, setIsNetworkModal] = useState(false)
  const [progressingSupply, setProgressingSupply] = useState(0)
  const [totalRaised, setTotalRaised] = useState<BigNumber>(BIG_ZERO)
  const { toastError, toastInfo, toastSuccess } = useToast()
  const toggleWalletModal = useWalletModalToggle()
  const scrollRef = useRef(null)
  let timer: any

  const [isMintModal, setMintModal] = useState(false)

  const pageMeta = useMemo(() => {
    if (project) {
      let title = defaultMetaData.title
      const description = sale.description
      const viewableNFTURL = getCloudinaryUrlByUrlWH(sale.cover, 1200, 630)
      if (sale.name) {
        title = sale.name.concat(` | NFTmall`)
      }
      const ogSource = {
        images: [
          {
            url: viewableNFTURL.split('.').slice(0, -1).join('.') + '.jpg',
            width: 1200,
            height: 630,
          },
        ],
      }
      return {
        ...defaultMetaData,
        title,
        description,
        openGraph: {
          title,
          description,
          // FIXME: this must be canonical url. i.e url of this nft.
          url: viewableNFTURL,
          ...ogSource,
        },
      }
    }
    return defaultMetaData
  }, [project, sale.cover, sale.description, sale.name])

  const isWhitelisted = useMemo(() => {
    if (!sale?.whitelistRequired) return true
    if (!account) return false
    return !!sale?.whitelist?.includes(account.toLowerCase())
  }, [account, sale.whitelist, sale.whitelistRequired])

  const tabs = [
    {
      label: 'Sale Info',
      content: {
        website: sale.links.website,
        blockchain: CHAIN_KEY[project.chainId].toUpperCase(),
        saleAmount: sale.maxSupply,
        maxPresaleMintAmount: sale.maxPresaleMintAmount,
        maxPresaleNFTsPerUser: sale.maxPresaleNFTsPerUser,
        maxMintAmount: sale.maxMintAmount,
        maxNFTsPerUser: sale.maxNFTsPerUser,
        presalePrice: `${sale.presalePrice} ${sale.currency}`,
        publicSalePrice: `${sale.price} ${sale.currency}`,
        presaleStart: sale.presaleStartTime,
        publicSaleStart: sale.publicSaleStartTime,
        reveal: sale.revealTime,
        saleEnd: sale.endTime,
        social: sale.links,
      },
    },
    // {
    //   label: 'About the project',
    //   content: sale.longDescription,
    // },
  ]

  const onChange = (index: number) => {
    setCurTab(index)
  }

  const handleSaleAmountChange = (_, valueAsNumber: number) => {
    setSaleAmount(valueAsNumber)
  }

  const executeScroll = () => scrollRef.current.scrollIntoView({ behavior: 'smooth' })

  const startFetchingStatus = useCallback(() => {
    if (project) {
      if (timer) clearInterval(timer)
      const refresh = async function () {
        const progressingSupply = await getTotalSupply()
        setProgressingSupply(progressingSupply)
        const raisedBalance = await getTotalRaised()
        setTotalRaised(raisedBalance)
        if (progressingSupply === sale.maxSupply) {
          setStatus(ProjectStatus.ENDED)
        }
      }
      // debugger
      timer = setInterval(refresh, 10 * 1000)
    }
  }, [project])

  const initiateStats = useCallback(async () => {
    const progressingSupply = await getTotalSupply()
    setProgressingSupply(progressingSupply)
    const raisedBalance = await getTotalRaised()
    setTotalRaised(raisedBalance)
  }, [getTotalRaised, getTotalSupply])

  useEffect(() => {
    let isCancel = false
    if (project && !isCancel) {
      const currentTime = new Date().getTime()
      const presaleStartTime = new Date(sale.presaleStartTime).getTime()
      const publicSaleStartTime = new Date(sale.publicSaleStartTime).getTime()
      const endTime = new Date(sale.endTime).getTime()
      const status =
        currentTime > endTime
          ? ProjectStatus.ENDED
          : currentTime > publicSaleStartTime
          ? ProjectStatus.PUBLICSALE_STARTED
          : currentTime > presaleStartTime
          ? ProjectStatus.PRESALE_STARTED
          : ProjectStatus.NOT_STARTED
      setStatus(status)
      initiateStats()
    }
    return () => {
      clearInterval(timer)
      isCancel = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project])

  useEffect(() => {
    if (status === ProjectStatus.PRESALE_STARTED || status === ProjectStatus.PUBLICSALE_STARTED) {
      setSaleAmount(status === ProjectStatus.PRESALE_STARTED ? sale.maxPresaleMintAmount : sale.maxMintAmount)
      startFetchingStatus()
    } else if (status === ProjectStatus.ENDED) {
      clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const chainValidate = useCallback(() => {
    if (chainId !== project.chainId) {
      setIsNetworkModal(true)
      return false
    } else {
      return true
    }
  }, [chainId, project.chainId])

  const handleBuy = useCallback(async () => {
    if (!account) {
      toggleWalletModal()
    } else if (chainValidate()) {
      setMintModal(true)
      // if ((status === ProjectStatus.PRESALE_STARTED && isWhitelisted) || status === ProjectStatus.PUBLICSALE_STARTED) {
      //   // const ownedSupply = await getOwnedSupply(account.toLowerCase())
      //   // const maxNFTsPerUser =
      //   //   status === ProjectStatus.PRESALE_STARTED ? sale.maxPresaleNFTsPerUser : sale.maxNFTsPerUser
      //   // if (ownedSupply < maxNFTsPerUser) {
      //   setIsLoading(true)
      //   try {
      //     // const { signature, timestamp } = await restAPI.getLaunchpadSignature(
      //     //   sale.username,
      //     //   sale.collectionId,
      //     //   account.toLowerCase(),
      //     //   saleAmount
      //     // )
      //     const price = status === ProjectStatus.PRESALE_STARTED ? sale.presalePrice : sale.price
      //     await mint(saleAmount)
      //     // await mint(saleAmount, price, signature, timestamp)
      //     toastSuccess('Success', `Successfully purchased ${saleAmount} items. Check your account page to view them.`)
      //   } catch (e) {
      //     toastError('Error', e.data?.message || e.message)
      //   }
      //   setIsLoading(false)
      //   // } else {
      //   //   toastError(
      //   //     'Error',
      //   //     `Sorry, you can buy upto ${maxNFTsPerUser} NFTs in this sale. ${
      //   //       maxNFTsPerUser - ownedSupply
      //   //     } remaining now.`
      //   //   )
      //   // }
      // }
    } else {
      // toastError('No wallet or wrong network.', `Please connect your wallet and switch to '${CHAIN_KEY[project.chainId]}' network.`)
    }
  }, [account, chainValidate, toggleWalletModal])

  const onSuccess = useCallback(async () => {
    toastSuccess('Congratulations!', `You've successfully purchased the NFTs. Check your account page to view them.`)
  }, [toastSuccess])

  const onHandleInterval = (interval: CountdownTimeDelta) => {
    if (interval.total < 1100) {
      const currentTime = new Date().getTime()
      const presaleStartTime = new Date(sale.presaleStartTime).getTime()
      const publicSaleStartTime = new Date(sale.publicSaleStartTime).getTime()
      const endTime = new Date(sale.endTime).getTime()
      const status =
        currentTime > endTime
          ? ProjectStatus.ENDED
          : currentTime > publicSaleStartTime
          ? ProjectStatus.PUBLICSALE_STARTED
          : currentTime > presaleStartTime
          ? ProjectStatus.PRESALE_STARTED
          : ProjectStatus.NOT_STARTED
      if (status === ProjectStatus.NOT_STARTED) {
        setStatus(ProjectStatus.PRESALE_STARTED)
      } else if (status === ProjectStatus.PRESALE_STARTED) {
        setStatus(ProjectStatus.PUBLICSALE_STARTED)
      } else if (status === ProjectStatus.PUBLICSALE_STARTED) {
        setStatus(ProjectStatus.ENDED)
      }
    }
  }

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

  return (
    <Fragment>
      <NextSeo {...pageMeta} />
      <Box position="relative" my={16} zIndex={1}>
        <Flex position="absolute" top="-128px" opacity={0.8} width="100%" height="calc(100% + 148px)" zIndex={-2}>
          <Box position="relative" width="100%">
            <Image
              src={sale.cover}
              alt="banner"
              layout="fill"
              objectFit="cover"
              objectPosition={isLargerThan1280 ? 'center' : 'top'}
              priority
            />
          </Box>
        </Flex>
        <Container width="90%" maxWidth="90%" padding={0}>
          <Flex direction={{ base: 'column', lg: 'row' }}>
            <VStack align="left" spacing={8} width={{ base: '100%', lg: '45%' }}>
              <ChakraHeading
                as="h1"
                fontSize={{
                  base: '2rem',
                  xl: '3rem',
                  xxxl: '4rem',
                  el: '6rem',
                }}
              >
                {sale.slogan}
              </ChakraHeading>
              <ChakraText fontSize={{ xxxl: 'lg', el: 'xl' }} textShadow={theme.colors.textShadow}>
                {sale.description}
              </ChakraText>
              <HStack spacing={4}>
                {(status === ProjectStatus.PRESALE_STARTED || status === ProjectStatus.PUBLICSALE_STARTED) && (
                  <PrimaryGradientButton
                    size="lg"
                    width="max-content"
                    aria-label="go to marketplace"
                    onClick={handleBuy}
                  >
                    {`Buy Now!🔥`}
                  </PrimaryGradientButton>
                )}
                {sale.address !== ZERO_ADDRESS && status !== ProjectStatus.NOT_STARTED && (
                  <NextChakraLink href={`/collection/${sale.slug}`}>
                    {status === ProjectStatus.ENDED ? (
                      <PrimaryGradientButton
                        size="lg"
                        width="max-content"
                        aria-label="list your project"
                        textTransform="capitalize"
                      >
                        View on marketplace
                      </PrimaryGradientButton>
                    ) : (
                      <SecondaryGradientButton
                        size="lg"
                        width="max-content"
                        aria-label="list your project"
                        textTransform="capitalize"
                      >
                        View on marketplace
                      </SecondaryGradientButton>
                    )}
                  </NextChakraLink>
                )}
              </HStack>
            </VStack>
            <Box width="50%" ml="auto" display={{ base: 'none', lg: 'block' }}>
              <ProjectCard
                project={project}
                amount={progressingSupply}
                balance={totalRaised}
                status={status}
                onHandleInterval={onHandleInterval}
                minHeight={{ base: '430px', lg: '370px', xl: '430px' }}
              />
            </Box>
          </Flex>
        </Container>
      </Box>
      <ChakraLayout>
        <Box width="100%" display={{ base: 'block', lg: 'none' }} mb={8}>
          <ProjectCard
            project={project}
            status={status}
            amount={progressingSupply}
            balance={totalRaised}
            onHandleInterval={onHandleInterval}
            minHeight={{ base: '430px', lg: '370px', xl: '430px' }}
          />
        </Box>
        {status === ProjectStatus.PRESALE_STARTED && account && sale.whitelistRequired && (
          <Flex
            textAlign="center"
            justify="center"
            width="100%"
            border="2px solid"
            borderColor={isWhitelisted ? theme.colors.peaGreen : theme.colors.yellow}
            p={4}
          >
            <ChakraText
              fontSize="xl"
              fontWeight="bold"
              color={isWhitelisted ? theme.colors.peaGreen : theme.colors.yellow}
            >
              {isWhitelisted
                ? 'Congratulations! You are whitelisted. Buy now before others.'
                : 'Sorry you are not whitelisted in this presale. You can join in the next public sale round.'}
            </ChakraText>
          </Flex>
        )}
        <VStack align="initial" width="100%" spacing={{ base: 12, lg: 24 }} marginY={12} zIndex={1}>
          <Flex width="100%" direction={{ base: 'column-reverse', lg: 'row' }} gap={{ base: 12, lg: 24 }}>
            {tabs.length > 0 && (
              <Tabs index={curTab} onChange={onChange} width={{ base: '100%', lg: '55%' }}>
                <TabList border="none" overflowX="auto" overflowY="hidden" width="100%">
                  {tabs.map((tab, idx) => (
                    <Tab fontWeight="bold" whiteSpace="nowrap" _focus={{ outline: 'none' }} key={idx}>
                      <HStack spacing={4}>
                        <ChakraText fontWeight="bold" type={idx === curTab ? 'primary' : 'secondary'}>
                          {tab.label}
                        </ChakraText>
                      </HStack>
                    </Tab>
                  ))}
                </TabList>
                <TabPanels background={bgColor} borderColor={borderColor} borderWidth={1} borderRadius="md">
                  {tabs.map((tab, idx) => (
                    <TabPanel key={idx} paddingX={4} position="relative">
                      {/* {typeof tab.content === 'string' ? (
                        <ReactMarkdown>{tab.content}</ReactMarkdown>
                      ) : ( */}
                      <VStack align="initial" width="100%">
                        <TabDetailItem type="Project Website" value={tab.content.website} isLink />
                        <TabDetailItem type="Blockchain" value={tab.content.blockchain} />
                        <TabDetailItem type="Number of NFTs for Presale" value={tab.content.saleAmount} />
                        <TabDetailItem type="Price" value={tab.content.presalePrice} />
                        <TabDetailItem type="Max purchase per transaction" value={tab.content.maxPresaleMintAmount} />
                        <TabDetailItem type="Max allocation per user" value={tab.content.maxPresaleNFTsPerUser} />
                        {/* <TabDetailItem type="Public sale price" value={tab.content.publicSalePrice} /> */}
                        {/* <TabDetailItem
                            type="Max purchase per transaction (public sale)"
                            value={tab.content.maxMintAmount}
                          />
                          <TabDetailItem type="Max allocation in public sale" value={tab.content.maxNFTsPerUser} /> */}
                        <TabDetailItem type="Presale starts" value={tab.content.presaleStart} />
                        <TabDetailItem type="Public sale starts" value={tab.content.publicSaleStart} />
                        <TabDetailItem type="Reveal" value={tab.content.reveal} />
                        <TabDetailItem type="Sale ends" value={tab.content.saleEnd} />
                        <Flex align="center" justify="space-between" padding={2} width="100%">
                          <ChakraText width="100%">Social media</ChakraText>
                          <HStack w="100%" align="initial" justify="flex-end" spacing={{ base: 2, xxxl: 5 }}>
                            {Object.keys(sale.links).map((key) => (
                              <ChakraExternalLink
                                key={key}
                                border={0}
                                href={uriToSocialLink(tab.content.social[key], key)}
                                fontSize="lg"
                              >
                                <Flex
                                  justifyContent="center"
                                  align="center"
                                  minWidth={5}
                                  minHeight={5}
                                  color={theme.colors.primaryPurple}
                                >
                                  {reactIcons[key as keyof typeof reactIcons]}
                                </Flex>
                              </ChakraExternalLink>
                            ))}
                            ))
                          </HStack>
                        </Flex>
                      </VStack>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            )}
            <Flex
              width={{ base: '100%', lg: '45%' }}
              justify={{ base: 'center', lg: 'flex-end', xxxl: 'center' }}
              align="center"
              mt={{ base: 8, lg: 0 }}
              ref={scrollRef}
            >
              <SaleCard
                project={project}
                amount={saleAmount}
                balance={BIG_ZERO}
                isWhitelisted={isWhitelisted}
                status={status}
                isLoading={isLoading}
                handleChange={handleSaleAmountChange}
                handleBuy={handleBuy}
              />
            </Flex>
          </Flex>
          <Flex justify="center" width="100%" zIndex={1}>
            <SimpleGrid columns={1} spacing={{ base: 8, md: 12 }} width="100%">
              {LAUNCHPAD_BODY[3].items.map((item, index) => (
                <BlogCard blog={item} index={index} handleSubmit={handleSubmit} key={item.title} />
              ))}
            </SimpleGrid>
          </Flex>
        </VStack>
      </ChakraLayout>
      <LoadingModal isOpen={isLoading} title="Processing..." description="Send transaction to mint request" />
      {/* FIXME: something is wrong here */}
      {isNetworkModal && (
        <NetworkModal
          isNFTRequest
          isOpen={isNetworkModal}
          supposedChainId={project.chainId}
          onClose={() => setIsNetworkModal(false)}
        />
      )}
      {isMintModal && (
        <MintModal project={project} isOpen={isMintModal} onClose={() => setMintModal(false)} onSuccess={onSuccess} />
      )}
    </Fragment>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const notFoundReturn = {
    props: {
      project: null,
    },
    notFound: true,
  }
  const { slug } = context.params as IParams
  if (slug) {
    const project = LAUNCHPAD_BODY[1].sales
      .filter((sale) => supportedChainIds.includes(sale.chainId))
      .find((item) => item.meta.slug === slug)
    if (project) {
      return {
        props: {
          project,
        },
        revalidate: REVALIDATE_1_DAY,
      }
    } else {
      return notFoundReturn
    }
  }
  return notFoundReturn
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' }
}

export default memo(Index)
