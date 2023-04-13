import { Box, HStack, LinkBox, useColorModeValue, VStack } from '@chakra-ui/react'
import {
  abbreviateNumber,
  getItemContent,
  getItemMeta,
  getItemName,
  getItemURIFromUnionId,
  getNextCollectionName,
  isERC1155Collection,
  parseUnionId,
  unionAssetToCurrency,
} from '@nftmall/sdk'
import {
  ChainIcon,
  ChakraText,
  Image,
  NextChakraLink,
  NFTActionCardProps,
  ProductPrice,
  SquareContainer,
  theme,
  UnavailableContent,
  useContainerDimensions,
  useHover,
} from '@nftmall/uikit'
import { useNextCollection } from 'app/services/our-api/hooks'
import { useItem } from 'app/services/union-api/hooks'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CountdownTimeDelta } from 'react-countdown'

export const NFTActionCard: FC<NFTActionCardProps> = ({
  itemId,
  fallbackItem,
  fallbackNextCollection,
  cardSize,
  isFullHeight,
  isSecond = true,
  handleLike,
  handleFollow,
  ...rest
}) => {
  const parsedItemId = useMemo(() => (itemId ? parseUnionId(itemId) : undefined), [itemId])
  const {
    data: item,
    isLoading: isItemLoading,
    error: itemLoadError,
  } = useItem({
    variables: { itemId },
    shouldFetch: !!itemId,
    swrConfig: {
      refreshInterval: 2 * 60 * 1000,
      fallbackData: fallbackItem,
    },
  })
  const {
    data: collection,
    isLoading: isCollectionLoading,
    error: collectionLoadError,
  } = useNextCollection({
    variables: { collectionId: parsedItemId?.unionCollectionId },
    shouldFetch: !!parsedItemId?.unionCollectionId,
    swrConfig: {
      refreshInterval: 120 * 1000,
      fallbackData: fallbackNextCollection,
    },
  })
  const isBackBorder = isERC1155Collection(collection)
  const itemMeta = getItemMeta(item)
  const { imageContent: itemImage, videoContent: itemVideo } = getItemContent(item)

  let videoLoaded: Promise<any>
  const borderColor = useColorModeValue(theme.colors.light.thirdStroke, theme.colors.dark.secondaryStroke)
  const bgColor = useColorModeValue(theme.colors.light.fifthBg, theme.colors.dark.fifthBg)
  const secondBgColor = useColorModeValue(theme.colors.light.sixthBg, theme.colors.dark.sixthBg)
  const boxRef = useRef<HTMLDivElement>(null)
  // const dimensions = useDimensions(boxRef)
  // const size = dimensions?.borderBox?.width || 800

  const isHover = useHover(boxRef)
  const [auctionTime, setAuctionTime] = useState(0)
  const [isStartingLater, setIsStartingLater] = useState(false)
  const [isLiveAuction, setIsLiveAuction] = useState(false)
  const [liked, setLiked] = useState(false)
  const [isIntersecting, setIntersecting] = useState(false)
  const [isTimedOrder, setIsTimedOrder] = useState(false)
  const [isOrderCountdown, setIsOrderCountdown] = useState(false)
  const [timedOrderTime, setTimedOrderTime] = useState(0)
  const { width: containerWidth } = useContainerDimensions(boxRef)
  // console.log({ containerWidth })

  // NOTE: Here https://github.com/NFTmall/NFTmall/issues/1056
  // const { data: activeSellOrder } = useActiveSellOrderByItem(item.id)
  const activeSellOrder = item?.bestSellOrder
  const sellOrderCurrency = useMemo(() => {
    if (activeSellOrder?.take && parsedItemId?.chainId) {
      return unionAssetToCurrency(activeSellOrder.take, parsedItemId?.chainId)
    }
    return null
  }, [activeSellOrder, parsedItemId?.chainId])
  // const nftUrl = useMemo(() => {
  //   return item.width > 400 ? getCloudinaryUrlByNFTWH(item, 400) : getViewableNFTURL(item)
  // }, [item])

  const activeAuction = useMemo(() => {
    return undefined
    // if (nft.auctions && nft.auctions.length > 0) {
    //   const auction = nft.auctions[0]
    //   if (auction.type === SaleType.AUCTION_TIMED) {
    //     // FIXME: #981
    //     const price = getBalanceAmount(BigNumber.from(auction.minPrice))
    //     const currency: string = getCurrencySymbol(auction.currencyId, auction.chainId)
    //     const currencyValue = getCurrencyValue(rate, currency)
    //     const inUSD = price.mul(currencyValue).toFixed(1)
    //     const startTime: number = moment.utc(auction.startDate).toDate().getTime()
    //     const endTime: number = moment.utc(auction.endDate).toDate().getTime()
    //     setIsLiveAuction(endTime > new Date().getTime())
    //     if (startTime > new Date().getTime()) {
    //       setIsStartingLater(true)
    //       setAuctionTime(startTime)
    //     } else {
    //       setAuctionTime(endTime)
    //     }
    //     return {
    //       ...auction,
    //       priceInToken: price.toString(),
    //       currency,
    //       priceInUSD: Number(inUSD),
    //       endTime,
    //       startTime,
    //     }
    //   } else {
    //     return auction
    //   }
    // }
    // return null
  }, [])

  const highestBid = useMemo(() => {
    // if (nft.orders && nft.orders.length > 0) {
    //   const bidders = nft.orders
    //     .filter((order: Order) => !order.sellOrder)
    //     .sort((a: { chainId: number; make: Asset }, b: { chainId: number; make: Asset }) => {
    //       // FIXME: code has been commented out temporarily
    //       // const currencyA = getCurrency(a.make, a.chainId)
    //       // const currencyB = getCurrency(b.make, b.chainId)
    //       // if (currencyA === currencyB) {
    //       //   return BigNumber.from(b.make.value).sub(BigNumber.from(a.make.value))
    //       // } else {
    //       //   const valueAInUSD: BigNumber = BigNumber.from(a.make.value).mul(getCurrencyValue(rate, currencyA))
    //       //   const valueBInUSD: BigNumber = BigNumber.from(b.make.value).mul(getCurrencyValue(rate, currencyB))
    //       //   return valueBInUSD.sub(valueAInUSD)
    //       // }
    //     })
    //   if (bidders.length > 0) {
    //     const price = getBalanceAmount(BigNumber.from(bidders[0].make.value))
    //     const currency = getCurrencySymbol(bidders[0].make, bidders[0].chainId)
    //     const currencyValue = getCurrencyValue(rate, currency)
    //     const inUSD = price.mul(currencyValue).toFixed(1)
    //     return {
    //       priceInToken: price.toString(),
    //       currency,
    //       priceInUSD: inUSD === '0.0' ? 0 : Number(inUSD),
    //     }
    //   }
    // }
    return null
  }, [])

  const onHandleInterval = (interval: CountdownTimeDelta) => {
    // if (interval.total < 1100) {
    //   if (isStartingLater) {
    //     if (activeAuction.endTime > new Date().getTime()) {
    //       setAuctionTime(activeAuction.endTime)
    //       setIsStartingLater(false)
    //     }
    //   } else if (isTimedOrder) {
    //     setIsOrderCountdown(false)
    //   } else {
    //     setIsLiveAuction(false)
    //   }
    // }
  }

  const onHeart = useCallback(async () => {
    // const prevCount: number = localNFT.likesCount
    // let sig, nextCount
    // // step 1. wait until signature
    // if (liked) {
    //   nextCount = prevCount > 0 ? prevCount - 1 : 0
    //   sig = await handleLike(nextCount, localNFT, 0)
    // } else {
    //   nextCount = prevCount + 1
    //   sig = await handleLike(nextCount, localNFT, 1)
    // }
    // // step 2. update local nft state
    // if (sig) {
    //   setLocalNFT({ ...localNFT, likesCount: nextCount })
    //   // step 3. toggle heart
    //   setLiked(!liked)
    // }
    // otherwise do nothing
  }, [handleLike, liked, item])

  const domId = `actioncard-${item.tokenId}`

  // const isInViewport = useCallback(() => {
  //   const element = document.getElementById(domId)
  //   if (element) {
  //     const rect = element.getBoundingClientRect()
  //     const isInView =
  //       rect.top >= 0 &&
  //       rect.left >= 0 &&
  //       rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
  //       rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  //     setIntersecting(isInView)
  //   }
  // }, [domId])

  // const playVid = useCallback(() => {
  //   const element = document.getElementById(domId) as HTMLVideoElement
  //   if (element) {
  //     videoLoaded = element.play()
  //   }
  // }, [domId])

  // const pauseVid = useCallback(() => {
  //   const element = document.getElementById(domId) as HTMLVideoElement
  //   if (element) {
  //     videoLoaded &&
  //       videoLoaded.then(() => {
  //         element.pause()
  //       })
  //   }
  // }, [domId, videoLoaded])

  // const onLoad = useCallback(() => {
  //   isInViewport()
  // }, [isInViewport])

  useEffect(() => {
    // if (nft?.likedBy?.length > 0 && account) {
    //   const isLiked = nft.likedBy.find((item: any) =>
    //     item.User ? item.User.userId === account.toLowerCase() : item.userId === account.toLowerCase()
    //   )
    //   setLiked(isLiked)
    // }
  }, [])

  // useEffect(() => {
  //   if (itemVideo) {
  //     window.addEventListener('scroll', isInViewport)
  //     window.addEventListener('resize', isInViewport)
  //   }
  //   return () => {
  //     if (itemVideo) {
  //       window.removeEventListener('scroll', isInViewport)
  //       window.removeEventListener('resize', isInViewport)
  //     }
  //   }
  // }, [isInViewport])

  // useEffect(() => {
  //   if (isIntersecting) {
  //     playVid()
  //   } else {
  //     pauseVid()
  //   }
  // }, [isIntersecting, pauseVid, playVid])

  useEffect(() => {
    // if (activeOrder) {
    //   const isTimedOrder = activeOrder.originalOrderData.start > 0
    //   setIsTimedOrder(isTimedOrder)
    //   if (isTimedOrder) {
    //     setIsOrderCountdown(activeOrder.originalOrderData.start > moment().unix())
    //     setTimedOrderTime(activeOrder.originalOrderData.start * 1000)
    //   }
    // }
  }, [activeSellOrder])

  const [isContentError, setContentError] = useState<Error>()

  const onContentError = useCallback((e) => {
    setContentError(e)
  }, [])

  return (
    <LinkBox
      ref={boxRef}
      borderWidth="2px"
      borderRadius="8px"
      borderColor={borderColor}
      background={bgColor}
      height={isFullHeight ? 'calc(100% - 4px)' : 'auto'}
      position="relative"
      zIndex={1}
      className={isSecond ? 'card-item second-card' : 'card-item'}
      borderBottomWidth={isBackBorder ? '0 !important' : '2px'}
    >
      {isBackBorder && (
        <>
          <Box className="card-item--back-border"></Box>
          <Box className="card-item--back-border second"></Box>
        </>
      )}
      {
        !isSecond && null
        // <Box className="card-item--sub-header-wrapper">
        //   <Box className="card-item--sub-header-empty">
        //     <Flex gridColumnGap={2} position="absolute" left={6} bottom={0} width="100%">
        //       {nft.creator && <NFTUserCard account={account} user={nft.creator as User} handleFollow={handleFollow} />}
        //       {nft.owner && <NFTUserCard account={account} user={nft.owner as User} handleFollow={handleFollow} />}
        //     </Flex>
        //   </Box>
        //   <Box className="card-item--sub-header-crossed">
        //     <img
        //       className="card-item--sub-header-crossed-non-hover"
        //       src="data:image/svg+xml,%3Csvg width='60' height='56' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 1 Q 5 1 8.9 5 L 51.1 51 Q 55 55 60 55' stroke='%2347358B' fill='transparent' stroke-width='2' vector-effect='non-scaling-stroke' /%3E%3C/svg%3E"
        //     />
        //     <img
        //       className="card-item--sub-header-crossed-hover"
        //       src="data:image/svg+xml,%3Csvg width='60' height='56' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 1 Q 5 1 8.9 5 L 51.1 51 Q 55 55 60 55' stroke='%233FA4FA' fill='transparent' stroke-width='2' vector-effect='non-scaling-stroke' /%3E%3C/svg%3E"
        //     />
        //   </Box>
        //   <Box className="card-item--sub-header-content">
        //     <LikeButton liked={liked} likes={item.likesCount || 0} onClick={onHeart} />
        //   </Box>
        // </Box>
      }
      <Box
        className="card-item--main-wrapper"
        marginTop={isBackBorder ? '0 !important' : '-2px'}
        background={isBackBorder ? `${secondBgColor} !important` : 'transparent'}
        borderTopWidth={isBackBorder ? '0 !important' : '2px'}
      >
        <NextChakraLink
          href={getItemURIFromUnionId(item?.id)}
          data-cy={rest['data-cy']}
          display="block"
          height="100%"
          borderRadius="8px"
        >
          <VStack align="initial" textAlign="left" width="100%">
            {/* marginLeft={isSecond ? '-16px' : 0} marginTop={isSecond ? '-16px' : 0} */}
            <SquareContainer borderRadius="md" overflow="hidden">
              {itemVideo ? (
                isContentError ? (
                  <UnavailableContent fileType="Video" />
                ) : (
                  <video
                    id={domId}
                    src={itemVideo.url ? itemVideo.url.replace('/ipfs.io/', '/opensea.mypinata.cloud/') : undefined}
                    loop
                    muted
                    playsInline
                    // className={isSecond ? 'border-top-radius-md' : 'border-radius-md'}
                    style={{
                      width: Math.max(cardSize || containerWidth || 600, 400),
                      height: Math.max(cardSize || containerWidth || 600, 400),
                      maxWidth: 'initial',
                      objectFit: 'cover',
                    }}
                    // onLoadedData={onLoad}
                    onError={onContentError}
                  />
                )
              ) : itemImage ? (
                isContentError ? (
                  <UnavailableContent fileType="Image" />
                ) : (
                  <Image
                    src={itemImage.url}
                    // https://stackoverflow.com/questions/65169431/how-to-set-the-next-image-component-to-100-height
                    objectFit="cover"
                    width={Math.max(cardSize || containerWidth || 600, 400)}
                    height={Math.max(cardSize || containerWidth || 600, 400)}
                    onError={onContentError}
                  />
                )
              ) : (
                // TODO: #1012
                <UnavailableContent item={item} collection={collection} />
              )}
            </SquareContainer>
            <VStack
              px={4}
              align="initial"
              justify="space-between"
              pb={(activeAuction && isLiveAuction) || isTimedOrder ? 8 : 0}
              spacing={1}
              width="100%"
            >
              {collection && (
                <HStack alignItems={'center'} spacing={2}>
                  <ChakraText fontSize="sm" type="main" fontWeight="semibold" noOfLines={1}>
                    {getNextCollectionName(collection)}
                  </ChakraText>
                  <ChainIcon chainId={parsedItemId.chainId} size={18} />
                </HStack>
              )}
              <ChakraText fontSize="sm" fontWeight="bold" noOfLines={1} wordBreak="break-all">
                {getItemName(item)}
              </ChakraText>
              <VStack align="initial" spacing={4} width="100%">
                {(activeSellOrder || activeAuction || highestBid) && (
                  <HStack alignItems="start" spacing={4} width="100%">
                    {activeSellOrder && (
                      <ProductPrice
                        tokenPrice={activeSellOrder.makePrice}
                        currencySymbol={sellOrderCurrency.symbol}
                        usdPrice={activeSellOrder.makePriceUsd}
                        isCard
                        // title="price"
                        data-cy="text-price"
                      />
                    )}
                    {activeAuction && /*saleType === SaleType.AUCTION_TIMED &&*/ isLiveAuction && (
                      <ProductPrice
                        tokenPrice={activeAuction.priceInToken}
                        currencySymbol={activeAuction.currency}
                        usdPrice={abbreviateNumber(activeAuction.priceInUSD)}
                        title="Minimum bid"
                        isCard
                      />
                    )}
                    {highestBid && (
                      <ProductPrice
                        tokenPrice={highestBid.priceInToken}
                        currencySymbol={highestBid.currency}
                        usdPrice={abbreviateNumber(highestBid.priceInUSD)}
                        title="Highest bid"
                        isCard
                      />
                    )}
                  </HStack>
                )}
                {/* {!activeOrder &&
                  (!activeAuction ? (
                    <ChakraText fontSize="lg" fontWeight="bold" noOfLines={2} type="secondary">
                      Open for Bids
                    </ChakraText>
                  ) : saleType === SaleType.AUCTION_UNLIMITED ? (
                    <ChakraText fontSize="lg" fontWeight="bold" noOfLines={2} type="secondary">
                      Open for bids
                    </ChakraText>
                  ) : null)} */}
              </VStack>
            </VStack>
          </VStack>
        </NextChakraLink>
      </Box>
      {/* {((activeAuction && isLiveAuction) || (isTimedOrder && isOrderCountdown)) && (
        <ChakraCountdown
          date={isOrderCountdown ? timedOrderTime : auctionTime}
          isActive={isHover}
          isStartingLater={isOrderCountdown ? true : isStartingLater}
          prefix={isOrderCountdown ? 'Dropping in' : undefined}
          onHandleInterval={onHandleInterval}
          position="absolute"
          bottom={0}
          left={0}
          isCard
        />
      )} */}
      {/* {isTimedOrder && !isOrderCountdown && (
        <CardSelectButton
          aria-label="sale started"
          size="md"
          className={isHover ? 'card-outline--gradient mask time' : 'card-outline--gradient'}
          isActive={isHover}
          background={isHover ? 'transparent' : bgColor}
          borderColor={isHover ? 'transparent' : borderColor}
          borderWidth={0}
          borderTopWidth={2}
          position="absolute"
          bottom={0}
          left={0}
          _focus={{ boxShadow: 'none', textShadow: 'none' }}
          _hover={{ boxShadow: 'none', textShadow: 'none' }}
        >
          <ChakraText fontSize="md" fontWeight="bold">
            Buy Now
          </ChakraText>
        </CardSelectButton>
      )} */}
    </LinkBox>
  )
}
