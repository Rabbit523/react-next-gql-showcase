import { Box, ContainerProps, Flex, useMediaQuery, VStack } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import {
  currencyFilterOption,
  defaultCurrentyFilterOptions,
  defaultMetaData,
  defaultSearchTabs,
  getCurrencyValue,
  getSortTypeKey,
  NETWORK_ICON,
  NETWORK_LABEL,
  NFTFilterDto,
  NFTFilterRes,
  SaleType,
  SelectOption,
  SORT_BY_TYPES,
  TabData,
  UserFilterDto,
} from '@nftmall/sdk'
import {
  Attribute,
  Attributes,
  Banner,
  BannerProps,
  ChakraFilter,
  ChakraFilterPills,
  ChakraFilterPillsProps,
  ChakraFilterProps,
  ChakraLayout,
  ChakraSelect,
  ChakraSelectProps,
  ChakraText,
  DataTabProps,
  FilterTypes,
  Pill,
  PriceFilters,
  StatusFilters,
  StatusFilterTypes,
} from '@nftmall/uikit'
import { AccountType, NFT, User } from '@prisma/client'
import { ChainId } from '@sushiswap/core-sdk'
import { handleNFTLike, handleUserFollow } from 'app/hooks/nftmall/useSignMessage'
import useToast from 'app/hooks/nftmall/useToast'
import { useCurrencyExchangeRate } from 'app/hooks/nftmall/useTokenBalances'
import { useActiveWeb3React } from 'app/services/web3'
import { useWalletModalToggle } from 'app/state/application/hooks'
import { useProfile } from 'app/state/profile/hook'
import { apolloAPI } from 'app/utils/apollo'
import { NODE_ENV } from 'app/utils/constants'
import { restAPI } from 'app/utils/rest'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import React, { ChangeEvent, FC, Fragment, memo, useCallback, useEffect, useState } from 'react'

