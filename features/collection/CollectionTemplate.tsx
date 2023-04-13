import { Box, Flex, HStack, SimpleGrid, SimpleGridProps, Stack, useMediaQuery, VStack } from '@chakra-ui/react'
import {
  currencyFilterOption,
  defaultUserCoverURL,
  formatNumberScale,
  getNextCollectionPageMeta,
  getSortTypeKey,
  ItemFilterDto,
  NextCollection,
  SaleType,
  SelectOption,
  SORT_BY_TYPES,
} from '@nftmall/sdk'
import {
  Attribute,
  Attributes,
  Banner,
  ChakraDivider,
  ChakraLayout,
  CollectionStatsRender,
  FileUploadModal,
  FilterTypes,
  Image,
  LoadingModal,
  Pill,
  PriceFilters,
  StatusFilters,
  StatusFilterTypes,
} from '@nftmall/uikit'
import { NFT, User } from '@prisma/client'
import { ChainId } from '@sushiswap/core-sdk'
import useReportModal from 'app/features/report/useReportModal'
import useGridColumnCount from 'app/hooks/nftmall/useGridColumnCount'
import useModal from 'app/hooks/nftmall/useModal'
import useToast from 'app/hooks/nftmall/useToast'
import { useWindowSize } from 'app/hooks/useWindowSize'
import { useActiveWeb3React } from 'app/services/web3'
import { useWalletModalToggle } from 'app/state/application/hooks'
import { useProfile } from 'app/state/profile/hook'
import { restAPI } from 'app/utils/rest'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import React, { ChangeEvent, FC, Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'

import ItemsByCollection from '../user/ItemsByCollection'
import InfoCard from './InfoCard'

interface CollectionTemplateProps {
  collection: NextCollection
}
interface GridProps extends SimpleGridProps {
  isOpen: boolean
}
// NOTE: avoid for duplicate DOM
function Grid({ isOpen, children }: GridProps) {
  return (
    <SimpleGrid
      columns={{
        base: 1,
        sm: isOpen ? 1 : 2,
        md: isOpen ? 2 : 3,
        lg: isOpen ? 3 : 4,
        xl: isOpen ? 5 : 6,
        xxl: isOpen ? 5 : 6,
        xxxl: isOpen ? 6 : 7,
        el: isOpen ? 8 : 9,
        exl: isOpen ? 11 : 12,
      }}
      spacing={4}
      width="100%"
    >
      {children}
    </SimpleGrid>
  )
}

const CollectionTemplate: FC<CollectionTemplateProps> = ({ collection }) => {
  const { account } = useActiveWeb3React()
  console.warn({ collection })
  const [isLargerThan768, isLarger1920] = useMediaQuery(['(min-width: 768px)', '(min-width: 1920px)'])
  const initialLimit = 12
  // const initialLimit = isLarger1920 ? 12 : isLargerThan768 ? 6 : 3
  const { profile, isLoading } = useProfile()
  const router = useRouter()
  const { toastError, toastSuccess } = useToast()
  const size = useWindowSize()
  const [isMobileForceFilter, setIsMobileForceFilter] = useState(false)
  const [isFilterChanged, setIsFilterChanged] = useState(false)
  const [isOpen, setIsOpen] = useState(true) // FIXME: useState(isLargerThan768 ? true : false)
  // console.log({ isLargerThan768, isLarger1920, isOpen }) // isLargerTahn is initially false!!!
  const [isPriceError, setIsPriceError] = useState(false)
  const [priceOptions, setPriceOptions] = useState<PriceFilters>({
    min: undefined,
    max: undefined,
  })
  const [selectedChains, setSelectedChains] = useState<ChainId[]>([])
  const [statusOptions, setStatusOptions] = useState<StatusFilters>({
    isFixed: false,
    isAuction: false,
    isNew: false,
    hasOffers: false,
  })
  const [selectedCurrency, setSelectedCurrency] = useState<SelectOption>(currencyFilterOption)
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [attributes, setAttributes] = useState<Attributes>({})
  const [selectedAttributes, setSelectedAttributes] = useState<Attribute[]>([])
  const [pills, setPills] = useState<Pill[]>([])
  const [sortByType, setSortByType] = useState<SelectOption>(SORT_BY_TYPES[0])
  const [isCoverUpload, setIsCoverUpload] = useState(false)
  const [loadingTitle, setLoadingTitle] = useState('')
  const [loadingMessage, setLoadingMessage] = useState('')
  const [onPresentLoadingModal, onDismissLoadingModal] = useModal(
    <LoadingModal title={loadingTitle} description={loadingMessage} />
  )
  const toggleWalletModal = useWalletModalToggle()
  const pageMeta = useMemo(() => getNextCollectionPageMeta(collection), [collection])
  const skeletonArray = useMemo(() => {
    return [...Array(initialLimit)].map((_, index) => index)
  }, [initialLimit])
  const cardColumnCount = useGridColumnCount(isOpen)
  const nftSourceSize = useMemo(() => {
    // if (cardColumnCount) {
    //   const scrollbarWidth = isMobile ? 0 : 15
    //   const filterbarWidth = isLargerThan768 ? (isOpen ? 340 : 60) : 0
    //   const gridSpaceWidth = isLargerThan768 ? cardColumnCount * 16 : 0
    //   const nftGroupWidth = ((size.width - scrollbarWidth) * 90) / 100 - gridSpaceWidth - filterbarWidth
    //   return Math.floor(nftGroupWidth / cardColumnCount) - 36
    // }
    return 0
  }, [size.width, cardColumnCount, isLargerThan768, isMobile, isOpen])

  // const currencyConverter = (value: number) => {
  //   const currency = selectedCurrency.value.toString()
  //   if (currency === 'USD') {
  //     return value
  //   } else {
  //     const valueInUSD: BigNumber = BigNumber.from(value).mul(getCurrencyValue(rate, currency))
  //     return valueInUSD.toNumber()
  //   }
  // }

  const filterDto = useMemo(() => {
    const dto: ItemFilterDto = {
      count: initialLimit,
      collectionId: collection.address,
    }
    pills.forEach((pill) => {
      if (pill.type === FilterTypes.STATUS) {
        const type =
          pill.name === StatusFilterTypes.FIXED
            ? SaleType.FIXED_PRICE
            : pill.name === StatusFilterTypes.AUCTION
            ? SaleType.AUCTION_TIMED
            : pill.name === StatusFilterTypes.NEW
            ? SaleType.NOT_FOR_SALE
            : SaleType.AUCTION_UNLIMITED
        dto.salesIn = dto.salesIn ? dto.salesIn + ',' + type : type
      } else if (pill.type === FilterTypes.CHAIN) {
        // param.chainIds.push(pill.chainId)
      } else if (pill.type === FilterTypes.SALE) {
        // param.symbols.push(pill.name)
      } else if (pill.type === FilterTypes.ATTRIBUTE) {
        // param.attrIds.push(pill.traitId)
      } else if (pill.type === FilterTypes.PRICE) {
        if (priceOptions.min > 0) {
          dto.priceFrom = priceOptions.min
        }
        if (priceOptions.max > 0) {
          dto.priceTo = priceOptions.max
        }
      }
    })
    if (sortByType) {
      const key = getSortTypeKey(sortByType.label)
      // dto.orderBy = {
      //   [key]: key === 'price' ? sortByType.value : 'desc',
      // }
      dto.sortBy = 'price'
      dto.sortDir = sortByType.value === 'DSC' ? 'DSC' : 'ASC'
    }
    return dto
  }, [collection?.address, pills, priceOptions?.max, priceOptions?.min, sortByType])

  // const fetchNFTs = useCallback(async (isInitial: boolean) => {
  //   // *NOTE: isInitial is for seperating scrolling down fetch or filter, sort or route change filter
  //   // *NOTE: offset will be updated only scrolling
  //   // const fetchingOffset = isInitial ? 0 : offset
  //   // if (isInitial || (canLoadMore && !loadingScroll)) {
  //   //   const dto: ItemFilterDto = {
  //   //     skip: fetchingOffset,
  //   //     count: initialLimit,
  //   //     collectionId: collection.address,
  //   //   }
  //   //   pills.forEach((pill) => {
  //   //     if (pill.type === FilterTypes.STATUS) {
  //   //       const type =
  //   //         pill.name === StatusFilterTypes.FIXED
  //   //           ? SaleType.FIXED_PRICE
  //   //           : pill.name === StatusFilterTypes.AUCTION
  //   //           ? SaleType.AUCTION_TIMED
  //   //           : pill.name === StatusFilterTypes.NEW
  //   //           ? SaleType.NOT_FOR_SALE
  //   //           : SaleType.AUCTION_UNLIMITED
  //   //       dto.salesIn = dto.salesIn ? dto.salesIn + ',' + type : type
  //   //     } else if (pill.type === FilterTypes.CHAIN) {
  //   //       // param.chainIds.push(pill.chainId)
  //   //     } else if (pill.type === FilterTypes.SALE) {
  //   //       // param.symbols.push(pill.name)
  //   //     } else if (pill.type === FilterTypes.ATTRIBUTE) {
  //   //       // param.attrIds.push(pill.traitId)
  //   //     } else if (pill.type === FilterTypes.PRICE) {
  //   //       if (priceOptions.min > 0) {
  //   //         dto.priceFrom = priceOptions.min
  //   //       }
  //   //       if (priceOptions.max > 0) {
  //   //         dto.priceTo = priceOptions.max
  //   //       }
  //   //     }
  //   //   })
  //   //   if (sortByType) {
  //   //     const key = getSortTypeKey(sortByType.label)
  //   //     // dto.orderBy = {
  //   //     //   [key]: key === 'price' ? sortByType.value : 'desc',
  //   //     // }
  //   //     dto.sortBy = 'price'
  //   //     dto.sortDir = sortByType.value ? 'ASC' : 'DSC'
  //   //   }
  //   //   setLoadingScroll(true)
  //   //   try {
  //   //     const res = await nextApiFetchers.item.filter(dto)
  //   //     // FIXME: use infinite scroll here.
  //   //     // console.log({ res })
  //   //     // setTotalSearchResult(res.total)
  //   //     isInitial ? setAllItems(res) : setAllItems([...items, ...res])
  //   //     // setAllItems([res.result[0]])
  //   //     setIsMobileForceFilter(false)
  //   //     if (res?.length < initialLimit) {
  //   //       setCanLoadMore(false)
  //   //     } else {
  //   //       setOffset(fetchingOffset + initialLimit)
  //   //       setCanLoadMore(true)
  //   //     }
  //   //   } catch (e) {
  //   //     // TODO: send to sentry!
  //   //     console.error('Failed to fetch', e)
  //   //     toastError('Oops', 'Failed to load items. Try again later.')
  //   //   }
  //   //   setLoadingScroll(false)
  //   // }
  // }, [])
  // useEffect(() => {
  //   fetchCollectionStats()
  //   fetchNFTs(true)
  // }, [router.query])
  //* NOTE: update data when filter option, sort option or tab changed on desktop version *//
  //* NOTE: on mobile, fetching data only clear all or done button clicked *//
  // useEffect(() => {
  //   if ((isLargerThan768 && (pills.length > 0 || isFilterChanged)) || isMobileForceFilter) {
  //     fetchNFTs(true)
  //   }
  // }, [pills])
  // useEffect(() => {
  //   if (sortByType) {
  //     fetchNFTs(true)
  //   }
  // }, [sortByType])

  const onHandleNFTLike = useCallback(async (likes: number, nft: NFT, mode: number): Promise<string> => {
    return ''
    // if (!account) {
    //   toggleWalletModal()
    //   return ''
    // } else {
    //   const res = await handleNFTLike(likes, nft, profile.userId, mode, account, provider)
    //   if (res) {
    //     const msg = mode ? `You saved like for '${nft.name}'NFT.` : `You remove like for the '${nft.name}'NFT.`
    //     toastSuccess('Success', msg)
    //   } else {
    //     toastError('Error', res)
    //   }
    //   return res
    // }
  }, [])
  const onHandleFollow = useCallback(async (user: User, mode: number): Promise<string> => {
    return ''
    // if (!account) {
    //   toggleWalletModal()
    //   return ''
    // } else {
    //   const res = await handleUserFollow(user, mode, account, provider)
    //   if (res) {
    //     const msg = mode
    //       ? `You followed '${user.name || user.userId}'.`
    //       : `You unfollowed '${user.name || user.userId}'.`
    //     toastSuccess('Success', msg)
    //   } else {
    //     toastError('Error', res)
    //   }
    //   return res
    // }
  }, [])
  const handleFilterBox = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen])
  const onClearFilterOptions = useCallback(() => {
    const temp_pills = pills.filter((pill) => pill.type === undefined)
    setPills(temp_pills)
    setStatusOptions({
      isFixed: false,
      isAuction: false,
      isNew: false,
      hasOffers: false,
    })
    setSelectedChains([])
    setSelectedTokens([])
    setIsPriceError(false)
    if (!isLargerThan768) {
      setIsMobileForceFilter(true)
    }
  }, [isLargerThan768, pills])

  const handleSortByTypeChange = useCallback((option: SelectOption) => {
    setSortByType(option)
  }, [])
  const handleCurrencyChange = useCallback((option: SelectOption) => {
    setSelectedCurrency(option)
  }, [])
  const handlePriceChange = useCallback(
    (value: number | undefined, type: string) => {
      const temp = { ...priceOptions }
      if (type === 'min') {
        temp.min = value
      } else {
        if (temp.min && value > temp.min) {
          setIsPriceError(false)
        }
        temp.max = value
      }
      setPriceOptions(temp)
    },
    [priceOptions]
  )
  const handleApplyPriceFilter = useCallback(() => {
    const pill_temp = [...pills]
    const isValid = priceOptions.max ? priceOptions.max > priceOptions.min : priceOptions.min || priceOptions.max
    if (isValid) {
      let name = priceOptions.min
        ? selectedCurrency.value + ': ' + priceOptions.min + ' ~ '
        : selectedCurrency.value + ':  ~ '
      if (priceOptions.max) {
        name += priceOptions.max
      }
      const is_exist = pill_temp.find((item) => item.type === FilterTypes.PRICE)
      if (!is_exist) {
        pill_temp.push({
          src: selectedCurrency.img as string,
          name,
          type: FilterTypes.PRICE,
        })
      } else {
        is_exist.name = name
      }
      setPills(pill_temp)
      setIsFilterChanged(pill_temp.length > 0 ? false : true)
    } else {
      setIsPriceError(true)
    }
  }, [pills, priceOptions?.max, priceOptions?.min, selectedCurrency?.img, selectedCurrency?.value])
  const handleSaleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const tokens = [...selectedTokens]
      let pill_temp = [...pills]
      const index = tokens.indexOf(e.target.value)
      if (index > -1) {
        tokens.splice(index, 1)
        pill_temp = pills.filter((item) => !(item.type === FilterTypes.SALE && item.name === e.target.value))
      } else {
        tokens.push(e.target.value)
        pill_temp.push({
          name: e.target.value,
          type: FilterTypes.SALE,
        })
      }
      setSelectedTokens(tokens)
      setPills(pill_temp)
      setIsFilterChanged(pill_temp.length > 0 ? false : true)
    },
    [pills, selectedTokens]
  )
  const handleStatusChange = useCallback(
    (type: StatusFilterTypes, value: boolean) => {
      const options = { ...statusOptions }
      let pill_temp = [...pills]
      switch (type) {
        case StatusFilterTypes.FIXED:
          options.isFixed = !options.isFixed
          break
        case StatusFilterTypes.AUCTION:
          options.isAuction = !options.isAuction
          break
        case StatusFilterTypes.NEW:
          options.isNew = !options.isNew
          break
        case StatusFilterTypes.OFFERS:
          options.hasOffers = !options.hasOffers
          break
      }
      setStatusOptions(options)
      if (value) {
        pill_temp.push({
          name: type,
          type: FilterTypes.STATUS,
        })
      } else {
        pill_temp = pills.filter((item) => !(item.type === FilterTypes.STATUS && item.name === type))
      }
      setPills(pill_temp)
      setIsFilterChanged(pill_temp.length > 0 ? false : true)
    },
    [pills, statusOptions]
  )
  const handleAttributeChange = useCallback(
    (attribute: Attribute) => {
      let temp = [...selectedAttributes]
      let pill_temp = [...pills]
      const is_exist = temp.find((item) => item.trait_type === attribute.trait_type && item.value === attribute.value)
      if (is_exist) {
        temp = temp.filter((item) => !(item.trait_type === attribute.trait_type && item.value === attribute.value))
        pill_temp = pills.filter((item) => !(item.name === attribute.value && item.type === FilterTypes.ATTRIBUTE))
      } else {
        temp.push(attribute)
        pill_temp.push({
          name: attribute.value,
          traitId: attribute.id,
          type: FilterTypes.ATTRIBUTE,
        })
      }
      setSelectedAttributes(temp)
      setPills(pill_temp)
      setIsFilterChanged(pill_temp.length > 0 ? false : true)
    },
    [pills, selectedAttributes]
  )

  const onRemoveFilterOption = useCallback(
    (pill: Pill) => {
      const pill_temp = pills.filter((item) => !(item.type === pill.type && item.name === pill.name))
      setPills(pill_temp)
      switch (pill.type) {
        case FilterTypes.STATUS: {
          handleStatusChange(pill.name as StatusFilterTypes, false)
          break
        }
        case FilterTypes.CHAIN: {
          let temp = [...selectedChains]
          temp = temp.filter((item) => item !== pill.chainId)
          setSelectedChains(temp)
          break
        }
        case FilterTypes.SALE: {
          const temp = [...selectedTokens]
          const index = temp.indexOf(pill.name)
          if (index > -1) {
            temp.splice(index, 1)
          }
          setSelectedTokens(temp)
          break
        }
        case FilterTypes.PRICE: {
          setPriceOptions({ min: undefined, max: undefined })
          setIsPriceError(false)
        }
      }
      if (!isLargerThan768) {
        setIsMobileForceFilter(true)
      }
    },
    [handleStatusChange, isLargerThan768, pills, selectedChains, selectedTokens]
  )
  // NOTE: report modal
  const windowLocationHref = typeof window !== 'undefined' ? window.location.href : '#'

  const onHandleEditClick = useCallback(() => {
    // const editPageLink = `${router.asPath}/edit`.trim()
    // router.push(editPageLink)
  }, [router])

  const onHandleSetRoyalty = useCallback(() => {
    // const editPageLink = `${router.asPath}/edit?royalty`.trim()
    // router.push(editPageLink)
  }, [router])

  useEffect(() => {
    if (loadingTitle && loadingMessage) {
      onPresentLoadingModal()
    }
  }, [loadingTitle, loadingMessage])

  const onInitiateModalState = useCallback(() => {
    onDismissLoadingModal()
    setLoadingTitle('')
    setLoadingMessage('')
  }, [onDismissLoadingModal])

  const handleChange = useCallback(
    async (file: Blob, type: string) => {
      const data = new FormData()
      data.append('file', file)
      data.append('type', type)
      setLoadingTitle(type === 'avatar' ? 'Update avatar' : 'Update cover')
      setLoadingMessage(type === 'avatar' ? 'Sign message to update avatar' : 'Sign message to update cover')
      //TODO: need to update logic
      try {
        const targetName = type === 'avatar' ? 'profile picture' : 'cover picture'
        const cloudinaryMsg = `I would like to update ${targetName}.`
        const signature = '' // await signMessage(library, account, cloudinaryMsg)
        data.append('sig', signature)
        data.append('userId', account.toLowerCase())
        data.append('message', cloudinaryMsg)
        const { user } = await restAPI.updateCloudinaryImage(data)
        if (user) {
          toastSuccess('Your collection has been updated.')
          // dispatch(profileFetchSucceeded({ profile: user }))
        }
        onInitiateModalState()
      } catch (error) {
        console.error(error)
        onInitiateModalState()
        toastError('An error occurred.', error.message)
      }
    },
    [account, onInitiateModalState, toastError, toastSuccess]
  )

  const [onPresentAvatarFileDialog] = useModal(
    <FileUploadModal
      title="Upload avatar"
      description="We recommend an image of at least 400x400. Gifs work too."
      type="avatar"
      handleChange={(file, type) => handleChange(file, type)}
    />
  )
  const [onPresentCoverFileDialog] = useModal(
    <FileUploadModal
      title="Upload cover"
      description="Upload new cover for your collection page. We recommend to upload images in 1440x260 resolution"
      type="cover"
      handleChange={(file, type) => handleChange(file, type)}
    />
  )
  const [onPresentReportModal, onDismissReportModal] = useReportModal()

  const isOwner = false

  // const { items, isLoadingInitialData, isLoadingMore, isEmpty, isReachingEnd, isRefreshing, loadNextPage, reset } =
  //   useCollectionItemsInfiniteScroll({
  //     variables: filterDto,
  //     shouldFetch: !!collection,
  //     swrConfig: {
  //       refreshInterval: 60 * 1000,
  //     },
  //   })

  // console.warn({ itemStats, saleStats })

  return (
    <Fragment>
      <NextSeo {...pageMeta} />
      <Banner from="collection" is_loaded={!isLoading} />
      <ChakraLayout display="flex" position="relative">
        <VStack width="100%" zIndex={1}>
          <Stack spacing={2} width="100%" direction={{ base: 'column-reverse', md: 'row' }}>
            <InfoCard
              isOwner={isOwner}
              collection={collection}
              shareLink={windowLocationHref}
              handleReport={onPresentReportModal}
              handleEditClick={onHandleEditClick}
              handleSetRoyalty={onHandleSetRoyalty}
              handleUpload={onPresentAvatarFileDialog}
              flex={1}
            >
              <HStack width="100%" spacing={{ base: 2, sm: 4 }} alignItems="flex-start">
                <CollectionStatsRender
                  label="Items"
                  value={
                    collection?.statistics?.totalItemSupply === undefined ||
                    collection?.statistics?.totalItemSupply === null
                      ? '-'
                      : Number(collection.statistics.totalItemSupply).toLocaleString()
                  }
                />
                <CollectionStatsRender
                  label="Owners"
                  value={
                    collection?.statistics?.totalOwnerCount === undefined ||
                    collection?.statistics?.totalOwnerCount === null
                      ? '-'
                      : Number(collection.statistics.totalOwnerCount).toLocaleString()
                  }
                />
                <CollectionStatsRender
                  label="Floor Price"
                  value={formatNumberScale(collection.statistics.floorPrice, true)}
                />
                <CollectionStatsRender
                  label="Vol. Traded"
                  value={formatNumberScale(collection.statistics.totalVolume, true)}
                />
                <CollectionStatsRender
                  label="Highest Sale"
                  value={formatNumberScale(collection.statistics.highestSale, true)}
                />
              </HStack>
            </InfoCard>
            <Flex
              position="relative"
              flex={2}
              minHeight={48}
              // onMouseEnter={() => setIsCoverUpload(true)}
              // onMouseLeave={() => setIsCoverUpload(false)}
            >
              <Box
                background="rgba(0, 0, 0, 0.2)"
                backgroundImage={
                  defaultUserCoverURL
                  // collection?.meta?.cover
                  //   ? `url(${uriToHttps(collection.meta.cover)})`
                  //   : `url(${defaultUserCoverURL})`
                }
                backgroundSize="cover"
                backgroundPosition="center center"
                borderRadius="lg"
                overflow="hidden" // to make edges round
                position="absolute"
                width="100%"
                height="100%"
              >
                {collection?.meta?.cover && (
                  <Image src={collection?.meta?.cover} layout="fill" objectFit="cover" objectPosition="center" />
                )}
              </Box>
              {/* {isCoverUpload && isOwner && (
                <UploadButton
                  aria-label="upload cover"
                  position="absolute"
                  top="95%"
                  left="90%"
                  transform="translate(-95%, -90%)"
                  onClick={onPresentCoverFileDialog}
                />
              )} */}
            </Flex>
          </Stack>
          <VStack
            width="100%"
            align="initial"
            spacing={{ base: 12, lg: 24 }}
            marginBottom={12}
            pt={{ base: 4, md: 16, default: 24 }}
            zIndex={1}
          >
            <Flex align="baseline" width="100%">
              {/* <ChakraFilter
                attributes={attributes}
                chainOptions={null}
                currencies={defaultCurrentyFilterOptions}
                isOpen={isOpen}
                isPriceError={isPriceError}
                pillsCount={pills.length}
                priceOptions={priceOptions}
                selectedAttributes={selectedAttributes}
                selectedChains={null}
                statusOptions={statusOptions}
                selectedCurrency={selectedCurrency}
                selectedTokens={selectedTokens}
                handleAttributeChange={handleAttributeChange}
                handleChainChange={() => null}
                handleFilterBox={handleFilterBox}
                handleCurrencyChange={handleCurrencyChange}
                handlePriceChange={handlePriceChange}
                handleApplyPriceFilter={handleApplyPriceFilter}
                handleStatusChange={handleStatusChange}
                handleSaleChange={handleSaleChange}
                collectionOptions={null}
                selectedCollections={null}
                handleCollectionChange={() => null}
                handleApplyAll={() => 0}
                handleClearAll={onClearFilterOptions}
              /> */}
              <VStack align="initial" spacing={4} ml={{ base: 0, md: 4 }} width="100%">
                {/* {pills.length > 0 && (
                  <ChakraFilterPills
                    pills={pills}
                    onClearFilterOptions={onClearFilterOptions}
                    onRemoveFilterOption={onRemoveFilterOption}
                  />
                )}
                <Flex justify="space-between" align="center" width="100%">
                  <ChakraText ml={2}>{totalSearchResult} items</ChakraText>
                  <Box width={72} zIndex={2}>
                    <ChakraSelect
                      placeholder="Sort by"
                      options={SORT_BY_TYPES}
                      value={sortByType}
                      onChange={handleSortByTypeChange}
                    />
                  </Box>
                </Flex> */}
                <ChakraDivider />
                <ItemsByCollection unionId={collection.id} isInFullWidth={true} isSearch={false} />
                {/* {items?.length > 0 && (
                  <ChakraInfiniteScroll
                    onBottomHit={loadNextPage}
                    isLoading={isLoadingMore || isLoadingInitialData}
                    hasMoreData={!isReachingEnd}
                    loadOnMount={false}
                  >
                    <VStack spacing={12} py={4}>
                      <Grid isOpen={isOpen}>
                        {items.map((item) => (
                          <NFTActionCard
                            key={item.id}
                            itemId={item.id}
                            fallbackItem={item}
                            fallbackNextCollection={collection}
                            cardSize={nftSourceSize}
                            handleLike={(likes, nft, mode) => onHandleNFTLike(likes, nft, mode)}
                            handleFollow={(user, mode) => onHandleFollow(user, mode)}
                          />
                        ))}
                        {(isLoadingMore || isLoadingInitialData) &&
                          skeletonArray.map((index) => <NFTActionCardSkeleton key={`skeleton-${index}`} />)}
                      </Grid>
                    </VStack>
                  </ChakraInfiniteScroll>
                )}
                {!(isLoadingMore || isLoadingInitialData) && items?.length <= 0 && (
                  <ChakraHeading textAlign="center" py={{ base: 4, md: 16 }}>
                    No items to display
                  </ChakraHeading>
                )} */}
              </VStack>
            </Flex>
          </VStack>
        </VStack>
      </ChakraLayout>
    </Fragment>
  )
}

export default CollectionTemplate
