import { InfoOutlineIcon } from '@chakra-ui/icons'
import { Accordion, Box, Flex, HStack, Icon, Stack, Text, VStack } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import {
  BIG_ZERO,
  BLOCKCHAIN_TO_CHAINID,
  defaultPrices,
  defaultProductSizes,
  delay,
  expDateOptions,
  generateShareLinks,
  getExplorerLink,
  getItemDescription,
  getItemName,
  getItemPageMeta,
  getItemURI,
  isERC721Collection,
  isERC1155Collection,
  itemIdToURI,
  makeUnionAddress,
  NETWORK_LABEL,
  parseUnionId,
  SaleType,
  SelectOption,
  SocialLink,
  startingDateOptions,
  toUnionCollectionId,
  toUnionItemId,
  tryParseAmount,
  unionApiClient,
} from '@nftmall/sdk'
import {
  Banner,
  BlockChainInfoItem,
  CardSelectButton,
  ChakraAccordion,
  ChakraCountdown,
  ChakraGradientText,
  ChakraHeading,
  ChakraHeadingEmoji,
  ChakraLayout,
  ChakraText,
  ChakraTooltip,
  DetailItem,
  LikeSVG,
  LoadingModal,
  MetaDataAttribute,
  ModalTypes,
  MultiPortalButton,
  NFTBlockchainAccordionProps,
  NFTDetailAccordionProps,
  NFTProductItem,
  PrimaryGradientButton,
  ProductPrice,
  SecondaryGradientButton,
  SelectSaleTypeModal,
  SharePortalButton,
  ShowMore,
  Spinner,
  theme,
  TradingHistoryAccordionProps,
  TransferHistory,
  VerifyOwnerModal,
} from '@nftmall/uikit'
import { NFT, User } from '@prisma/client'
import { CollectionType, Item, Order } from '@rarible/api-client'
import { toUnionAddress } from '@rarible/types'
import { ChainId, Currency, CurrencyAmount } from '@sushiswap/core-sdk'
import { AcceptBidModal } from 'app/components/AcceptBidModal'
import BidModal from 'app/components/BidModal'
import BurnModal from 'app/components/BurnModal'
import CancelBidModal from 'app/components/CancelBidModal'
import CancelModal from 'app/components/CancelModal'
import CheckoutConfirmModal from 'app/components/CheckoutConfirmModal'
import CheckoutModal from 'app/components/CheckoutModal'
import CollectionLabel from 'app/components/CollectionLabel'
import { FixedSaleModal } from 'app/components/FixedSaleModal'
import NetworkModal from 'app/components/NetworkModal'
import NFTBidAccordion from 'app/components/NFTBidAccordion'
import { NFTOwnership } from 'app/components/NFTOwnership'
import NFTSellOrderAccordion from 'app/components/NFTSellOrderAccordion'
import TransferModal from 'app/components/TransferModal'
import useReportModal from 'app/features/report/useReportModal'
import { retry, RetryableError } from 'app/functions/retry'
import useAuth from 'app/hooks/nftmall/useAuth'
import useGridColumnCount from 'app/hooks/nftmall/useGridColumnCount'
import useModal from 'app/hooks/nftmall/useModal'
import useNFTService from 'app/hooks/nftmall/useNFTService'
import useOrderService from 'app/hooks/nftmall/useOrderService'
import useSaleService from 'app/hooks/nftmall/useSaleService'
import { handleNFTLike, handleUserFollow, signMessage } from 'app/hooks/nftmall/useSignMessage'
import useToast from 'app/hooks/nftmall/useToast'
import { useWETH9Contract } from 'app/hooks/useContract'
import { useNextCollection } from 'app/services/our-api/hooks'
import { useCollection } from 'app/services/union-api/hooks'
import { useActiveWeb3React } from 'app/services/web3'
import { useWalletModalToggle } from 'app/state/application/hooks'
import { useProfile } from 'app/state/profile/hook'
import { nftSelectFormats, sampleSocialLinks } from 'app/utils/constants'
import { restAPI } from 'app/utils/rest'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { FC, Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { FiUsers } from 'react-icons/fi'
import { MdCalendarViewMonth } from 'react-icons/md'
import { KeyedMutator } from 'swr'
import useTopBar from 'app/hooks/nftmall/useTopBar'

// NOTE: Render NFT detail information as an accordion
function NFTDetailAccordion(props: NFTDetailAccordionProps) {
  const { attributes, collection } = props
  return (
    <ChakraAccordion title="Properties">
      <Flex flexWrap="wrap">
        {attributes && attributes.length > 0 && collection ? (
          attributes.map((item: MetaDataAttribute) => (
            <DetailItem
              title={item.key || item.trait_type}
              collection={collection}
              details={item.value}
              key={`${item.key}${item.trait_type}${item.value}`}
            />
          ))
        ) : (
          // TODO: add better ui component
          <ChakraText as="span" type="secondary">
            No properties added.
          </ChakraText>
        )}
      </Flex>
    </ChakraAccordion>
  )
}
// NOTE: Render NFT's detailed blockchain information as an accordion
function NFTBlockchainAccordion(props: NFTBlockchainAccordionProps) {
  const { item, collection } = props
  const { chainId, contract } = parseUnionId(item.id)
  // const { videoContent, imageContent } = getItemContent(item)
  const standard = isERC721Collection(collection) ? 'ERC-721' : isERC1155Collection(collection) ? 'ERC1155' : ''

  return (
    <ChakraAccordion title="Blockchain Details">
      <BlockChainInfoItem title="Contract Address" content={contract} />
      <BlockChainInfoItem title="Token ID" content={item.tokenId} />
      {standard && <BlockChainInfoItem title="Token Standard" content={standard} />}
      <BlockChainInfoItem
        title="Blockchain"
        content={NETWORK_LABEL[BLOCKCHAIN_TO_CHAINID[item.blockchain]]}
        href={
          // TODO: build token specific link
          !!chainId && !!contract
            ? getExplorerLink(chainId, contract, chainId === ChainId.THUNDERCORE ? 'address' : 'token')
            : '#'
          // getExplorerLink(chainId, contract, chainId === ChainId.THUNDERCORE ? 'address' : 'token')
          // `${BLOCKEXPLORER_URLS[nft.chainId]}/token/${nft.contract}?a=${nft.tokenId}`
        }
      />
      {/* <BlockChainInfoItem
        title="View Original Content"
        content={videoContent?.url || imageContent?.url}
        href={videoContent?.url || imageContent?.url}
      /> */}
      {/* {nft.tokenURI.includes('ipfs') && (
        <BlockChainInfoItem
          title="NFT Metadata URL on IPFS"
          content={nft.tokenURI}
          href={uriToHttps(nft.tokenURI)}
          noBorderBottom
        />
      )} */}
    </ChakraAccordion>
  )
}

// NOTE: Render Bidding list as an accordion

// NOTE: Render Creator's information as an accordion
/*
function NFTCreatorAccordion(props: NFTCreatorAccordionProps) {
  const { account, isNFTmallCollection, nft, collection, handleFollow } = props
  const title = isNFTmallCollection ? 'About Creator' : `About ${collection?.name}`
  const isNeedToRender = isNFTmallCollection ? !!nft.creator?.bio : !!collection?.name
  let socialLinks = null
  if (collection) {
    socialLinks = JSON.parse(JSON.stringify(collection?.links))
  }
  return isNeedToRender ? (
    <ChakraAccordion title={title}>
      {isNFTmallCollection ? (
        <VStack align="inital" width="100%" spacing={4}>
          {nft.creator && (
            <HUserCard account={account} user={nft.creator} handleFollow={(user, mode) => handleFollow(user, mode)} />
          )}
          {nft.creator?.bio && <ChakraText>{nft.creator?.bio}</ChakraText>}
        </VStack>
      ) : (
        <VStack align="flex-start" spacing={{ base: 4, xxxl: 6 }}>
          <Box overflow="hidden" textOverflow="ellipsis">
            {collection && (
              <NextChakraLink href={routeGenerator(collection, AccountType.COLLECTION)}>
                <Box width={20} height={20} float="left" mr={2.5} borderRadius="md">
                  <AvatarIcon user={collection} width={80} />
                </Box>
              </NextChakraLink>
            )}
            <span>{collection?.bio}</span>
          </Box>
          {socialLinks && hasValues(socialLinks) && (
            <HStack w="100%" alignItems="initial" spacing={{ base: 2, xxxl: 5 }}>
              {Object.keys(socialLinks).map(
                (key) =>
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
              ))
            </HStack>
          )}
        </VStack>
      )}
    </ChakraAccordion>
  ) : null
}
*/

// NOTE: Render Transfer History as an accordion
function TradingHistoryAccordion(props: TradingHistoryAccordionProps) {
  const { item, activities, chainId, account, handleFollow } = props
  return (
    <ChakraAccordion title="Trading History">
      {activities?.length > 0 ? (
        <TransferHistory
          activities={activities}
          chainId={chainId}
          account={account}
          handleFollow={handleFollow}
          item={item}
        />
      ) : (
        // There must be something
        <Box position="relative" minH={32}>
          <Spinner size="lg" />
        </Box>
      )}
    </ChakraAccordion>
  )
}
interface NFTPageTemplateProps {
  item: Item
  mutateItemSWR: KeyedMutator<Item>
}

const NFTPageTemplate: FC<NFTPageTemplateProps> = ({ item, mutateItemSWR }) => {
  const { recommendedTopMarginPx } = useTopBar()
  const router = useRouter()
  // console.log({ chainId: itemChainId, collectionId: itemContractAddress, tokenId: itemTokenId })
  const parsedUnionId = useMemo(() => parseUnionId(item.id), [item?.id])

  const itemTokenId = parsedUnionId.tokenId
  const itemChainId = parsedUnionId.chainId
  const unionCollectionId = toUnionCollectionId(itemChainId, parsedUnionId.contract)
  const unionItemId = toUnionItemId(itemChainId, parsedUnionId.contract, itemTokenId)
  const { account, chainId: activeChainId, library } = useActiveWeb3React()

  // console.warn({ itemServerSide, item })
  /// start
  const { data: collectionMeta, isLoading: isCollectionLoading } = useCollection({
    variables: { collectionId: unionCollectionId },
    shouldFetch: !!unionCollectionId,
    swrConfig: {
      refreshInterval: 120 * 1000, // once per 2 mins.
    },
  })

  // const ownershipId = getOwnershipId(item, account)
  // const { data: ownership, mutate: mutateOwnershipSWR } = useOwnership({
  //   variables: { ownershipId: ownershipId },
  //   shouldFetch: ownershipId && collectionMeta?.type === CollectionType.ERC1155,
  //   swrConfig: {
  //     refreshInterval: 60 * 1000, // once per 1 min.
  //   },
  // })
  // console.log({ ownership, ownershipId })
  /// end

  // console.log({ item, collectionMeta })
  const {
    data: nextCollection,
    isLoading: isNextCollectionLoading,
    error,
  } = useNextCollection({
    variables: { collectionId: unionCollectionId },
    shouldFetch: !!unionCollectionId,
    swrConfig: {
      refreshInterval: 120 * 1000, // once per 2 mins.
    },
  })

  // console.log({ nextCollection, isNextCollectionLoading, error })

  // console.log({ nftFromClient, isNFTLoading, isNFTValidating })
  const nft = useMemo(() => {
    console.log(JSON.stringify(item, null, 2))
    return item
  }, [item])

  const {
    isERC721,
    isERC1155,
    collection,
    saleType,
    activeAuction,
    bestSellOrder,
    bestSellOrderCurrency,
    auctionCurrency,
    amIOwner,
    amIBidder,
    canListForSale,
    canRemoveSale,
    canBid,
    canDirectlyBuy,
    canTransfer,
    canBurn,
    isOrderCountdown,
    auctionTime,
    mutate: mutateSaleService,
    myBalance,
    mySellOrders,
    firstGuyRoyalty,
  } = useSaleService(item)
  const nftService = useNFTService()

  const { logout } = useAuth()
  const { profile } = useProfile()
  // const { data: rate, isLoading: isLoadingRate } = useCurrencyExchangeRate()
  const { toastInfo, toastError, toastSuccess } = useToast()
  const wethContract = useWETH9Contract()
  const cardColumnCount = useGridColumnCount()
  const toggleWalletModal = useWalletModalToggle()
  const [localNFT, setLocalNFT] = useState(null)
  const [moreNFTs, setMoreNFTs] = useState(null)
  const [type, setType] = useState(0)
  const [productSize, setProductSize] = useState(0)
  const [selectType, setSelectType] = useState<SelectOption>({
    label: nftSelectFormats[0].title,
    value: 0,
    img: nftSelectFormats[0].src,
  })
  const [selectProductSize, setSelectProductSize] = useState<SelectOption>()
  // const [buyCurrency, setBuyCurrency] = useState('')
  // const [buyFee, setBuyFee] = useState<BigNumber>(BIG_ZERO)
  // const [buyPrice, setBuyPrice] = useState<BigNumber>(BIG_ZERO)
  // const [bidFee, setBidFee] = useState<BigNumber>(BIG_ZERO)
  // const [bidPrice, setBidPrice] = useState(0)
  const [depositAmount, setDepositAmount] = useState<BigNumber>(BIG_ZERO)
  const [startingDate, setStartingDate] = useState<SelectOption>(startingDateOptions[0])
  const [expDate, setExpDate] = useState<SelectOption>(expDateOptions[0])
  // const [startDate, setStartDate] = useState<Date>(new Date())
  // const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 1))
  const [liked, setLiked] = useState(false)
  const [isBidableAuction, setBidableAuction] = useState(false)
  const [isDrawer, setIsDrawer] = useState(false)
  const [isNetworkModal, setIsNetworkModal] = useState(false)
  const [isVerifyModal, setVerifyModal] = useState(false)
  const [isTransferModal, setIsTransferModal] = useState(false)
  const [isBurnModal, setIsBurnModal] = useState(false)
  const [isBidModal, setBidModal] = useState(false)
  const [isSaleTypeModal, setSaleTypeModal] = useState(false)
  const [isFixedSaleModal, setFixedSaleModal] = useState(false)
  const [isTimedAuctionModal, setTimedAuctionModal] = useState(false)
  const [isAcceptBidModal, setAcceptBidModal] = useState(false)
  const [isCancelBidModal, setCancelBidModal] = useState(false)
  const [isCheckoutModal, setCheckoutModal] = useState(false)
  const [isCheckoutConfirmModal, setCheckoutConfirmationModal] = useState(false)
  const [isNeedDeposit, setIsNeedDeposit] = useState(false)
  const [isDepositLoading, setIsDepositLoading] = useState(false)
  const [isDepositEnd, setIsDepositEnd] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [isStartingLater, setIsStartingLater] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [dateError, setDateError] = useState({
    start: false,
    end: false,
  })
  // const [transfers, setTransfers] = useState<NftTransferHistory[]>([])
  // const [isFetchingTransfers, setIsFetchingTransfers] = useState(true)
  const [isTimedOrder, setIsTimedOrder] = useState(false)
  const orderService = useOrderService()
  const [onPresentSendBidLoadingModal, onDismissSendBidLoadingModal] = useModal(
    <LoadingModal title="Sending bid" description="Send transaction to send bid request" />
  )
  const [onPresentCancelBidLoadingModal, onDismissCancelBidLoadingModal] = useModal(
    <LoadingModal title="Cancel bid" description="Send transaction to cancel bid" />
  )
  const [onPresentAcceptBidLoadingModal, onDismissAcceptBidLoadingModal] = useModal(
    <LoadingModal title="Accept bid" description="Send transaction to accept bid" />
  )
  const [onPresentTimedAuctionLoadingModal, onDismissTimedAuctionLoadingModal] = useModal(
    <LoadingModal title="Sign message" description="Sign message with auction settings" />
  )
  // const [onPresentUnlimitedSaleModal, onDismissUnlimitedSaleModal] = useModal(
  //   <UnlimitedAuctionModal onClick={handleUnlimitedSale} />
  // )
  const [onPresentFixedSaleLoadingModal, onDismissFixedSaleLoadingModal] = useModal(
    <LoadingModal title="Set price" description="Sign message to set fixed price" />
  )
  const [onPresentUnlimitedSaleLoadingModal, onDismissUnlimitedSaleLoadingModal] = useModal(
    <LoadingModal title="Create auction" description="Sign message to create auction" />
  )
  const [onPresentTransferLoadingModal, onDismissTransferLoadingModal] = useModal(
    <LoadingModal title="Transferring" description="Follow wallet instructions" />
  )
  const [onPresentBurnLoadingModal, onDismissBurnLoadingModal] = useModal(
    <LoadingModal title="Burning" description="Send transaction with your wallet to burn NFT" />
  )

  // make this as useNFTOriginalImage
  const nftMetaData = useMemo(() => item?.meta, [item]) // nft.meta
  const pageMeta = useMemo(() => getItemPageMeta(item), [item])
  // console.warn({ pageMeta })

  // NOTE: Calculate the frame size under nft size
  // const currentSizes = defaultProductSizes
  // const currentSizes = useMemo(() => {
  //   if (nft) {
  //     return defaultProductSizes.map((size) => {
  //       const tHeight = 500,
  //         tWidth = 600
  //       let width = tWidth,
  //         height = Math.trunc((width / nft?.width) * nft?.height)
  //       if (nft?.width > nft?.height) {
  //         width = tWidth
  //         height = Math.trunc((width / nft?.width) * nft?.height)
  //       } else {
  //         height = tHeight
  //         width = Math.trunc((height / nft?.height) * nft?.width)
  //       }
  //       return {
  //         width: width > height + 120 ? size.width : Math.round((size.height * width) / (height + 120)),
  //         height: width > height + 120 ? Math.round((size.width * (height + 120)) / width) : size.height,
  //       }
  //     })
  //   }
  //   return []
  // }, [nft])

  const currentSizes = defaultProductSizes
  const productPrice = useMemo(() => {
    if (type > 0 && productSize >= 0) {
      return '$' + defaultPrices[type - 1][productSize]
    }
    return '$' + 0
  }, [type, productSize])

  useEffect(() => {
    // // TODO: Need to find solution for like/dislike system via raribleSDK
    // let isCancel = false
    // // NOTE: update like / unlike if nft & account is updated
    // if (localNFT?.likedBy?.length > 0 && account && !isCancel) {
    //   const isLiked = localNFT?.likedBy.find((item: { User: User }) => item.User.userId === account.toLowerCase())
    //   setLiked(!!isLiked)
    // }
    // return () => {
    //   isCancel = true
    // }
  }, [account, localNFT?.likedBy])

  // NOTE: Define put sale, cancel sale, buy, bid buttons visible possiblity

  const nftSocialLinks: SocialLink[] = useMemo(() => {
    if (router.asPath.includes('#verify')) {
      setVerifyModal(true)
    }
    return generateShareLinks(router.asPath, sampleSocialLinks)
  }, [router, sampleSocialLinks])

  // const { data: transfers, isLoading: isFetchingTransfers } = useTransferHistoryByItem(unionItemId)
  const handleTransferHistoryOpen = async (index: number | number[]) => {
    // if (index === 0 && nft && enableFetchingTradingHistory) {
    //   setIsFetchingTransfers(true)
    //   try {
    //     const res: NftTransferHistory[] = await restAPI.getNftTransfers(
    //       nft.collectionId,
    //       nft.tokenId,
    //       nft.chainId || activeChainId,
    //     )
    //     setEnableFetchingTradingHistory(false)
    //     setTransfers(res)
    //   } catch (e) {
    //     console.error(e)
    //   }
    //   setIsFetchingTransfers(false)
    // }
  }
  const onHandleFollow = async (user: User, mode: number): Promise<string> => {
    if (!account) {
      toggleWalletModal()
      return ''
    } else {
      const res = await handleUserFollow(user, mode, account, library)
      if (res) {
        const msg = mode
          ? `You followed '${user.name || user.userId}'.`
          : `You unfollowed '${user.name || user.userId}'.`
        toastSuccess('Success', msg)
      } else {
        toastError('Error', res)
      }
      return res
    }
  }
  const handleLike = useCallback(async (likes: number, nft: NFT, mode: number): Promise<string> => {
    if (!account) {
      toggleWalletModal()
      return ''
    } else {
      const res = await handleNFTLike(likes, nft, profile.userId, mode, account, library)
      if (res) {
        const msg = mode ? `You saved like for '${nft.name}'NFT.` : `You remove like for the '${nft.name}'NFT.`
        toastSuccess('Success', msg)
      } else {
        toastError('Error', res)
      }
      return res
    }
  }, [])
  const onHeart = useCallback(async () => {
    const prevCount: number = localNFT?.likesCount
    let sig, nextCount
    // step 1. wait until signature
    if (liked) {
      nextCount = prevCount > 0 ? prevCount - 1 : 0
      sig = await handleLike(nextCount, localNFT, 0)
    } else {
      nextCount = prevCount + 1
      sig = await handleLike(nextCount, localNFT, 1)
    }
    // step 2. update local nft state
    if (sig) {
      setLocalNFT({ ...localNFT, likesCount: nextCount })
      // step 3. toggle heart
      setLiked(!liked)
    }
    // otherwise do nothing
  }, [handleLike, liked, localNFT])

  const handleVerifyOwnership = useCallback(async (): Promise<boolean> => {
    if (!library || !account || !nftMetaData) return false
    const message = `I'd like to verify my ownership of NFT '${nftMetaData.name}`
    try {
      const sig = await signMessage(library, account, message)
      const data = {
        // TODO: need to verify
        nftId: nft.id,
        sig,
        message,
        userId: profile.userId,
      }
      const res = await restAPI.verifyOwnership(data)
      if (res) {
        return res.verification
      }
    } catch (error) {
      return false
    }
    return false
  }, [account, library, nft?.id, nftMetaData, profile?.userId])

  const handleResolveDomain = useCallback(async (value: string) => {
    try {
      const resolve = await restAPI.resolveDomain(value)
      return resolve.address
    } catch (e) {
      return e.message
    }
  }, [])

  // const handleDateChange = useCallback((option: SelectOption, type: string) => {
  //   if (type === 'start') {
  //     setStartDate(new Date())
  //     setStartingDate(option)
  //     setDateError({ ...dateError, start: false })
  //   } else {
  //     let end: Date = new Date()
  //     switch (option.value) {
  //       case '1day':
  //         end = addDays(new Date(), 1)
  //         break
  //       case '3days':
  //         end = addDays(new Date(), 3)
  //         break
  //       case '5days':
  //         end = addDays(new Date(), 5)
  //         break
  //       case '7days':
  //         end = addDays(new Date(), 7)
  //         break
  //       default:
  //         end = new Date()
  //         break
  //     }
  //     setEndDate(end)
  //     setExpDate(option)
  //     setDateError({ ...dateError, end: false })
  //   }
  // }, [])
  // const handleDateOptionChange = (value: string, type: string) => {
  //   if (type === 'start') {
  //     setStartingDate({
  //       value: 'other',
  //       label: value,
  //     })
  //     setStartDate(new Date(value))
  //   } else {
  //     setExpDate({
  //       value: 'other',
  //       label: value,
  //     })
  //     setEndDate(new Date(value))
  //   }
  // }

  // NOTE: Open side drawer for showing size info
  const onSideBarClose = useCallback(() => {
    setIsDrawer(false)
  }, [])
  const onSideBarOpen = useCallback(() => {
    setIsDrawer(true)
  }, [])
  // const onHandleInterval = (interval: CountdownTimeDelta) => {
  //   if (interval.total < 1100) {
  //     if (isStartingLater) {
  //       if (activeAuction.endTime > new Date().getTime()) {
  //         setAuctionTime(activeAuction.endTime)
  //         setIsStartingLater(false)
  //         setBidableAuction(true)
  //       } else {
  //         setIsStartingLater(false)
  //         setBidableAuction(false)
  //       }
  //     } else if (isTimedOrder) {
  //       setIsOrderCountdown(false)
  //     } else {
  //       setBidableAuction(false)
  //     }
  //   }
  // }
  const onRefreshMetadata = useCallback(async () => {
    try {
      toastInfo('Success!', "We've queued this item for an update! Check back in a minute...")
      // 1. let `nft-meta-loader` load metadata again
      await unionApiClient.item.resetItemMeta({ itemId: unionItemId })
      // 2. wait few seconds.
      delay(3_000)
      // alert('reseted')
      // 3. wait until new metadata appears
      const { promise: metadataPromise } = retry(
        async () => {
          const item = await unionApiClient.item.getItemById({ itemId: unionItemId })
          if (item?.meta) return item
          throw new RetryableError()
        },
        { n: 10, minWait: 2000, maxWait: 5000 }
      )
      const newItem = await metadataPromise
      // alert('newmeta')
      // 4. now validate current page cache on demand #1095
      await restAPI.revalidateURI(getItemURI(newItem))
    } catch (e) {
      console.warn('Failed to refresh metadata', e)
    }
  }, [toastInfo, unionItemId])

  // NOTE: check current connected chain and nft's chain
  const chainValidate = useCallback(() => {
    console.debug({ activeChainId, itemChainId })
    if (activeChainId !== itemChainId) {
      setIsNetworkModal(true)
      return false
    }
    return true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChainId, itemChainId, account, library])

  // NOTE: handle show/hide modal
  const handleModal = useCallback(
    async (type: string, showModal: boolean, order?: Order) => {
      console.log({ type, showModal, order })
      if (type === ModalTypes.VERIFY) {
        setVerifyModal(showModal)
      } else {
        if (!account && showModal) {
          toggleWalletModal()
        } else if (chainValidate()) {
          // NOTE: initiate loading state before re-open modal
          setIsDepositLoading(false)
          switch (type) {
            case ModalTypes.ACCEPT_BID:
              if (showModal && order) {
                setSelectedOrder(order)
              }
              setAcceptBidModal(showModal)
              break
            case ModalTypes.BID: {
              if (!isOrderCountdown) {
                setBidModal(showModal)
              }
              // TODO: may show toast. can't do sth while ...
              break
            }
            case ModalTypes.CANCEL_BID:
              if (showModal && order) {
                setSelectedOrder(order)
              }
              setCancelBidModal(showModal)
              break
            case ModalTypes.CHECKOUT:
              if (!isOrderCountdown) {
                if (order) {
                  setSelectedOrder(order)
                }
                setCheckoutModal(showModal)
              }
              break
            case ModalTypes.CHECKOUT_CONFIRM:
              // setCheckoutConfirmationModal(showModal)
              break
            case ModalTypes.FIXED_SALE:
              setFixedSaleModal(showModal)
              break
            case ModalTypes.TIMED_AUCTION: {
              if (!showModal) {
                setDateError({ start: false, end: false })
                setStartingDate(startingDateOptions[0])
                setExpDate(expDateOptions[0])
              }
              setTimedAuctionModal(showModal)
              break
            }
            // case ModalTypes.OPEN_BID:
            //   onPresentUnlimitedSaleModal()
            //   break
            case ModalTypes.SALE_TYPE:
              setSaleTypeModal(showModal)
              break
            case ModalTypes.TRANSFER:
              setIsTransferModal(showModal)
              break
            case ModalTypes.BURN:
              setIsBurnModal(showModal)
              break
          }
        }
      }
    },
    [account, chainValidate, isOrderCountdown, toggleWalletModal]
  )

  // NOTE: create sellOrder handler
  const handleFixedSale = useCallback(async () => {
    handleModal(ModalTypes.FIXED_SALE, false)
    // onPresentFixedSaleLoadingModal()
    mutateSaleService()
    mutateItemSWR()
    toastSuccess('Success', `NFT has been put on the marketplace.`)
    // onDismissFixedSaleLoadingModal()
  }, [handleModal, mutateItemSWR, mutateSaleService, toastSuccess])

  // NOTE: start timed auction
  const handleTimedAuction = useCallback(async () => {
    // setDateError({ ...dateError, start: false })
    // if (startDate && endDate) {
    //   const validStartDate = new Date().getTime()
    //   const sDate = startingDate.value !== 'right_after' ? startDate.getTime() : validStartDate
    //   const validEndDate =
    //     startingDate.value === 'right_after' ? new Date().getTime() + 10 * 60000 : startDate.getTime() + 10 * 60000
    //   const isTimeValidated = endDate.getTime() > validEndDate && sDate >= validStartDate
    //   if (isTimeValidated) {
    //     handleModal(ModalTypes.TIMED_AUCTION, false)
    //     const currency = matchedContractAddress(selectedCurrency?.symbol, activeChainId)
    //     const startTime = startingDate.value === 'right_after' ? new Date() : startDate
    //     const endTime =
    //       startingDate.value === 'right_after'
    //         ? endDate.getTime() < new Date().getTime() + 10 * 60000
    //           ? new Date(new Date().getTime() + 10 * 60000)
    //           : endDate
    //         : endDate
    //     const message = `I would like to create auction with parameters: id: ${nft.nftId}, currency:${currency}, minPrice:${saleInput}, start:${startTime}, end:${endTime}`
    //     onPresentTimedAuctionLoadingModal()
    //     try {
    //       const signature = await signMessage(library, account, message)
    //       if (signature) {
    //         const data = {
    //           auction: {
    //             startDate: startTime.toISOString(),
    //             endDate: endTime.toISOString(),
    //             currency,
    //             minPrice: getDecimalAmount(BigNumber.from(saleInput)).toFixed(),
    //             nftId: nft.nftId,
    //             collectionId: nft.collectionId,
    //             type: SaleType.AUCTION_TIMED,
    //           },
    //           sig: signature,
    //           message,
    //           userId: account.toLowerCase(),
    //         }
    //         const res = await restAPI.createAuction(data)
    //         if (res) {
    //           toastSuccess('Success', `NFT has been put on the marketplace.`)
    //         }
    //       }
    //     } catch (error) {
    //       console.error(error)
    //       onDismissTimedAuctionLoadingModal()
    //       toastError('An error occurred.', error.message)
    //     }
    //     onDismissTimedAuctionLoadingModal()
    //   } else {
    //     setDateError({
    //       start: sDate < validStartDate,
    //       end: endDate.getTime() <= validEndDate,
    //     })
    //   }
    // } else {
    //   setDateError({
    //     start: !startDate,
    //     end: !endDate,
    //   })
    // }
  }, [])
  // NOTE: put nft to marketplace as a unlimited auction
  const handleUnlimitedSale = useCallback(async () => {
    // if (chainValidate()) {
    //   onDismissUnlimitedSaleModal()
    //   onPresentUnlimitedSaleLoadingModal()
    //   const message = `I would like to put on sale id: ${nft.nftId}`
    //   try {
    //     const signature = await signMessage(library, account, message)
    //     if (signature) {
    //       const data = {
    //         auction: {
    //           startDate: new Date().toISOString(),
    //           endDate: new Date(new Date().getTime() + 60 * 60000).toISOString(),
    //           currency: ZERO_ADDRESS,
    //           minPrice: '0',
    //           nftId: nft.nftId,
    //           collectionId: nft.collectionId,
    //           type: SaleType.AUCTION_UNLIMITED,
    //         },
    //         sig: signature,
    //         message,
    //         userId: account.toLowerCase(),
    //       }
    //       const res = await restAPI.createAuction(data)
    //       if (res) {
    //         toastSuccess('Success', `NFT has been put on the marketplace.`)
    //       }
    //     }
    //   } catch (error) {
    //     toastError('An error occurred.', error.message)
    //   }
    //   onDismissUnlimitedSaleLoadingModal()
    // } else {
    //   onDismissUnlimitedSaleModal()
    // }
  }, [])
  const handleCancelSale = useCallback(async () => {
    await orderService.cancelOrder(mySellOrders[0].id)
    mutateSaleService()
    mutateItemSWR()
    toastSuccess(
      'Success!',
      // TODO: https://github.com/NFTmall/NFTmall/issues/993
      `You have removed the listing of ${item.meta.name}.` // for ${activeSellOrder.priceInToken}${activeSellOrder.currency}.`,
    )
    onDismissCancelSaleModal()

    // if (chainValidate()) {
    //   onPresentCancelSaleLoadingModal()
    //   try {
    //     // debugger
    //     if (activeAuction) {
    //       // let message = ''
    //       // if (saleType === SaleType.AUCTION_TIMED) {
    //       //   message = `I would like to delete auction with parameters: id: ${activeAuction.auctionId}, currency: ${
    //       //     activeAuction.currencyId
    //       //   }, minPrice: ${activeAuction.minPrice}, start: ${moment
    //       //     .utc(activeAuction.startDate)
    //       //     .toDate()}, end: ${moment.utc(activeAuction.startDate).toDate()}`
    //       // } else {
    //       //   message = `I would like to remove from sale id: ${activeAuction.auctionId}`
    //       // }
    //       // const signature = await signMessage(library, account, message)
    //       // if (signature) {
    //       //   await restAPI.cancelAuction(activeAuction.auctionId, {
    //       //     sig: signature,
    //       //     message,
    //       //     userId: account.toLowerCase(),
    //       //   })
    //       //   const notification =
    //       //     saleType === SaleType.AUCTION_TIMED
    //       //       ? `You cancelled the auction of ${nft.name} for ${activeAuction.priceInToken}${activeAuction.currency}.`
    //       //       : `You cancelled the auction of ${nft.name}.`
    //       //   toastSuccess('Success!', notification)
    //       // }
    //     } else if (activeSellOrder) {
    //       await orderService.cancelOrder(activeSellOrder.id)
    //       mutateSaleService()
    //       mutateItemSWR()
    //       mutateOwnershipSWR()
    //       toastSuccess(
    //         'Success!',
    //         // TODO: https://github.com/NFTmall/NFTmall/issues/993
    //         `You have removed the listing of ${item.meta.name}.` // for ${activeSellOrder.priceInToken}${activeSellOrder.currency}.`,
    //       )
    //     }
    //   } catch (error) {
    //     // debugger
    //     toastError('Oops', error.data?.message || error.message || 'Failed to remove your list. Try again later.')
    //   }
    //   onDismissCancelSaleLoadingModal()
    // } else {
    //   // can do something
    // }
    // onDismissCancelSaleModal()
  }, [
    activeAuction,
    bestSellOrder,
    chainValidate,
    item?.meta?.name,
    mutateItemSWR,
    mutateSaleService,
    // onDismissCancelSaleLoadingModal,
    // onDismissCancelSaleModal,
    // onPresentCancelSaleLoadingModal,
    orderService,
    toastError,
    toastSuccess,
  ])
  // NOTE: create buyOrder for directly purchase NFT handler
  const onPurchaseSuccess = useCallback(
    async (txReceipt: any) => {
      toastSuccess('Success', `Successfully purchased!`)
      mutateSaleService()
      mutateItemSWR()
      setTxHash(txReceipt.hash)
      // onDismissBuyLoadingModal()
      handleModal(ModalTypes.CHECKOUT, false)
      // TODO: handleModal(ModalTypes.CHECKOUT_CONFIRM, true)
    },
    [handleModal, mutateItemSWR, mutateSaleService, toastSuccess]
  )

  const handleVerificationModal = useCallback(() => {
    handleModal(ModalTypes.VERIFY, false)
    if (router.asPath.includes('#verify')) {
      // TODO: support `slug`
      router.push(itemIdToURI(item.id))
    }
  }, [handleModal, item?.id, router])

  const handleTransfer = useCallback(
    async (toAddress: string) => {
      handleModal(ModalTypes.TRANSFER, false)
      onPresentTransferLoadingModal()
      try {
        await nftService.transfer(item.id, toUnionAddress(makeUnionAddress(itemChainId, toAddress)))
        mutateSaleService()
        mutateItemSWR()
        toastSuccess('Success', `Successfully transfered to ${toAddress}.`)
      } catch (error) {
        console.error(error)
        toastError('Transfer Failed.', error?.message || 'Please try again later.')
      }
      onDismissTransferLoadingModal()
    },
    [
      handleModal,
      item.id,
      itemChainId,
      mutateItemSWR,
      mutateSaleService,
      nftService,
      onDismissTransferLoadingModal,
      onPresentTransferLoadingModal,
      toastError,
      toastSuccess,
    ]
  )

  const onBurnNFTSuccess = useCallback(async () => {
    handleModal(ModalTypes.BURN, false)
    toastSuccess('Success', 'Redirecting you to your profile page...')
    await router.replace('/account')
  }, [handleModal, router, toastSuccess])

  // NOTE: convert BNB to WBNB
  // const handleDeposit = useCallback(async () => {
  //   if (account) {
  //     setIsDepositLoading(true)
  //     try {
  //       const inputAmount = tryParseAmount(depositAmount.toString(), selectedCurrency)
  //       const tx = await wethContract.deposit({
  //         value: `0x${inputAmount.quotient.toString(16)}`,
  //       })
  //       const receipt = await tx.wait()
  //       setIsDepositLoading(false)
  //       if (receipt.status) {
  //         setIsDepositEnd(true)
  //       }
  //     } catch (error) {
  //       console.error(error)
  //       toastError('Oops', error.message)
  //       setIsDepositLoading(false)
  //     }
  //   }
  // }, [account, depositAmount, selectedCurrency, toastError, wethContract])
  // NOTE: make buyOrder with sig and save it to DB
  const onPlaceBidSuccess = useCallback(async () => {
    mutateSaleService()
    mutateItemSWR()
    toastSuccess(
      'Success!',
      // `You placed a bid of ${saleInput.toSignificant(10)} ${saleInput.currency.symbol} on '${item.meta.name}.'`
      `You placed a bid on '${item.meta.name}.'`
    )
    handleModal(ModalTypes.BID, false)
  }, [handleModal, item, mutateSaleService, mutateItemSWR, toastSuccess])

  // NOTE: cancel bidOrder by bid owner
  const onHandleCancelBidSuccess = useCallback(async () => {
    mutateSaleService()
    mutateItemSWR()
    toastSuccess('Success!', `You removed your request of '${getItemName(item)}'.`)
    handleModal(ModalTypes.CANCEL_BID, false)
  }, [handleModal, item, mutateItemSWR, mutateSaleService, toastSuccess])

  const onHandleAcceptBidSuccess = useCallback(async () => {
    mutateSaleService()
    mutateItemSWR()
    toastSuccess('Success!', `Your NFT has been sold out.`) // by ${selectedBid.maker}.`)
    handleModal(ModalTypes.ACCEPT_BID, false)
  }, [handleModal, mutateItemSWR, mutateSaleService, toastSuccess])

  // NOTE: Handling product format if it's digital or goods
  const onTypeChange = useCallback((id: number) => {
    if (id > 3) return
    setProductSize(0)
    setType(id)
  }, [])
  // NOTE: Handling frame size for goods
  const onSizeChange = useCallback((id: number) => {
    setProductSize(id)
  }, [])

  const windowLocationHref = useMemo(() => (typeof window !== 'undefined' ? window.location.href : '#'), [])
  // Send report
  const sendReport = async (email: string, description: string) => {
    const response = await restAPI.sendReport(email, description, windowLocationHref)
    if (response.report) {
      toastSuccess('Thanks for reporting!')
    } else {
      toastError('Oops', 'Failed to report. Try again later.')
    }
    onDismissReportModal()
  }
  // <!-- NOTE: brought this section out to use it multiple times in rendering --!>

  // NOTE: Handling loading & wallet, report modals show/hide
  const [onPresentReportModal, onDismissReportModal] = useReportModal()
  const [onPresentBuyLoadingModal, onDismissBuyLoadingModal] = useModal(
    <LoadingModal title="Purchase" description="Send transaction to purchase asset" />
  )
  const [onPresentCancelSaleModal, onDismissCancelSaleModal] = useModal(
    <CancelModal
      title={saleType === SaleType.AUCTION_TIMED ? 'Cancel auction' : 'I understand, continue'}
      description={
        activeAuction
          ? 'Do you really want to cancel auction? You can create new auction or put on sale in future.'
          : 'Do you really want to remove your item from sale? You can put it on sale anytime.'
      }
      onClick={handleCancelSale}
      primaryBtnName={activeAuction ? 'Cancel auction' : 'I understand, continue'}
      hasCancel
    />
  )
  const [onPresentCancelSaleLoadingModal, onDismissCancelSaleLoadingModal] = useModal(
    <LoadingModal
      title={activeAuction ? (saleType === SaleType.AUCTION_TIMED ? 'Sign message' : 'Cancel auction') : 'Cancel sale'}
      description={
        activeAuction
          ? saleType === SaleType.AUCTION_TIMED
            ? 'Sign message with auction settings'
            : 'Sign message to cancel unlimited auction'
          : 'Send transaction with your wallet to cancel sale'
      }
    />
  )

  const buyProduct = () => {
    toastInfo('Coming soon...')
    // router.push('/checkout?productId=' + nft.nftId + '&productType=' + type + '&productSize=' + productSize)
    // if (!account) {
    //   toggleWalletModal()
    // } else if (account !== nft.ownerId) {
    //   onPresentProductOwnerWarningModal()
    // } else {
    //   router.push('/checkout?productId=' + nft.nftId + '&productTywpe=' + type + '&productSize=' + productSize)
    // }
  }

  // console.log({ item })

  return (
    <Fragment>
      <NextSeo {...pageMeta} />
      <Banner from="nft" is_extra={type !== 0} />
      <ChakraLayout display="flex" py={{ base: 0, lg: 10 }}>
        <VStack width="100%" spacing={12}>
          <Flex alignItems="flex-start" direction={{ base: 'column', lg: 'row' }} width="100%" zIndex={1}>
            <Box width={{ base: '100%', lg: '56%' }} height={{ base: 'auto', lg: '100%' }}>
              <NFTProductItem item={item} type={type} />
            </Box>
            <Flex
              flex={1}
              flexDirection="column"
              justifyContent="center"
              ml={{ lg: 8, xl: 12, xxl: 16, xxxl: 32 }}
              marginTop={{ base: 8, lg: 0 }}
              position="relative"
              shadow="md"
              width={{ base: 'full', lg: 0 }}
            >
              <Flex position="absolute" top={0} right={0} gridColumnGap={4}>
                {/* <LikeButtonWithWrapper liked={liked} likes={localNFT?.likesCount || nft.likesCount} onClick={onHeart} /> */}
                <MultiPortalButton
                  handleBurn={() => handleModal(ModalTypes.BURN, true)}
                  handleTransfer={() => handleModal(ModalTypes.TRANSFER, true)}
                  hasTransferButton={false}
                  // hasTransferButton={canTransfer}
                  hasBurnButton={canBurn}
                  handleReport={onPresentReportModal}
                  handleRefresh={onRefreshMetadata}
                  hasRefresh
                  handleVerify={() => handleModal(ModalTypes.VERIFY, true)}
                  hasVerifyButton={false}
                  // hasVerifyButton={!nft.meta.animation}
                />
              </Flex>
              <VStack align="flex-start" spacing={8} width="100%" mt={{ base: 9, lg: 0 }}>
                <VStack alignItems="flex-start" spacing={4} width="100%">
                  {
                    // nextCollection && (
                    //   <ChakraInternalLink href={getNextCollectionURI(nextCollection)}>
                    //     <HStack spacing={2}>
                    //       <ChakraTooltip label={NETWORK_LABEL[nextCollection.chainId]}>
                    //         <Box width={6} height={6}>
                    //           <Image
                    //             src={CLOUDNIARY_THEME_URL + NETWORK_ICON[nextCollection.chainId]}
                    //             alt={nextCollection?.name}
                    //             width={24}
                    //             height={24}
                    //             className="border-radius-full"
                    //           />
                    //         </Box>
                    //       </ChakraTooltip>
                    //       <ChakraText type="main">{getNextCollectionName(nextCollection)}</ChakraText>
                    //     </HStack>
                    //   </ChakraInternalLink>
                    // )
                    //  : isNextCollectionLoading ? (
                    //   <HStack spacing={2}>
                    //     <Skeleton borderRadius="100%" height={6} width={6} transform="auto | auto-gpu" />
                    //     <Skeleton height={6} width={40} transform="auto | auto-gpu" />
                    //   </HStack>
                    // ) : null
                  }
                  {/* ========= NFT Name */}
                  <ChakraHeading noOfLines={2} wordBreak="break-all">
                    {getItemName(item)}
                  </ChakraHeading>
                  {collectionMeta?.type === CollectionType.ERC1155 && (
                    <HStack spacing={2}>
                      <Icon as={MdCalendarViewMonth} /> <Text>{item.supply} total</Text>
                      <Icon as={FiUsers} /> <Text>{item.sellers} sellers</Text>
                    </HStack>
                  )}
                  {/* ========= NFT Description */}
                  <ShowMore>
                    <ChakraText type="secondary">{getItemDescription(item)}</ChakraText>
                  </ShowMore>
                  <Stack direction={{ base: 'column', sm: 'row', md: 'row', lg: 'column', xl: 'row' }} spacing={8}>
                    {/* ========= Collection section */}
                    {nextCollection && (
                      <CollectionLabel
                        collectionId={nextCollection?.id}
                        fallbackCollection={nextCollection}
                        width={10}
                      />
                    )}
                    {/* ========= NFT Ownership section */}
                    {/* TODO: handle this more intelligently. https://github.com/NFTmall/NFTmall/issues/1147 */}
                    {item && (isERC721 || (isERC1155 && amIOwner)) && (
                      <NFTOwnership item={item} handleFollow={onHandleFollow} isOwnerVisible />
                    )}
                  </Stack>
                  {/* ======================= Sale status section ======================= */}
                  {type > 0 && type < 4 ? null : (
                    // <Box>
                    //   <ChakraText fontSize="lg">Price</ChakraText>
                    //   <ChakraText mb={4} fontSize="3xl" fontWeight="bold">
                    //     {productPrice}
                    //   </ChakraText>
                    // </Box>
                    <VStack
                      align="initial"
                      width="100%"
                      background="linear-gradient(90deg, rgba(113 134 255 / 10%), transparent)"
                      borderRadius="md"
                      paddingY={2}
                      paddingX={2}
                    >
                      {!bestSellOrder &&
                        (!activeAuction ? (
                          <ChakraText textAlign="center" fontSize="lg" fontWeight="bold" noOfLines={2}>
                            {collectionMeta?.type === CollectionType.ERC1155 ? 'Not for sale' : 'Open for Bids'}
                          </ChakraText>
                        ) : saleType === SaleType.AUCTION_UNLIMITED ? (
                          <ChakraText textAlign="center" fontSize="lg" fontWeight="bold" noOfLines={2}>
                            Unlimited Auction
                          </ChakraText>
                        ) : null)}
                      {/* ======================= Item price section ======================= */}
                      {(!!bestSellOrder || saleType === SaleType.AUCTION_TIMED) && (
                        <HStack alignItems="start" width="100%" spacing={8}>
                          {bestSellOrder && (
                            <ProductPrice
                              quantity={parseInt(bestSellOrder.makeStock)}
                              tokenPrice={bestSellOrder.makePrice}
                              currencySymbol={bestSellOrderCurrency.symbol}
                              usdPrice={bestSellOrder.makePriceUsd}
                              title="Current Price"
                              data-cy="text-price"
                            />
                          )}
                          {saleType === SaleType.AUCTION_TIMED && (
                            <ProductPrice
                              tokenPrice={activeAuction.buyPrice}
                              currencySymbol={auctionCurrency.symbol}
                              usdPrice={activeAuction.buyPriceUsd}
                              title="Minimum bid"
                            />
                          )}
                          {/* {highestBid && (
                          <ProductPrice
                            tokenPrice={highestBid.makePrice}
                            currencySymbol={highestBid.currency}
                            usdPrice={highestBid.makePriceUsd}
                            title="Highest bid"
                            data-cy="text-highest-bid"
                          />
                        )} */}
                        </HStack>
                      )}
                    </VStack>
                  )}
                  {/* ======================= Countdown section ======================= */}

                  {type === 0 &&
                    (isStartingLater || isBidableAuction || isOrderCountdown ? (
                      <Box position="relative" width="100%" height={10}>
                        <ChakraCountdown
                          date={isOrderCountdown ? 0 : auctionTime} // FIXME: weird
                          // date={isOrderCountdown ? timedOrderTime : auctionTime}
                          isActive={false}
                          isStartingLater={isOrderCountdown ? true : isStartingLater}
                          prefix={isOrderCountdown ? 'Dropping in' : undefined}
                          // onHandleInterval={onHandleInterval}
                          position="absolute"
                          bottom={0}
                          left={0}
                        />
                      </Box>
                    ) : saleType === SaleType.AUCTION_TIMED ? (
                      <CardSelectButton
                        aria-label="auction ended"
                        size="lg"
                        className="card-outline--gradient mask time"
                        isActive={true}
                        _focus={{ boxShadow: 'none', textShadow: 'none' }}
                        _hover={{ boxShadow: 'none', textShadow: 'none' }}
                      >
                        <ChakraHeadingEmoji text="This auction has ended" emoji="🎉" fontSize="md" />
                      </CardSelectButton>
                    ) : bestSellOrder && isTimedOrder ? (
                      <CardSelectButton
                        aria-label="sale started"
                        size="lg"
                        className="card-outline--gradient mask time"
                        isActive={true}
                        _focus={{ boxShadow: 'none', textShadow: 'none' }}
                        _hover={{ boxShadow: 'none', textShadow: 'none' }}
                      >
                        <ChakraText fontSize="md" fontWeight="bold">
                          Buy Now
                        </ChakraText>
                      </CardSelectButton>
                    ) : null)}
                </VStack>
                {type > 0 && (
                  <ChakraText fontSize="xl" fontWeight="bold">
                    {productPrice}
                  </ChakraText>
                )}
                {/* {!nft.meta.animation && (
                  <Stack direction="column" width="100%" align="flex-start" spacing={8}>
                    <VStack alignItems="flex-start" spacing={4} width="100%">
                      <ChakraText fontSize="sm">Select Format</ChakraText>
                      <SimpleGrid
                        display={{ base: 'none', sm: 'grid' }}
                        width="100%"
                        columns={[1, null, 3]}
                        spacing={4}
                      >
                        {nftSelectFormats.map((format, index) => (
                          <CardSelectButton
                            aria-label="select type"
                            px={2}
                            key={`${format.title}-${index}`}
                            isActive={index === type}
                            isDisabled={index > 3}
                            size="lg"
                            onClick={() => {
                              onTypeChange(index)
                            }}
                          >
                            <Flex align="center" justify="center" width="100%">
                              <Box width={5} height={5} display="table">
                                {format.src}
                              </Box>
                              <ChakraText fontSize="sm" fontWeight="bold" pl={2} noOfLines={1}>
                                {format.title}
                              </ChakraText>
                            </Flex>
                          </CardSelectButton>
                        ))}
                      </SimpleGrid>
                      <Box display={{ base: 'block', sm: 'none' }} width="100%">
                        <ChakraSelect
                          options={nftSelectFormats.map((format, index) => {
                            return { label: format.title, value: index, img: format.src }
                          })}
                          value={selectType}
                          placeholder="Select Type"
                          onChange={(option: SelectOption) => {
                            setSelectType(option)
                            onTypeChange(Number(option.value))
                          }}
                        />
                      </Box>
                    </VStack>
                    {currentSizes && type > 0 && (
                      <VStack alignItems="flex-start" spacing={4} width="100%">
                        <HStack spacing={4}>
                          <ChakraText fontSize="sm">Select Size</ChakraText>
                          <HStack spacing={2} cursor="pointer" onClick={onSideBarOpen}>
                            <SizeInfoSVG />
                            <ChakraText fontSize="sm" fontWeight="semibold" type="main">
                              Size Info
                            </ChakraText>
                          </HStack>
                        </HStack>
                        <SimpleGrid
                          display={{ base: 'none', sm: 'grid' }}
                          width="100%"
                          columns={[3, null, 5]}
                          spacing={4}
                        >
                          {currentSizes.map((size, index) => (
                            <CardSelectButton
                              aria-label="select size"
                              key={`${size.width}${size.height}`}
                              isActive={index === productSize}
                              size="lg"
                              onClick={() => onSizeChange(index)}
                            >
                              <ChakraText fontSize={['12px', null, '13px']} fontWeight="bold" textAlign="center">
                                {`${size.width}" X ${size.height}"`}
                              </ChakraText>
                            </CardSelectButton>
                          ))}
                        </SimpleGrid>
                        <Box display={{ base: 'block', sm: 'none' }} width="100%">
                          <ChakraSelect
                            options={currentSizes.map((size, index) => {
                              return { label: `${size.width}" X ${size.height}"`, value: index }
                            })}
                            value={selectProductSize}
                            placeholder="Select Size"
                            onChange={(option: SelectOption) => {
                              setSelectProductSize(option)
                              onSizeChange(Number(option.value))
                            }}
                          />
                        </Box>
                      </VStack>
                    )}
                  </Stack>
                )} */}

                <Flex width="100%" direction={{ base: 'column', md: 'row' }} gap={4}>
                  {type === 0 ? (
                    <>
                      {canDirectlyBuy && (
                        <PrimaryGradientButton
                          aria-label="directly buy"
                          size="lg"
                          isDisabled={isTimedOrder ? isOrderCountdown : false}
                          onClick={() => handleModal(ModalTypes.CHECKOUT, true, bestSellOrder)}
                        >
                          Buy Now
                        </PrimaryGradientButton>
                      )}
                      {canListForSale && (
                        <PrimaryGradientButton
                          aria-label="put sale"
                          size="lg"
                          onClick={() => handleModal(ModalTypes.FIXED_SALE, true)}
                          // TODO: let user choose sale types. for now only fixed price
                          // onClick={() => handleModal(ModalTypes.SALE_TYPE, true)}
                        >
                          Put on sale <br /> {myBalance > 1 ? `X ${myBalance}` : null}
                          {/* Put on sale {maxItemsForSale > 1 ? `X ${maxItemsForSale}` : null} */}
                        </PrimaryGradientButton>
                      )}
                      {canRemoveSale && (
                        <SecondaryGradientButton aria-label="remove sale" size="lg" onClick={onPresentCancelSaleModal}>
                          Remove <br />
                          from sale
                        </SecondaryGradientButton>
                      )}
                    </>
                  ) : type !== 4 ? (
                    <PrimaryGradientButton aria-label="buy now" size="lg" onClick={buyProduct}>
                      Buy Now
                    </PrimaryGradientButton>
                  ) : null}
                  {type === 0 ? (
                    <HStack spacing={4} width="100%">
                      {/* pt={{ base: 4, md: 0 }} pl={{ base: 0, md: 4 }} */}
                      {canBid &&
                        (canDirectlyBuy ? (
                          amIBidder ? null : (
                            <SecondaryGradientButton
                              aria-label="place bid"
                              size="lg"
                              flex={1}
                              className="btn-outline--gradient"
                              isDisabled={isTimedOrder ? isOrderCountdown : false}
                              onClick={() => handleModal(ModalTypes.BID, true)}
                            >
                              Place bid
                            </SecondaryGradientButton>
                          )
                        ) : amIBidder ? null : (
                          <PrimaryGradientButton
                            aria-label="place bid"
                            size="lg"
                            flex={1}
                            onClick={() => handleModal(ModalTypes.BID, true)}
                          >
                            Place bid
                          </PrimaryGradientButton>
                        ))}
                      <SharePortalButton href={windowLocationHref} hasText hasTwitter size="lg" />
                    </HStack>
                  ) : (
                    <SharePortalButton
                      // pt={{ base: 4, md: 0 }}
                      // pl={{ base: 0, md: 4 }}
                      href={windowLocationHref}
                      hasText
                      hasTwitter
                      size="lg"
                    />
                  )}
                </Flex>

                {firstGuyRoyalty && (
                  <HStack spacing={2.5}>
                    <LikeSVG />
                    <ChakraGradientText fontSize="sm">
                      Creator Royalties: {(firstGuyRoyalty / 100).toFixed()}%
                    </ChakraGradientText>
                    <ChakraTooltip
                      label={`The creator of this item will receive ${(
                        firstGuyRoyalty / 100
                      ).toFixed()}% of the sale total from future sales of this item.`}
                    >
                      <InfoOutlineIcon color={theme.colors.primaryPurple} />
                    </ChakraTooltip>
                  </HStack>
                )}
              </VStack>
              <Accordion width="100%" defaultIndex={[0, 1, 2]} allowToggle allowMultiple mt={4}>
                {collectionMeta?.type === CollectionType.ERC721 && (
                  <NFTBidAccordion
                    item={item}
                    saleType={saleType}
                    // bidders={bidOrders}
                    // activeAuction={activeAuction}
                    // activeOrder={activeSellOrder}
                    // highestBid={highestBid}
                    // chainId={nft.chainId}
                    // rate={rate}
                    // isOwner={isOwner}
                    // isBidableAuction={isBidableAuction}
                    // account={account}
                    // handleFollow={onHandleFollow}
                    onAccept={(bid) => handleModal(ModalTypes.ACCEPT_BID, true, bid)}
                    onCancel={(bid) => {
                      console.warn({ bid })
                      handleModal(ModalTypes.CANCEL_BID, true, bid)
                    }}
                  />
                )}
                {collectionMeta?.type === CollectionType.ERC1155 && (
                  <NFTSellOrderAccordion
                    item={item}
                    saleType={saleType}
                    onAccept={(order) => handleModal(ModalTypes.CHECKOUT, true, order)}
                    onCancel={(order) => {
                      console.warn({ bid: order })
                      handleModal(ModalTypes.CANCEL_BID, true, order)
                    }}
                  />
                )}
                <NFTDetailAccordion attributes={item?.meta?.attributes} collection={collectionMeta} />
                <NFTBlockchainAccordion item={item} collection={collection} />
                {/* <NFTCreatorAccordion
                  account={account}
                  isNFTmallCollection={compareAddresses(collectionId, NFTMALL_ERC721_ADDRESS[itemChainId])}
                  nft={nft}
                  collection={collection}
                  handleFollow={onHandleFollow}
                /> */}
              </Accordion>
              {isAcceptBidModal && (
                <AcceptBidModal
                  item={item}
                  bid={selectedOrder}
                  isOpen={isAcceptBidModal}
                  onSuccess={onHandleAcceptBidSuccess}
                  onClose={() => handleModal(ModalTypes.ACCEPT_BID, false)}
                />
              )}
              {isBidModal && (
                <BidModal
                  item={item}
                  isOpen={isBidModal}
                  onSuccess={onPlaceBidSuccess}
                  onClose={() => handleModal(ModalTypes.BID, false)}
                />
              )}

              {isBurnModal && (
                <BurnModal
                  item={item}
                  isOpen={isBurnModal}
                  onClose={() => handleModal(ModalTypes.BURN, false)}
                  onSuccess={onBurnNFTSuccess}
                />
              )}
              {isCancelBidModal && (
                <CancelBidModal
                  order={selectedOrder}
                  item={item}
                  isOpen={isCancelBidModal}
                  onClose={() => handleModal(ModalTypes.CANCEL_BID, false)}
                  onSuccess={onHandleCancelBidSuccess}
                />
              )}
              {isCheckoutConfirmModal && (
                <CheckoutConfirmModal
                  isOpen={isCheckoutConfirmModal}
                  onClose={() => handleModal(ModalTypes.CHECKOUT_CONFIRM, false)}
                  nft={localNFT}
                  txHash={txHash}
                  transactionLink={
                    !!activeChainId && !!txHash ? getExplorerLink(activeChainId, txHash, 'transaction') : '#'
                  }
                  socialLinks={nftSocialLinks}
                />
              )}

              {isCheckoutModal && (
                <CheckoutModal
                  item={item}
                  sellOrder={selectedOrder}
                  onSuccess={onPurchaseSuccess}
                  isOpen={isCheckoutModal}
                  onClose={() => handleModal(ModalTypes.CHECKOUT, false)}
                />
              )}

              {isFixedSaleModal && (
                <FixedSaleModal
                  item={item}
                  isOpen={isFixedSaleModal}
                  onSuccess={handleFixedSale}
                  onClose={() => handleModal(ModalTypes.FIXED_SALE, false)}
                />
              )}
              {isNetworkModal && (
                <NetworkModal
                  isNFTRequest
                  isOpen={isNetworkModal}
                  supposedChainId={itemChainId}
                  onClose={() => setIsNetworkModal(false)}
                />
              )}
              {isSaleTypeModal && (
                <SelectSaleTypeModal
                  isOpen={isSaleTypeModal}
                  onClose={() => handleModal(ModalTypes.SALE_TYPE, false)}
                  onSelectSaleType={(type) => {
                    handleModal(type, true)
                    handleModal(ModalTypes.SALE_TYPE, false)
                  }}
                />
              )}
              {/* <SizeInfoDrawer
                onClose={onSideBarClose}
                isOpen={isDrawer}
                sizes={currentSizes}
                types={nftDrawTypes}
                children={null}
              /> */}
              {/* <TimedAuctionModal
                isOpen={isTimedAuctionModal}
                onClose={() => handleModal(ModalTypes.TIMED_AUCTION, false)}
                currency={selectedCurrency}
                onInputChange={handleSaleInput}
                onSelectChange={handleCurrencySelect}
                tokenList={Object.values(allTokens)}
                onDateChange={handleDateChange}
                handleDateOptionChange={handleDateOptionChange}
                onStartAuction={handleTimedAuction}
                startingDate={startingDate}
                startDateError={dateError.start}
                expDate={expDate}
                endDateError={dateError.end}
              /> */}
              {isTransferModal && (
                <TransferModal
                  account={account}
                  isOpen={isTransferModal}
                  nftName={getItemName(item)}
                  onHandleResolveDomain={handleResolveDomain}
                  onTransfer={handleTransfer}
                  onDismiss={() => handleModal(ModalTypes.TRANSFER, false)}
                />
              )}
              {isVerifyModal && (
                <VerifyOwnerModal
                  account={account}
                  isOpen={isVerifyModal}
                  isConnected={!!account}
                  connectWallet={toggleWalletModal}
                  disconnect={logout}
                  nft={nft}
                  handleFollow={onHandleFollow}
                  onHandleVerify={handleVerifyOwnership}
                  onDismiss={handleVerificationModal}
                />
              )}
            </Flex>
          </Flex>
          {/* <Accordion width="100%" allowToggle zIndex={3} onChange={handleTransferHistoryOpen}>
            <TradingHistoryAccordion
              item={item}
              isLoading={isFetchingTransfers}
              activities={transfers?.activities}
              chainId={itemChainId}
              account={account}
              handleFollow={onHandleFollow}
            />
          </Accordion> */}
          {/* {moreNFTs && moreNFTs.nft.length > 0 && (collections || []).length > 0 && (
            <VStack align="initial" spacing={8} width="100%" zIndex={2}>
              <ChakraHeadingEmoji emoji={'🔥'} text="More works from the creator" textTransform="unset" />
              <ChakraSlider totalCount={moreNFTs.nft?.length} slidesToShow={cardColumnCount - 1} isCollectionCard>
                {moreNFTs.nft.map((nft: NFT, index: number) =>
                  getMatchCollection(collections, nft) ? (
                    <NFTActionCard
                      key={`more-${index}`}
                      account={account}
                      collection={getMatchCollection(collections, nft)}
                      isFullHeight
                      nft={nft}
                      rate={rate}
                      handleLike={(likes, nft, mode) => handleLike(likes, nft, mode)}
                      handleFollow={(user, mode) => onHandleFollow(user, mode)}
                    />
                  ) : null,
                )}
              </ChakraSlider>
            </VStack>
          )} */}
        </VStack>
      </ChakraLayout>
    </Fragment>
  )
}

export default NFTPageTemplate