const Search: FC = () => {
  const { account } = useActiveWeb3React()
  const { data: rate, isLoading: isLoadingRate } = useCurrencyExchangeRate()
  const [isLargerThan768, isLarger1920] = useMediaQuery(['(min-width: 768px)', '(min-width: 1920px)'])
  const initialLimit = isLarger1920 ? 12 : isLargerThan768 ? 12 : 6
  const { profile } = useProfile()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [tabIndex, setTabIndex] = useState(0)
  const [tabData, setTabData] = useState<TabData[]>(defaultSearchTabs)
  const [totalSearchResult, setTotalSearchResult] = useState(0)
  const [sortByType, setSortByType] = useState<SelectOption>()
  const [isOpen, setIsOpen] = useState(true)
  const [isPriceError, setIsPriceError] = useState(false)
  const [pills, setPills] = useState<Pill[]>([])
  const [statusOptions, setStatusOptions] = useState<StatusFilters>({
    isFixed: false,
    isAuction: false,
    isNew: false,
    hasOffers: false,
  })
  const [selectedCurrency, setSelectedCurrency] = useState<SelectOption>(currencyFilterOption)
  const [priceOptions, setPriceOptions] = useState<PriceFilters>({
    min: 0,
    max: 0,
  })
  const [isPriceFilterApplied, setIsPriceFilterApplied] = useState(false)
  const [selectedChains, setSelectedChains] = useState<ChainId[]>([])
  const [collectionOptions, setCollectionOptions] = useState<User[]>([])
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [offsets, setOffsets] = useState([])
  const [canLoadMore, setCanLoadMore] = useState([])
  const [attributes, setAttributes] = useState<Attributes>({})
  const [selectedAttributes, setSelectedAttributes] = useState<Attribute[]>([])
  const { toastError, toastSuccess } = useToast()
  const toggleWalletModal = useWalletModalToggle()
  const chainOptions =
    NODE_ENV === 'development'
      ? [ChainId.RINKEBY, ChainId.BSC_TESTNET, ChainId.MATIC_TESTNET, ChainId.AVALANCHE_TESTNET]
      : [ChainId.ETHEREUM, ChainId.BSC, ChainId.MATIC, ChainId.AVALANCHE]
  //* NOTE: fetch collections once when component mounted *//
  const fetchCollectionData = async () => {
    try {
      const collections: User[] = await apolloAPI.fetchAllCollections()
      setCollectionOptions(collections)
    } catch (e) {
      console.error(e)
    }
  }
  // const fetchAttributes = async () => {
  //   try {
  //     const res: NFTFilterRes = await restAPI.filterNFTs({ offset: 0, limit: 1 })
  //     if (res.attributes && res.attributes.length > 0) {
  //       const obj = res.attributes.reduce(function (r, e) {
  //         if (!r[e.trait_type]) r[e.trait_type] = [e]
  //         else
  //           r[e.trait_type] = Array.isArray(r[e.trait_type]) ? r[e.trait_type].concat(e) : [r[e.trait_type]].concat(e)
  //         return r
  //       }, {})
  //       setAttributes(obj)
  //     }
  //   } catch (e) {
  //     console.error(e)
  //   }
  // }
  useEffect(() => {
    // fetchAttributes()
    fetchCollectionData()
  }, [])

  //* NOTE: covert status filter type to query string, query string to status filter type
  const matchingStatusTypes = (name: string): string => {
    switch (name) {
      case StatusFilterTypes.FIXED:
        return SaleType.FIXED_PRICE
      case StatusFilterTypes.AUCTION:
        return SaleType.AUCTION_TIMED
      case StatusFilterTypes.OFFERS:
        return SaleType.AUCTION_UNLIMITED
      case StatusFilterTypes.NEW:
        return SaleType.NOT_FOR_SALE
      case SaleType.FIXED_PRICE:
        return StatusFilterTypes.FIXED
      case SaleType.AUCTION_TIMED:
        return StatusFilterTypes.AUCTION
      case SaleType.AUCTION_UNLIMITED:
        return StatusFilterTypes.OFFERS
      case SaleType.NOT_FOR_SALE:
        return StatusFilterTypes.NEW
      case 'isFixed':
        return SaleType.FIXED_PRICE
      case 'isAuction':
        return SaleType.AUCTION_TIMED
      case 'hasOffers':
        return SaleType.AUCTION_UNLIMITED
      case 'isNew':
        return SaleType.NOT_FOR_SALE
    }
  }
  const currencyConverter = (value: number) => {
    const currency = selectedCurrency.value.toString()
    if (currency === 'USD') {
      return value
    } else {
      const valueInUSD: BigNumber = BigNumber.from(value).mul(getCurrencyValue(rate, currency))
      return valueInUSD.toNumber()
    }
  }
  //* NOTE: return attribute which has same id from the route query
  const findAttribute = (type: string): Attribute => {
    let targetAttribute: Attribute
    Object.values(attributes).forEach((attrArray) => {
      attrArray.forEach((attr) => {
        if (attr.trait_type === type) {
          targetAttribute = attr
        }
      })
    })
    return targetAttribute
  }
  const mergeQueries = (target: any, obj: any, key: string) => {
    Object.keys(obj).forEach((_key) => {
      if (_key in target) {
        if (Array.isArray(target[_key])) {
          if (!target[_key].includes(obj[_key])) {
            target[_key].push(obj[_key])
          }
        } else {
          if (obj[_key] !== target[_key]) {
            const prev = target[key]
            delete target[_key]
            target[_key] = [obj[_key], prev]
          }
        }
      } else {
        target[_key] = obj[_key]
      }
    })
    return target
  }
  const manageQueries = (value: string, type: string) => {
    const query = { ...router.query }
    const newQuery = { ...router.query }
    delete newQuery[type]
    const queryKeys = Object.keys(query)
    if (queryKeys.includes(type)) {
      //NOTE: if query has already requested filter type, and then if value is exist => remove or not add.
      let queryValue = query[type]
      if (Array.isArray(queryValue)) {
        if (!queryValue.includes(value)) {
          newQuery[type] = [...queryValue, value]
        } else {
          queryValue = queryValue.filter((e) => e !== value)
          if (Array.isArray(queryValue) && queryValue.length < 2) {
            queryValue = queryValue.toString()
          }
          newQuery[type] = queryValue
        }
      } else {
        if (queryValue !== value) {
          if (type === FilterTypes.SORTBY) {
            newQuery[type] = value
          } else {
            newQuery[type] = [queryValue, value]
          }
        }
      }
    } else {
      // NOTE: query hasn't got requested filter type, then just add.
      newQuery[type] = value
    }
    return newQuery
  }
  //* NOTE: run query with adding queries if it's not existed else remove
  const runQueryBuilder = (value: string, type: string) => {
    const query = manageQueries(value, type)
    router.push({ pathname: '/search', query }, undefined, {
      shallow: true,
    })
  }
  //* NOTE: run query for price filter change
  const runMultiQueryBuilder = (isAdding = true) => {
    const query = { ...router.query }
    if (isAdding) {
      // NOTE: if there is no symbol in router query, then add, if not change.
      query['symbol'] = String(selectedCurrency.value)
      // NOTE: change or add to router query if state has value.
      if (priceOptions.min) {
        query['min'] = String(priceOptions.min)
      }
      if (priceOptions.max) {
        query['max'] = String(priceOptions.max)
      }
    } else {
      delete query['symbol']
      delete query['min']
      delete query['max']
    }
    router.push({ pathname: '/search', query }, undefined, {
      shallow: true,
    })
  }
  //* NOTE: add pill if it's not existed
  const handlePillArray = (
    type: FilterTypes,
    name: string,
    _pills: Pill[],
    chainId = ChainId.BSC,
    traitId = undefined,
    trait_type = undefined
  ): Pill[] => {
    const result = _pills.find((pill) => pill.type === type && pill.name === name)
    if (!result) {
      const collection = collectionOptions.find((item) => item.name === name)
      _pills.push({
        chainId,
        name,
        type,
        address: collection?.address,
        src:
          type === FilterTypes.COLLECTION || type === FilterTypes.CHAIN
            ? collection?.avatar || NETWORK_ICON[chainId]
            : undefined,
        traitId,
        trait_type,
      })
    }
    return _pills
  }
  //* NOTE: update pills from the router query when collectionOptions are set and router changes
  const fetchDataMiddleware = useCallback(() => {
    const queryKeys = Object.keys(router.query)
    setOffsets([])
    setIsPriceError(false)
    //* NOTE: fetch data directly when there is no filter option selected from the route query
    let temp_pills = [...pills]
    //* NOTE: remove pill which is not existed in router query *//
    temp_pills.forEach((pill) => {
      if (!queryKeys.includes(pill.type)) {
        temp_pills = temp_pills.filter((item) => !(item.type === pill.type))
      } else {
        const queryValue = router.query[pill.type]
        if (Array.isArray(queryValue)) {
          if (!queryValue.includes(matchingStatusTypes(pill.name))) {
            temp_pills = temp_pills.filter((item) => item.name !== matchingStatusTypes(pill.name))
          }
        } else {
          const name = pill.type === FilterTypes.STATUS ? matchingStatusTypes(pill.name) : pill.name
          if (queryValue !== name) {
            temp_pills = temp_pills.filter((item) => !(item.name === pill.name && item.type === pill.type))
          }
        }
      }
    })
    //* NOTE: add filter options from router query to pills *//
    Object.keys(router.query).forEach((key) => {
      const queryValue = router.query[key]
      if (key === FilterTypes.NAME) {
        temp_pills = handlePillArray(FilterTypes.NAME, queryValue as string, temp_pills)
      } else if (key === FilterTypes.STATUS) {
        let options = { ...statusOptions }
        if (Array.isArray(queryValue)) {
          queryValue.forEach((item) => {
            temp_pills = handlePillArray(FilterTypes.STATUS, matchingStatusTypes(item), temp_pills)
            options = statusChangeSwitch(options, matchingStatusTypes(item) as StatusFilterTypes, true)
          })
        } else {
          temp_pills = handlePillArray(FilterTypes.STATUS, matchingStatusTypes(queryValue), temp_pills)
          options = statusChangeSwitch(options, matchingStatusTypes(queryValue) as StatusFilterTypes, true)
        }
        setStatusOptions(options)
      } else if (key === FilterTypes.COLLECTION) {
        let options = [...selectedCollections]
        if (Array.isArray(queryValue)) {
          queryValue.forEach((item) => {
            temp_pills = handlePillArray(FilterTypes.COLLECTION, item, temp_pills)
            options = updateCollectionOptions(options, item, true)
          })
        } else {
          temp_pills = handlePillArray(FilterTypes.COLLECTION, queryValue, temp_pills)
          options = updateCollectionOptions(options, queryValue, true)
        }
        setSelectedCollections(options)
      } else if (key === FilterTypes.CHAIN) {
        let chains = [...selectedChains]
        if (Array.isArray(queryValue)) {
          queryValue.forEach((item) => {
            const chainId = Number(item) as ChainId
            temp_pills = handlePillArray(FilterTypes.CHAIN, NETWORK_LABEL[item], temp_pills, chainId)
            chains = updateChainOptions(chains, chainId, true)
          })
        } else {
          const chainId = Number(queryValue) as ChainId
          temp_pills = handlePillArray(FilterTypes.CHAIN, NETWORK_LABEL[queryValue], temp_pills, chainId)
          chains = updateChainOptions(chains, chainId, true)
        }
        setSelectedChains(chains)
      } else if (key === FilterTypes.SALE) {
        let tokens = [...selectedTokens]
        if (Array.isArray(queryValue)) {
          queryValue.forEach((item) => {
            temp_pills = handlePillArray(FilterTypes.SALE, item, temp_pills)
            tokens = updateSelectedTokens(tokens, item, true)
          })
        } else {
          temp_pills = handlePillArray(FilterTypes.SALE, queryValue, temp_pills)
          tokens = updateSelectedTokens(tokens, queryValue, true)
        }
        setSelectedTokens(tokens)
      } else if (key === FilterTypes.ATTRIBUTE) {
        let temp = [...selectedAttributes]
        if (Array.isArray(queryValue)) {
          queryValue.forEach((item) => {
            const attribute = findAttribute(item)
            if (attribute) {
              temp_pills = handlePillArray(
                FilterTypes.ATTRIBUTE,
                attribute.value,
                temp_pills,
                null,
                attribute.id,
                attribute.trait_type
              )
              temp = updateSelectedAttributes(temp, attribute, true)
            }
          })
        } else {
          const attribute = findAttribute(queryValue)
          if (attribute) {
            temp_pills = handlePillArray(
              FilterTypes.ATTRIBUTE,
              attribute.value,
              temp_pills,
              null,
              attribute.id,
              attribute.trait_type
            )
            temp = updateSelectedAttributes(temp, attribute, true)
          }
        }
        setSelectedAttributes(temp)
      } else if (key === FilterTypes.SORTBY) {
        const sortOption = SORT_BY_TYPES.find((type) => type.label === router.query[FilterTypes.SORTBY])
        if (sortOption) {
          setSortByType(sortOption)
        }
      } else if (key === 'symbol') {
        const currency = defaultCurrentyFilterOptions.find((currency) => currency.value === queryValue)
        const minPrice = router.query['min']
        const maxPrice = router.query['max']
        let name = minPrice ? queryValue + ': ' + minPrice + ' ~ ' : queryValue + ': ~ '
        if (maxPrice) {
          name += maxPrice
        }
        const pricePill = temp_pills.find((item) => item.type === FilterTypes.PRICE)
        if (!pricePill) {
          temp_pills.push({
            src: currency.img as string,
            name,
            type: FilterTypes.PRICE,
          })
        } else {
          pricePill.name = name
          pricePill.src = currency.img as string
        }
        setSelectedCurrency(currency)
        setPriceOptions({ min: minPrice ? Number(minPrice) : 0, max: maxPrice ? Number(maxPrice) : 0 })
      }
    })
    setPills(temp_pills)
  }, [collectionOptions, router.query])

  useEffect(() => {
    if (collectionOptions.length > 0) {
      fetchDataMiddleware()
    }
    // initial fetch just once when component mounted or empty queries
    const queryKeys = Object.keys(router.query)
    if (queryKeys.length < 1 && collectionOptions.length > 0) {
      fetchData(true, 0)
    }
  }, [collectionOptions, router.query])

  //* NOTE: fetch nfts, collections, users data when tab changed, scrolling, and component mounted *//
  /**
   * @param isInitial scroll fetching or route change
   * @param index tab index
   * @param isClearing clear all filters default false
   * @param sortOption default undefined. it's for sortBy state didn't update
   */
  const fetchData = async (isInitial: boolean, index: number, isClearing = false, sortOption = undefined) => {
    const tmpTabData = [...tabData]
    const tmpOffsets = [...offsets]
    const tmpLoadable = [...canLoadMore]
    const offset = tmpOffsets.find((offset) => offset.index === index)
    const isLoadMore = tmpLoadable.find((obj) => obj.index === index)
    let updateLoadable: boolean
    // NOTE: run api if initial request or loadmore isn't defiend or true
    if (isInitial || !isLoadMore || isLoadMore?.value) {
      setIsLoading(true)
      if (index === 0) {
        const param: NFTFilterDto = {
          offset: isInitial ? 0 : offset ? offset.value : 0,
          limit: initialLimit,
          orderBy: {},
          saleTypes: [],
          chainIds: [],
          symbols: [],
          attrIds: [],
          collectionIds: [],
        }
        if (!isClearing) {
          pills.forEach((pill) => {
            if (pill.type === FilterTypes.STATUS) {
              const type = matchingStatusTypes(pill.name)
              // FIXME:
              // param.saleTypes.push(type as SaleType)
            } else if (pill.type === FilterTypes.CHAIN) {
              param.chainIds.push(Number(pill.chainId))
            } else if (pill.type === FilterTypes.SALE) {
              param.symbols.push(pill.name)
            } else if (pill.type === FilterTypes.ATTRIBUTE) {
              param.attrIds.push(pill.traitId)
            } else if (pill.type === FilterTypes.COLLECTION) {
              param.collectionIds.push(pill.address)
            } else if (pill.type === FilterTypes.NAME) {
              param.nameQuery = pill.name
            } else if (pill.type === FilterTypes.PRICE) {
              if (priceOptions.min > 0) {
                param.priceRange = { minUsd: currencyConverter(priceOptions.min) }
              }
              if (priceOptions.max > 0) {
                param.priceRange = { ...param.priceRange, maxUsd: currencyConverter(priceOptions.max) }
              }
            }
          })
        }
        if (sortByType || sortOption) {
          const key = getSortTypeKey(sortByType?.label || sortOption?.label)
          param.orderBy = {
            [key]: key === 'price' ? sortByType?.value || sortOption?.value : 'desc',
          }
        }
        const res: NFTFilterRes = await restAPI.filterNFTs(param)
        setTotalSearchResult(res.total)
        if (isInitial) {
          tmpTabData[index].content = res.result
        } else {
          tmpTabData[index].content = [...tmpTabData[index].content, ...res.result]
        }
        updateLoadable = res.result.length < initialLimit ? false : true
      } else {
        const result = pills.find((pill) => pill.type === FilterTypes.NAME)
        const param: UserFilterDto = {
          offset: isInitial ? 0 : offset ? offset.value : 0,
          limit: initialLimit,
          type: index === 1 ? AccountType.COLLECTION : AccountType.USER,
          nameQuery: result ? result.name : '',
        }
        const res: NFTFilterRes = await restAPI.filterUsers(param)
        setTotalSearchResult(res.total)
        if (isInitial) {
          tmpTabData[index].content = res.result
        } else {
          tmpTabData[index].content = [...tmpTabData[index].content, ...res.result]
        }
        updateLoadable = res.result.length < initialLimit ? false : true
      }
      setTabData(tmpTabData)
      setIsLoading(false)
      // NOTE: update offset for the load more event
      if (offset) {
        offset.value = offset.value + initialLimit
        setOffsets(tmpOffsets)
      } else {
        tmpOffsets.push({
          index,
          value: initialLimit,
        })
      }
      setOffsets(tmpOffsets)
      // NOTE: if fetched length is less than purposed limit, then that means there is no data to fetch more.
      if (!isLoadMore) {
        tmpLoadable.push({
          index,
          value: updateLoadable,
        })
      } else {
        isLoadMore.value = updateLoadable
      }
      setCanLoadMore(tmpLoadable)
    }
  }

  //* NOTE: update data when filter option changed on desktop version *//
  useEffect(() => {
    if (pills.length > 0) {
      fetchData(true, tabIndex)
    }
  }, [pills])

  const onHandleFollow = async (user: User, mode: number): Promise<string> => {
    return ''
    // if (!account) {
    //   toggleWalletModal()
    //   return ''
    // } else {
    //   const res = await handleUserFollow(user, mode, account, library)
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
  }

  const onHandleLike = async (likes: number, nft: NFT, mode: number): Promise<string> => {
    return ''
    // if (!account) {
    //   toggleWalletModal()
    //   return ''
    // } else {
    //   const res = await handleNFTLike(likes, nft, profile.userId, mode, account, library)
    //   if (res) {
    //     const msg = mode ? `You saved like for '${nft.name}'NFT.` : `You remove like for the '${nft.name}'NFT.`
    //     toastSuccess('Success', msg)
    //   } else {
    //     toastError('Error', res)
    //   }
    //   return res
    // }
  }

  //* NOTE: When tab is changed, show loading and fetching data again *//
  const handleTabsChange = async (index: number) => {
    setTabIndex(index)
    if (pills.length < 1 || index !== 0) {
      fetchData(true, index)
    } else {
      fetchData(false, index)
    }
  }
  const handleFilterBox = () => {
    setIsOpen(!isOpen)
  }

  const onClearFilterOptions = () => {
    const temp_pills = pills.filter((pill) => pill.type === undefined)
    setPills(temp_pills)

    setStatusOptions({
      isFixed: false,
      isAuction: false,
      isNew: false,
      hasOffers: false,
    })
    setSelectedCollections([])
    setSelectedChains([])
    setSelectedTokens([])
    setSelectedAttributes([])
    setIsPriceError(false)
    router.push({ pathname: '/search' }, undefined, {
      shallow: true,
    })
  }
  const onRemoveFilterOption = (pill: Pill) => {
    const pill_temp = pills.filter((item) => !(item.type === pill.type && item.name === pill.name))
    setPills(pill_temp)
    switch (pill.type) {
      case FilterTypes.NAME: {
        runQueryBuilder(pill.name, FilterTypes.NAME)
        break
      }
      case FilterTypes.STATUS: {
        handleStatusChange(pill.name as StatusFilterTypes, false, true)
        break
      }
      case FilterTypes.COLLECTION: {
        const collection = collectionOptions.find((item) => item.name === pill.name)
        handleCollectionChange(collection, true)
        break
      }
      case FilterTypes.CHAIN: {
        handleChainChange(pill.chainId, true)
        break
      }
      case FilterTypes.SALE: {
        const tokens = updateSelectedTokens(selectedTokens, pill.name)
        setSelectedTokens(tokens)
        runQueryBuilder(pill.name, FilterTypes.SALE)
        break
      }
      case FilterTypes.ATTRIBUTE: {
        const attribute = findAttribute(pill.trait_type)
        handleAttributeChange(attribute, true)
        break
      }
      case FilterTypes.PRICE: {
        setPriceOptions({ min: 0, max: 0 })
        setIsPriceError(false)
        runMultiQueryBuilder(false)
        break
      }
    }
  }

  const statusChangeSwitch = (options: StatusFilters, type: StatusFilterTypes, value: boolean) => {
    switch (type) {
      case StatusFilterTypes.FIXED:
        options.isFixed = value
        break
      case StatusFilterTypes.AUCTION:
        options.isAuction = value
        break
      case StatusFilterTypes.NEW:
        options.isNew = value
        break
      case StatusFilterTypes.OFFERS:
        options.hasOffers = value
        break
    }
    return options
  }
  const handleStatusChange = (type: StatusFilterTypes, value: boolean, isRemove = false) => {
    const tmpOptions = { ...statusOptions }
    const options = statusChangeSwitch(tmpOptions, type, value)
    setStatusOptions(options)
    if (isRemove || isLargerThan768) {
      runQueryBuilder(matchingStatusTypes(type), FilterTypes.STATUS)
    }
  }

  const handleCurrencyChange = (option: SelectOption) => {
    setSelectedCurrency(option)
  }
  const handlePriceChange = (value: number | undefined, type: string) => {
    const temp = { ...priceOptions }
    if (type === 'min') {
      temp.min = value
    } else {
      if (value > temp.min) {
        setIsPriceError(false)
      }
      temp.max = value
    }
    setPriceOptions(temp)
  }
  const handleApplyPriceFilter = () => {
    const isValid = priceOptions.max > 0 ? priceOptions.max > priceOptions.min : true
    if (isLargerThan768) {
      if (isValid) {
        runMultiQueryBuilder()
      } else {
        setIsPriceError(true)
      }
    } else {
      if (isValid) {
        setIsPriceFilterApplied(true)
      } else {
        setIsPriceError(true)
      }
    }
  }

  const updateChainOptions = (chains: ChainId[], chainId: ChainId, isAdding = false) => {
    if (!isAdding && chains.includes(chainId)) {
      chains = chains.filter((item) => item !== chainId)
    } else if (!chains.includes(chainId)) {
      chains.push(chainId)
    }
    return chains
  }
  const handleChainChange = (chainId: ChainId, isRemove = false) => {
    const tmpChains = [...selectedChains]
    const chains = updateChainOptions(tmpChains, chainId)
    setSelectedChains(chains)
    if (isRemove || isLargerThan768) {
      runQueryBuilder(chainId.toString(), FilterTypes.CHAIN)
    }
  }

  const updateCollectionOptions = (options: string[], name: string, isAdding = false) => {
    if (!isAdding && options.includes(name)) {
      options = options.filter((item) => item !== name)
    } else if (!options.includes(name)) {
      options.push(name)
    }
    return options
  }
  const handleCollectionChange = (collection: User, isRemove = false) => {
    const tmpOptions = [...selectedCollections]
    const options = updateCollectionOptions(tmpOptions, collection.name)
    setSelectedCollections(options)
    if (isRemove || isLargerThan768) {
      runQueryBuilder(collection.name, FilterTypes.COLLECTION)
    }
  }

  const updateSelectedTokens = (tokens: string[], value: string, isAdding = false) => {
    if (!isAdding && tokens.includes(value)) {
      tokens = tokens.filter((token) => token !== value)
    } else if (!tokens.includes(value)) {
      tokens.push(value)
    }
    return tokens
  }
  const handleSaleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const tmpTokens = [...selectedTokens]
    const tokens = updateSelectedTokens(tmpTokens, e.target.value)
    setSelectedTokens(tokens)
    isLargerThan768 && runQueryBuilder(e.target.value, FilterTypes.SALE)
  }

  const handleSortByTypeChange = (option: SelectOption) => {
    runQueryBuilder(option.label, FilterTypes.SORTBY)
  }

  const updateSelectedAttributes = (attributes: Attribute[], attribute: Attribute, isAdding = false) => {
    const is_exist = attributes.find(
      (item) => item.trait_type === attribute.trait_type && item.value === attribute.value
    )
    if (!isAdding && is_exist) {
      attributes = attributes.filter(
        (item) => !(item.trait_type === attribute.trait_type && item.value === attribute.value)
      )
    } else if (!is_exist) {
      attributes.push(attribute)
    }
    return attributes
  }
  const handleAttributeChange = (attribute: Attribute, isRemove = false) => {
    const tmpAttrs = [...selectedAttributes]
    const attrs = updateSelectedAttributes(tmpAttrs, attribute)
    setSelectedAttributes(attrs)
    if (isRemove || isLargerThan768) {
      runQueryBuilder(attribute.trait_type, FilterTypes.ATTRIBUTE)
    }
  }

  const handleApplyAll = () => {
    let mergedQuery = {}
    //NOTE: filter only selected options
    const filteredOptions = Object.keys(statusOptions).filter((key) => statusOptions[key])
    filteredOptions.forEach((key) => {
      const query = manageQueries(matchingStatusTypes(key), FilterTypes.STATUS)
      mergedQuery = mergeQueries(mergedQuery, query, FilterTypes.STATUS)
    })
    if (isPriceFilterApplied) {
      if (priceOptions.min || priceOptions.max) {
        mergedQuery['symbol'] = String(selectedCurrency.value)
        // NOTE: change or add to router query if state has value.
        if (priceOptions.min) {
          mergedQuery['min'] = String(priceOptions.min)
        }
        if (priceOptions.max) {
          mergedQuery['max'] = String(priceOptions.max)
        }
      }
    }
    selectedCollections.forEach((collectionName) => {
      const query = manageQueries(collectionName, FilterTypes.COLLECTION)
      mergedQuery = mergeQueries(mergedQuery, query, FilterTypes.COLLECTION)
    })
    selectedChains.forEach((chainId) => {
      const query = manageQueries(chainId.toString(), FilterTypes.CHAIN)
      mergedQuery = mergeQueries(mergedQuery, query, FilterTypes.CHAIN)
    })
    selectedTokens.forEach((token) => {
      const query = manageQueries(token, FilterTypes.SALE)
      mergedQuery = mergeQueries(mergedQuery, query, FilterTypes.SALE)
    })
    selectedAttributes.forEach((attr) => {
      const query = manageQueries(attr.trait_type, FilterTypes.ATTRIBUTE)
      mergedQuery = mergeQueries(mergedQuery, query, FilterTypes.ATTRIBUTE)
    })
    router.push({ pathname: '/search', query: mergedQuery }, undefined, {
      shallow: true,
    })
  }

  return (
    <Fragment>
      <NextSeo {...defaultMetaData} title={`Browse NFTs | NFTmall`} />
      <Banner from="search" />
      <ChakraLayout display="flex" position="relative" zIndex={2}>
        <Flex align="baseline" width="100%">
          <ChakraFilter
            attributes={attributes}
            chainOptions={chainOptions}
            collectionOptions={collectionOptions}
            currencies={defaultCurrentyFilterOptions}
            isOpen={tabIndex === 0 ? isOpen : false}
            isPriceError={isPriceError}
            pillsCount={pills.length}
            priceOptions={priceOptions}
            selectedAttributes={selectedAttributes}
            selectedChains={selectedChains}
            selectedCollections={selectedCollections}
            statusOptions={statusOptions}
            selectedCurrency={selectedCurrency}
            selectedTokens={selectedTokens}
            handleAttributeChange={handleAttributeChange}
            handleChainChange={handleChainChange}
            handleCollectionChange={handleCollectionChange}
            handleFilterBox={handleFilterBox}
            handleCurrencyChange={handleCurrencyChange}
            handlePriceChange={handlePriceChange}
            handleApplyPriceFilter={handleApplyPriceFilter}
            handleStatusChange={handleStatusChange}
            handleSaleChange={handleSaleChange}
            handleApplyAll={handleApplyAll}
            handleClearAll={onClearFilterOptions}
          />
          <VStack width="100%" height="100%" spacing={4} align="initial" position="relative" ml={{ base: 0, md: 4 }}>
            <Box display={tabIndex !== 0 ? 'none' : 'flex'}>
              <ChakraFilterPills
                pills={pills}
                onClearFilterOptions={onClearFilterOptions}
                onRemoveFilterOption={onRemoveFilterOption}
              />
            </Box>
            <Flex
              justify="space-between"
              align="center"
              width="100%"
              zIndex={2}
              display={tabIndex !== 0 ? 'none' : 'flex'}
            >
              <ChakraText ml={2}>{totalSearchResult} items</ChakraText>
              <Box width={{ base: '100%', md: 72 }}>
                <ChakraSelect
                  options={SORT_BY_TYPES}
                  placeholder="Sort by"
                  value={sortByType}
                  onChange={handleSortByTypeChange}
                />
              </Box>
            </Flex>
            {/* <ChakraDataTabs
              account={account}
              canLoadMore={canLoadMore[tabIndex]?.value || !isLoading}
              collections={collectionOptions}
              curTab={tabIndex}
              isSearch
              data={tabData}
              rate={rate}
              isLoading={isLoading}
              isInFullWidth={tabIndex === 0 ? !isOpen : true}
              limit={initialLimit}
              loadMore={() => fetchData(false, tabIndex)}
              onChange={handleTabsChange}
              onClick={() => router.push('/')}
              handleLike={(likes, nft, mode) => onHandleLike(likes, nft, mode)}
              handleFollow={(user, mode) => onHandleFollow(user, mode)}
            /> */}
          </VStack>
        </Flex>
      </ChakraLayout>
    </Fragment>
  )
}

export default Search
