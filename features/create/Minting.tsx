import { Box, Button, Flex, HStack, Text, VStack, Wrap, WrapItem } from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import {
  CHAINID_TO_BLOCKCHAIN,
  defaultMetaData,
  delay,
  expDateOptions,
  formErrorText,
  generateItemURI,
  getDefaultOrderMinPrice,
  getNextCollectionURI,
  makeNFTId,
  makeUnionAddress,
  matchedContractAddress,
  NFTMALL_ERC721_ADDRESS,
  NFTMALL_ERC1155_ADDRESS,
  NFTMALL_TRANSFERPROXY_ADDRESS,
  parseUnionId,
  SaleType,
  SelectOption,
  startingDateOptions,
} from '@nftmall/sdk'
import {
  BackButton,
  Banner,
  ChakraErrorText,
  ChakraEthInput,
  ChakraFormLabel,
  ChakraHeading,
  ChakraInput,
  ChakraInputGroup,
  ChakraLayout,
  ChakraText,
  ChakraTextarea,
  FileDropzone,
  IconAddCollection,
  MintPreviewCard,
  NextChakraLink,
  PrimaryGradientButton,
  Property,
  SelectDateTimePicker,
  TokenTypeSelectButton,
} from '@nftmall/uikit'
import { User } from '@prisma/client'
import { Collection, CollectionType } from '@rarible/api-client'
import { Currency, WNATIVE } from '@sushiswap/core-sdk'
import CreateCollectionModal from 'app/components/CreateCollectionModal'
import { MintModal } from 'app/components/MintModal'
import { ApprovalState } from 'app/hooks'
import useModal from 'app/hooks/nftmall/useModal'
import { useNFTApproveCallback } from 'app/hooks/nftmall/useNFTApproveCallback'
import useNFTService from 'app/hooks/nftmall/useNFTService'
import { signMessage } from 'app/hooks/nftmall/useSignMessage'
import useToast from 'app/hooks/nftmall/useToast'
import { useCurrencyExchangeRate } from 'app/hooks/nftmall/useTokenBalances'
import { useCollection, useMyUnionAccount, useUnionCollectionsByOwner } from 'app/services/union-api/hooks'
import { useActiveWeb3React } from 'app/services/web3'
import { useWalletModalToggle } from 'app/state/application/hooks'
import { useSupportedCurrenciesByChainId } from 'app/state/lists/nftmall/hooks'
import { useProfile } from 'app/state/profile/hook'
import { restAPI } from 'app/utils/rest'
import { addDays } from 'date-fns'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { ChangeEvent, FC, Fragment, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiExternalLink } from 'react-icons/fi'

interface MintingProps {
  children?: ReactNode
  handleBackStep: () => void
  collectibleTitle: string
  collectionType: CollectionType.ERC721 | CollectionType.ERC1155
}

const Minting: FC<MintingProps> = ({ handleBackStep, collectibleTitle, collectionType }) => {
  const router = useRouter()
  const { account, chainId, library } = useActiveWeb3React()
  const nativeColId = useMemo(
    // NFTmall collection id
    () => {
      if (collectionType === CollectionType.ERC721)
        return NFTMALL_ERC721_ADDRESS[chainId] ? NFTMALL_ERC721_ADDRESS[chainId].toLowerCase() : ''
      else return NFTMALL_ERC1155_ADDRESS[chainId] ? NFTMALL_ERC1155_ADDRESS[chainId].toLowerCase() : ''
    },
    [chainId, collectionType]
  )
  const nativeColUnionId = makeUnionAddress(chainId, nativeColId)
  // select nftmall collection by default
  const [selectedColUnionId, setSelectedColUnionId] = useState<string>(nativeColUnionId)
  const parsedSelectedColUnionId = useMemo(() => parseUnionId(selectedColUnionId), [selectedColUnionId])
  const { data: rate, isLoading: isLoadingRate } = useCurrencyExchangeRate()
  // FIXME: `useERC1155TokenApprove` may be needed here.
  // However, ERC1155 seems to have compatible `setApprovalForAll` and `isApprovedForAll` with ERC721.
  // https://docs.openzeppelin.com/contracts/3.x/api/token/erc1155#IERC1155-setApprovalForAll-address-bool-

  const nftService = useNFTService()
  const {
    data: nativeCol,
    isLoading: isNativeColLoading,
    error: nativeColLoadError,
  } = useCollection({
    variables: { collectionId: nativeColUnionId },
    shouldFetch: !!nativeColUnionId,
    swrConfig: {
      refreshInterval: 120 * 1000,
    },
  })
  // const { isApproved, handleApprove } = useERC721TokenApprove(parsedSelectedColUnionId.contract, chainId)
  const [approvalState, handleApprove] = useNFTApproveCallback(
    parsedSelectedColUnionId.contract,
    true,
    NFTMALL_TRANSFERPROXY_ADDRESS[chainId]
  )

  const { profile } = useProfile()
  const { toastError, toastSuccess } = useToast()
  const [isOnSale, setOnSale] = useState(false)
  const [isUnlockSale, setUnlockSale] = useState(false)
  const [saleDescription, setSaleDescription] = useState('Enter price to allow users instantly purchase your NFT')
  const [selectedSaleType, setSaleType] = useState<SaleType>() // SaleType.FIXED_PRICE
  const [startingDate, setStartingDate] = useState<SelectOption>()
  const [startDate, setStartDate] = useState<Date>()
  const [expDate, setExpDate] = useState<SelectOption>()
  const [endDate, setEndDate] = useState<Date>()
  const [isError, setError] = useState({
    file: false,
    price: false,
    name: false,
    locked: false,
    collection_name: false,
    collection_symbol: false,
    startingDate: false,
    endDate: false,
  })
  const [price, setPrice] = useState<number>()
  const supportedCurrencies = useSupportedCurrenciesByChainId(chainId)
  const currenciesForBuySell = useMemo(
    () => supportedCurrencies.filter((cur) => !cur.equals(WNATIVE[chainId])),
    [supportedCurrencies, chainId]
  )
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currenciesForBuySell[0])
  const [originFile, setOriginFile] = useState<File>(null)
  const [fileType, setFileType] = useState('')
  const [name, setName] = useState<string>()
  const [description, setDescription] = useState<string>()
  const [unlockedContent, setUnlockedContent] = useState<string>()
  const [royalty, setRoyalty] = useState<number>(10)
  // const [affiliate, setAffiliate] = useState<number>(0)
  const [supply, setSupply] = useState(1)
  const [properties, setProperties] = useState<Property[]>([{ key: '', value: '', trait_type: '' }])
  const propertyRefs = useRef([])
  const [nextTokenID, setNextTokenID] = useState<string>()
  const [isOpen, setOpen] = useState(false)
  const [isUploadingIpfs, setIsUploadingIpfs] = useState(false)
  const [protocolURL, setProtocolURL] = useState('')
  const [isAuthorizationLoading, setAuthorizationLoading] = useState(false)
  const [isNFTAuhorized, setIsNFTAuthorized] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [isMinted, setIsMinted] = useState(false)
  const [isOrderLoading, setIsOrderLoading] = useState(false)
  const [isOrdered, setIsOrdered] = useState(false)
  const [isLockSigning, setIsLockSigning] = useState(false)
  const [isAuctionSigning, setIsAuctionSigning] = useState(false)
  const [isAuctionSigned, setIsAuctionSigned] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const toggleWalletModal = useWalletModalToggle()
  const accountUnionId = useMyUnionAccount()

  const ENABLE_COLLECTION = true

  // these myCollections contain both erc721 and erc1155
  const { data: myCollections, mutate: mutateMyCollections } = useUnionCollectionsByOwner({
    variables: {
      ownerUnionAddress: accountUnionId,
      blockchains: [CHAINID_TO_BLOCKCHAIN[chainId]],
    },
    shouldFetch: ENABLE_COLLECTION,
    swrConfig: { refreshInterval: 5 * 60 * 1000 },
  })

  // native collection plus created collections
  const collections = useMemo(() => {
    const cols: Array<Collection> = []
    if (nativeCol) cols.push(nativeCol)
    if (myCollections?.length) {
      myCollections.forEach((col) => {
        if (col.type === collectionType) {
          // Filter erc721 or erc1155 depending on user's selection
          cols.push(col)
        }
      })
    }
    return cols
  }, [nativeCol, myCollections, collectionType])

  // user's chosen coll
  const selectedCollection = useMemo(
    () => collections.find((col) => col?.id === selectedColUnionId),
    [collections, selectedColUnionId]
  )

  console.log('collections: ', collections)
  console.log('selectedCollection: ', selectedCollection)
  console.log('selectedColUnionId: ', selectedColUnionId)

  useEffect(() => {
    setIsNFTAuthorized(approvalState === ApprovalState.APPROVED)
  }, [approvalState])

  useEffect(() => {
    if (originFile) {
      setPreviewUrl(URL.createObjectURL(originFile))
      // asdf
      setProtocolURL('')
    }
  }, [originFile])

  const onCreateOrder = useCallback(async () => {
    if (account && nextTokenID && isMinted) {
      setIsOrderLoading(true)
      // TODO: currency may have less than 18 decimals https://github.com/NFTmall/NFTmall/issues/951
      // const orderPrice = BigNumber.from(price)
      const currency = selectedCurrency?.symbol
      // console.log({ orderPrice, currency })
      try {
        // TODO: let's allow order creation here
        // await orderService.createSellOrder(currency, account, nextTokenID, price)
        setIsOrdered(true)
        // if (isUnlockSale && unlockedContent) {
        //   handleLockContent()
        // }
      } catch (error) {
        toastError('An error occurred.', error.message)
      }
      setIsOrderLoading(false)
    }
  }, [account, isMinted, nextTokenID, selectedCurrency?.symbol, toastError])

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file: File) => {
        const reader = new FileReader()
        reader.onload = async function () {
          setOriginFile(file)

          if (file.type.includes('video')) {
            setFileType('video')
          } else {
            setFileType('image')
          }

          const t = { ...isError }
          t.file = false
          setError(t)
        }
        reader.readAsDataURL(file)
      })
    },
    [isError]
  )
  const onCancelDrop = useCallback(() => {
    setOriginFile(null)
    setFileType('')
  }, [])

  const handleAuctionSign = useCallback(async () => {
    const nftId = makeNFTId(nativeColId, nextTokenID)
    const currency = matchedContractAddress(selectedCurrency?.symbol, chainId)
    let paramStartDate = ''
    let paramEndDate = ''
    let message = ''
    if (selectedSaleType === SaleType.AUCTION_TIMED) {
      const startTime = startingDate.value === 'right_after' ? new Date() : startDate
      const endTime =
        startingDate.value === 'right_after'
          ? endDate.getTime() < new Date().getTime() + 10 * 60000
            ? new Date(new Date().getTime() + 10 * 60000)
            : endDate
          : endDate
      message = `I would like to create auction with parameters: id: ${nftId}, currency:${currency}, minPrice:${price}, start:${startTime}, end:${endTime}`
      paramStartDate = startTime.toISOString()
      paramEndDate = endTime.toISOString()
    } else {
      message = `I would like to put on sale id: ${nftId}`
      paramStartDate = new Date().toISOString()
      paramEndDate = new Date(new Date().getTime() + 60 * 60000).toISOString()
    }
    try {
      const signature = await signMessage(library, account, message)
      if (signature) {
        const data = {
          auction: {
            startDate: paramStartDate,
            endDate: paramEndDate,
            currency,
            minPrice: selectedSaleType === SaleType.AUCTION_TIMED ? BigNumber.from(price) : '0',
            nftId,
            collectionId: nativeColId,
            type: selectedSaleType,
          },
          sig: signature,
          message,
          userId: account.toLowerCase(),
        }
        const res = await restAPI.createAuction(data)
        if (res) {
          setIsAuctionSigned(true)
          // if (isUnlockSale && unlockedContent) {
          //   handleLockContent()
          // }
        }
      }
    } catch (error) {
      console.log(error)
      toastError('An error occurred.', error.message)
    }
    setIsAuctionSigning(false)
  }, [
    account,
    chainId,
    nativeColId,
    endDate,
    library,
    nextTokenID,
    price,
    selectedCurrency?.symbol,
    selectedSaleType,
    startDate,
    startingDate?.value,
    toastError,
  ])

  const onApprove = useCallback(async () => {
    if (account) {
      setAuthorizationLoading(true)
      try {
        await handleApprove()
        setIsNFTAuthorized(true)
        if (price > 0 && selectedSaleType === SaleType.FIXED_PRICE) {
          onCreateOrder()
        } else if (price > 0 && selectedSaleType === SaleType.AUCTION_TIMED) {
          handleAuctionSign()
        } else {
          // do nothing
        }
      } catch (error) {
        toastError('Error', error.message)
      }
      setAuthorizationLoading(false)
    }
  }, [account, handleApprove, handleAuctionSign, onCreateOrder, price, selectedSaleType, toastError])

  const handleConfirmTx = useCallback(async () => {
    if (!selectedCollection) {
      throw new Error('Please choose a collection.')
    }
    const nextTokenId = await nftService.generateNextTokenId(chainId, selectedCollection)
    const { tokenId } = nextTokenId
    setNextTokenID(tokenId)
    if (!tokenId) {
      throw new Error(`Can not generate token id. Try again later.`)
    }

    properties.pop()
    const metaData = {
      name,
      description,
      image: protocolURL,
      // TODO: let user enter external url he likes
      // external_url: makeNFTExternalURL(makeNFTId(collectionId, tokenId)),
      attributes: properties,
    }
    //NOTE: upload metadata to ipfs and use its hash as tokenURI
    const tokenUri = await restAPI.pinMetadata(metaData)
    // alert(tokenUri)
    if (!tokenUri) {
      throw new Error('Pinning metadata has failed.')
    }
    //NOTE: call contract method
    // FIXME: retrying step is required considering user's failed or rejected tx
    await nftService.mint(selectedCollection, nextTokenId, tokenUri, royalty * 100, account, supply)
    // let's wait a couple of seconds
    delay(1 * 1000)
    setIsMinted(true)
    if (approvalState === ApprovalState.APPROVED) {
      if (price > 0 && selectedSaleType === SaleType.FIXED_PRICE) {
        onCreateOrder()
      } else if (price > 0 && selectedSaleType === SaleType.AUCTION_TIMED) {
        handleAuctionSign()
      } else {
        // do nothing
      }
    } else {
      onApprove()
    }
  }, [
    selectedCollection,
    nftService,
    chainId,
    properties,
    name,
    description,
    royalty,
    account,
    supply,
    approvalState,
    price,
    selectedSaleType,
    onCreateOrder,
    handleAuctionSign,
    onApprove,
  ])

  const handleIpfsUploading = useCallback(async () => {
    if (!originFile) throw new Error('You need to select a file to mint an NFT.')
    const protocolURL = await restAPI.pinFile(originFile)
    console.log({ protocolURL })
    setProtocolURL(protocolURL)
    return protocolURL
  }, [originFile])

  // const handleLockContent = useCallback(async () => {
  //   setIsLockSigning(true)
  //   const message = `I would like to set lock for ${nextTokenID}, content is ${unlockedContent}`
  //   try {
  //     await signMessage(library, account, message)
  //     //TODO: what to do with sig here?
  //     setIsLockSigning(false)
  //   } catch (error) {
  //     setIsLockSigning(false)
  //     toastError('An error occurred.', error.message)
  //   }
  // }, [])
  // NOTE: sign for unlimited or timed auction

  // Handling form element's change
  const handleSaleTypeChange = useCallback((type: string) => {
    switch (type) {
      case SaleType.FIXED_PRICE:
        setSaleDescription('Enter price to allow users instantly purchase your NFT')
        setSaleType(type)
        break
      case SaleType.AUCTION_TIMED:
        setSaleDescription('Set a period of time for which buyers can place bids')
        setSaleType(type)
        break
      case SaleType.AUCTION_UNLIMITED:
        setSaleDescription('Allow other users to make bids on your NFT')
        setSaleType(type)
        break
    }
  }, [])
  const handlePriceChange = useCallback(
    (value: number | undefined) => {
      setPrice(value || 0)
      const t = { ...isError }
      t.price = value <= 0 || false
      setError(t)
    },
    [isError]
  )
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, type: string, id: number) => {
      if (type === 'name') {
        setName(e.target.value)
        const t = { ...isError }
        t.name = false
        setError(t)
      } else if (type === 'copies') {
        setSupply(parseInt(e.target.value))
      } else {
        const temp = [...properties]
        if (temp.length > 0) {
          // NOTE: show values on input tag
          if (type === 'value') {
            temp.forEach((item, index) => {
              if (index === id) {
                item.value = e.target.value
              }
            })
          } else if (type === 'key') {
            temp.forEach((item, index) => {
              if (index === id) {
                item.key = e.target.value
                item.trait_type = e.target.value
              }
            })
          }
          // NOTE: remove last property if value is empty
          if ((!temp[id].key || !temp[id].value) && id < temp.length - 1) {
            temp.pop()
          } else if (id === temp.length - 1 && e.target.value && type === 'value') {
            // NOTE: add new property
            temp.push({ key: '', value: '', trait_type: '' })
          }
        } else {
          // NOTE: put first property
          temp.push({
            key: type === 'key' ? e.target.value : '',
            trait_type: type === 'key' ? e.target.value : '',
            value: type === 'value' ? e.target.value : '',
          })
          temp.push({ key: '', value: '', trait_type: '' })
          const currentRef = propertyRefs.current[id].current.select()
          currentRef.focus()
        }
        setProperties(temp)
      }
    },
    [isError, properties]
  )
  const handleTokenChange = useCallback(
    (value: string) => {
      const currency = supportedCurrencies.find((token) => token.symbol === value)
      setSelectedCurrency(currency)
    },
    [supportedCurrencies]
  )
  const handleSelectChange = useCallback(
    (option: SelectOption, type: string) => {
      if (type === 'start') {
        const start: Date = new Date()
        setStartDate(start)
        setStartingDate(option)
        setError({ ...isError, startingDate: false })
      } else {
        let end: Date = new Date()
        switch (option.value) {
          case '1day':
            end = addDays(new Date(), 1)
            break
          case '3days':
            end = addDays(new Date(), 3)
            break
          case '5days':
            end = addDays(new Date(), 5)
            break
          case '7days':
            end = addDays(new Date(), 7)
            break
          default:
            end = new Date()
            break
        }
        setExpDate(option)
        setEndDate(end)
        setError({ ...isError, endDate: false })
      }
    },
    [isError]
  )
  const handleSelectOptionChange = useCallback((value: string, type: string) => {
    if (type === 'start') {
      setStartingDate({
        value: 'other',
        label: value,
      })
      setStartDate(new Date(value))
    } else {
      setExpDate({
        value: 'other',
        label: value,
      })
      setEndDate(new Date(value))
    }
  }, [])
  const handleNumberChange = useCallback((numberValue: number, type: string) => {
    if (type === 'royalty') {
      setRoyalty(numberValue)
    }
    //  else if (type === 'affiliate') {
    //   setAffiliate(numberValue)
    // }
  }, [])
  const renderErrorText = useCallback(
    (type: string) => {
      switch (type) {
        case 'price':
          return (
            <ChakraErrorText>
              <>
                The price can not be less than&nbsp;
                {getDefaultOrderMinPrice(selectedCurrency?.symbol)} {selectedCurrency?.symbol}
              </>
            </ChakraErrorText>
          )
        case 'lockContent':
          return <ChakraErrorText>{formErrorText.lockedContent}</ChakraErrorText>
        case 'name':
          return <ChakraErrorText>{formErrorText.name}</ChakraErrorText>
        case 'startingDate':
          return <ChakraErrorText>{!startDate ? formErrorText.required : formErrorText.pastTime}</ChakraErrorText>
        case 'endDate':
          return <ChakraErrorText>{!endDate ? formErrorText.required : formErrorText.duration}</ChakraErrorText>
      }
    },
    [endDate, selectedCurrency?.symbol, startDate]
  )
  // Handling form element's change

  const openModal = useCallback(() => {
    if (!account) {
      toggleWalletModal()
    } else {
      const t = { ...isError }
      // const minPrice = getDefaultOrderMinPrice(selectedCurrency?.symbol)
      // let timedValidation = false
      // if (selectedSaleType === SaleType.AUCTION_TIMED) {
      //   if (startingDate && expDate) {
      //     const validStartDate = new Date().getTime()
      //     const sDate = startingDate.value !== 'right_after' ? startDate.getTime() : validStartDate
      //     const validEndDate =
      //       startingDate.value === 'right_after' ? new Date().getTime() + 10 * 60000 : startDate.getTime() + 10 * 60000
      //     timedValidation = endDate.getTime() <= validEndDate || sDate < validStartDate
      //     t.startingDate = sDate < validStartDate
      //     t.endDate = endDate.getTime() <= validEndDate
      //   } else {
      //     timedValidation = !startingDate || !expDate
      //     t.startingDate = !startingDate
      //     t.endDate = !expDate
      //   }
      // }

      // FIXME:
      const error = !originFile || !name // ||
      // (isUnlockSale && !unlockedContent) ||
      // (isOnSale && selectedSaleType === SaleType.AUCTION_TIMED && timedValidation) ||
      // (isOnSale && selectedSaleType !== SaleType.AUCTION_UNLIMITED && (!price || price < minPrice))
      if (!error) {
        setOpen(true)
        // just open. don't triggger next action automatically
        // handleIpfsUploading()
      } else {
        t.file = !originFile
        t.name = !name
        // FIXME:
        t.price = isOnSale && selectedSaleType !== SaleType.AUCTION_UNLIMITED // && (!price || price < minPrice)
        t.locked = isUnlockSale && !unlockedContent
        setError(t)
      }
    }
  }, [
    account,
    handleIpfsUploading,
    isError,
    isOnSale,
    isUnlockSale,
    name,
    originFile,
    selectedSaleType,
    toggleWalletModal,
    unlockedContent,
  ])

  const handleCloseMint = useCallback(() => {
    setOpen(false)
    setIsMinting(false)
    setIsOrderLoading(false)
    setIsAuctionSigning(false)
    setIsLockSigning(false)
  }, [])

  const onHandleRedirect = useCallback(async () => {
    // item url
    const itemRoute = generateItemURI(chainId, parsedSelectedColUnionId.lowercaseAddress, nextTokenID)
    if (itemRoute) {
      toastSuccess('Success!', 'Redirecting to your shiny NFT page...')
      await router.push(itemRoute)
      setOpen(false)
      return
    }
    // item url generation failed
    console.warn('Item URI generation failed', itemRoute)
    // profile url
    const profileRoute = `/account`
    toastSuccess('Success!', 'Redirecting to your account page...')
    await router.push(profileRoute)
    setOpen(false)
  }, [chainId, nextTokenID, parsedSelectedColUnionId?.lowercaseAddress, router, toastSuccess])

  const onNewCollection = useCallback(
    async (newColUnionId: string) => {
      mutateMyCollections() // reload my collections
      await delay(3_000) // wait a bit
      setSelectedColUnionId(newColUnionId)
    },
    [mutateMyCollections]
  )

  const [onPresentCollectionModal] = useModal(
    <CreateCollectionModal nextCallback={onNewCollection} collectionType={collectionType} />
  )

  // useEffect(() => {
  //   const _window: any = window
  //   if (_window.Cypress) {
  //     fetch('https://picsum.photos/300/200')
  //       .then((r) => r.blob())
  //       .then((blob) => {
  //         const testFile = new File([blob], 'test.png')
  //         setOriginFile(testFile)
  //         setFileType('image')
  //       })
  //       .catch(console.error)
  //   }
  // }, [])

  return (
    <Fragment>
      <NextSeo {...defaultMetaData} title={`Create NFT | NFTmall`} />
      <Banner from="mint" />
      <ChakraLayout display="flex" py={{ base: 0, lg: 10 }}>
        <VStack maxWidth="1600px" marginX="auto" spacing={8} align="initial" width="100%" zIndex={1}>
          <VStack align="initial">
            <BackButton aria-label="back to collection setting" onClick={handleBackStep}>
              Manage collectible type
            </BackButton>
            <ChakraHeading as="h1">{collectibleTitle}</ChakraHeading>
          </VStack>
          <Flex>
            {/* ======================== Minting form */}
            <VStack flex={1.5} spacing={8} align="initial" w="100%">
              <FileDropzone
                onDrop={onDrop}
                onCancel={onCancelDrop}
                file={originFile}
                fileType={fileType}
                isError={isError.file && !originFile}
              />

              {/* <Flex w="100%" justify="space-between" align="center">
                  <Box>
                    <ChakraFormLabel>Put on marketplace</ChakraFormLabel>
                    <ChakraText type="secondary">{saleDescription}</ChakraText>
                  </Box>
                  <Switch isChecked={isOnSale} onChange={(e) => setOnSale(e.target.checked)} />
                </Flex> */}
              {isOnSale && (
                <VStack spacing={4} w="100%">
                  <HStack w="100%" justify="space-between" align="center" spacing={4}>
                    {/* saleTypes.map((saleType) => (
                        <TokenTypeSelectButton
                          aria-label={saleType.type}
                          isActive={selectedSaleType === saleType.type}
                          onClick={() => handleSaleTypeChange(saleType.type)}
                          key={saleType.type}
                        >
                          <VStack>
                            {saleType.src}
                            <ChakraText fontWeight="bold" whiteSpace="break-spaces">
                              {saleType.title}
                            </ChakraText>
                          </VStack>
                        </TokenTypeSelectButton>
                      )) */}
                  </HStack>
                  {selectedSaleType === SaleType.FIXED_PRICE ? (
                    <Box w="100%">
                      <ChakraFormLabel>Price</ChakraFormLabel>
                      <ChakraEthInput
                        currencyList={currenciesForBuySell}
                        priceHandler={handlePriceChange}
                        tokenHandler={handleTokenChange}
                        isInvalid={isError.price}
                        data-cy="input-price"
                      />
                      {isError.price && renderErrorText('price')}
                    </Box>
                  ) : selectedSaleType === SaleType.AUCTION_TIMED ? (
                    <VStack spacing={4} w="100%" align="initial">
                      <Box w="100%">
                        <ChakraFormLabel>Minimum bid</ChakraFormLabel>
                        <ChakraEthInput
                          priceHandler={handlePriceChange}
                          tokenHandler={handleTokenChange}
                          currencyList={currenciesForBuySell}
                          isInvalid={isError.price}
                          data-cy="input-min-bid"
                        />
                        {isError.price && renderErrorText('price')}
                        <ChakraText type="secondary">Bids below this amount won't be allowed.</ChakraText>
                      </Box>
                      <HStack align="flex-start" w="100%">
                        <Box flex={1}>
                          <ChakraFormLabel>Starting Date</ChakraFormLabel>
                          <SelectDateTimePicker
                            options={startingDateOptions}
                            value={startingDate}
                            onChange={handleSelectChange}
                            onApply={handleSelectOptionChange}
                            isInvalid={isError.startingDate}
                            type="start"
                          />
                          {isError.startingDate && renderErrorText('startingDate')}
                        </Box>
                        <Box flex={1}>
                          <ChakraFormLabel>Expiration Date</ChakraFormLabel>
                          <SelectDateTimePicker
                            options={expDateOptions}
                            value={expDate}
                            onChange={handleSelectChange}
                            onApply={handleSelectOptionChange}
                            isInvalid={isError.endDate}
                            type="exp"
                          />
                          {isError.endDate && renderErrorText('endDate')}
                        </Box>
                      </HStack>
                      <ChakraText type="secondary">
                        Any bid placed in the last 10 minutes extends the auction by 10 minutes.
                      </ChakraText>
                    </VStack>
                  ) : undefined}
                </VStack>
              )}
              {/* <Flex w="100%" justify="space-between" align="center">
                  <Box>
                    {formLabelRenderer('Unlock once purchased')}
                    {formDesRenderer('Content will be unlocked after successful transaction', false)}
                  </Box>
                  <Switch isChecked={isUnlockSale} onChange={(e) => setUnlockSale(e.target.checked)} />
                </Flex> */}
              {isUnlockSale && (
                <Box w="100%">
                  <ChakraTextarea
                    onChange={(e) => setUnlockedContent(e.target.value)}
                    placeholder="Digital key, code to redeem or link to a file..."
                    isInvalid={isError.locked}
                  />
                  {isError.locked && renderErrorText('lockedContent')}
                  <ChakraText type="secondary">Tip: Markdown syntax is supported</ChakraText>
                </Box>
              )}
              {ENABLE_COLLECTION && (
                <Box>
                  <Text fontSize="lg" my={2}>
                    Choose collection
                  </Text>
                  {/* {formLabelRenderer('Choose collection', { marginBottom: 2 })} */}
                  <Wrap spacing={4}>
                    <WrapItem>
                      <TokenTypeSelectButton minH={36} minW={36} flex="unset" onClick={onPresentCollectionModal}>
                        <VStack>
                          <IconAddCollection />
                          <Text>Create</Text>
                          <Text opacity={0.5}>{collectionType === CollectionType.ERC721 ? 'ERC-721' : 'ERC-1155'}</Text>
                        </VStack>
                      </TokenTypeSelectButton>
                    </WrapItem>
                    {collections?.map((col) => (
                      <WrapItem key={col.id}>
                        <TokenTypeSelectButton
                          flex="unset"
                          isActive={!!selectedCollection && col.id === selectedCollection?.id}
                          onClick={() => setSelectedColUnionId(col.id)}
                          position="relative"
                          w="180px"
                          h="120px"
                        >
                          <VStack width="100%" position="relative" spacing={3}>
                            {/* {getCollectionMetaContent(col)?.imageContent && (
                              <Box width="64px" height="64px">
                                <Image
                                  src={getCollectionMetaContent(col).imageContent.url}
                                  alt={col.name}
                                  width="128"
                                  height="128"
                                  objectFit="cover"
                                />
                              </Box>
                            )} */}
                            <Box w="100%" position="relative">
                              <Text
                                as="span"
                                textOverflow="ellipsis"
                                wordBreak="normal"
                                whiteSpace="normal"
                                noOfLines={2}
                                fontWeight="semibold"
                                fontSize="md"
                              >
                                {/* col.meta.name is not very reliable. */}
                                {/* {(col as any)?.meta?.name || col.name} */}
                                {col.name || parseUnionId(col.id).lowercaseAddress}
                              </Text>
                            </Box>
                            <Text as="span" opacity={0.5} fontSize="sm">
                              {col?.symbol}
                            </Text>
                            <NextChakraLink href={getNextCollectionURI(col)}>
                              <Button>
                                <FiExternalLink />
                              </Button>
                            </NextChakraLink>
                          </VStack>
                        </TokenTypeSelectButton>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}

              <Box>
                <ChakraFormLabel>Name</ChakraFormLabel>
                <ChakraInput
                  // placeholder='e. g. "Redeemable T-Shirt with logo"'
                  isInvalid={isError.name}
                  onChange={(e) => handleInputChange(e, 'name', 0)}
                  data-cy="input-name"
                />
                {isError.name && renderErrorText('name')}
              </Box>
              <Box>
                <HStack align="center" mb={2}>
                  <ChakraFormLabel mb={0}>Description</ChakraFormLabel>
                  <ChakraText type="secondary">(Optional)</ChakraText>
                </HStack>
                <ChakraTextarea
                  onChange={(e) => setDescription(e.target.value)}
                  data-cy="input-desc"
                  // placeholder='e. g. "After purchasing you’ll be able to get the real T-Shirt"'
                />
                <ChakraText type="secondary">With preserved line-breaks</ChakraText>
              </Box>
              <Box>
                <ChakraFormLabel>Royalties</ChakraFormLabel>
                <ChakraInputGroup
                  value={royalty}
                  onChange={(_, NumberValue) => handleNumberChange(NumberValue || 0, 'royalty')}
                  max={30}
                />
                <ChakraText type="secondary">Suggested: 5%, 10%. Maximum is 30%</ChakraText>
              </Box>
              {/* <Box>
                {formLabelRenderer('Commission to your Affiliate')}
                <ChakraInputGroup
                  value={affiliate}
                  onChange={(_, NumberValue) => handleNumberChange(NumberValue || 0, 'affiliate')}
                />
                {formDesRenderer('Suggested: 10%, 20%, 30%', false)}
              </Box> */}
              {collectionType === CollectionType.ERC1155 && (
                <Box>
                  <ChakraFormLabel>Number of copies</ChakraFormLabel>
                  <ChakraInput
                    type="number"
                    placeholder="e. g. 10"
                    min={1}
                    step={1}
                    onChange={(e) => handleInputChange(e, 'copies', 0)}
                  />
                  <ChakraText type="secondary">Amount of tokens</ChakraText>
                </Box>
              )}
              <Box>
                <HStack align="center" mb={2}>
                  <ChakraFormLabel mb={0}>Properties</ChakraFormLabel>
                  <ChakraText type="secondary">(Optional)</ChakraText>
                </HStack>
                {properties.map((property, index) => {
                  return (
                    <HStack spacing={8} marginBottom={2} key={`property-${index}`}>
                      <ChakraInput
                        placeholder="e. g. Key"
                        onChange={(e) => handleInputChange(e, 'key', index)}
                        value={property.key}
                        ref={propertyRefs.current[index]}
                      />
                      <ChakraInput
                        placeholder="e. g. Value"
                        onChange={(e) => handleInputChange(e, 'value', index)}
                        value={property.value}
                        ref={propertyRefs.current[index]}
                      />
                    </HStack>
                  )
                })}
              </Box>
              <PrimaryGradientButton
                aria-label="create nft"
                maxW="fit-content"
                size="lg"
                px={16}
                onClick={openModal}
                zIndex={1}
              >
                Create item
              </PrimaryGradientButton>
            </VStack>
            {/* ======================== Preview card */}
            <VStack
              align="start"
              display={{ base: 'none', lg: 'flex' }}
              flexBasis={60}
              height="fit-content"
              ml={12}
              position="sticky"
              top={36}
            >
              <ChakraFormLabel>Preview</ChakraFormLabel>
              <MintPreviewCard
                chainId={chainId}
                copies={supply}
                currency={selectedCurrency?.symbol}
                endDate={endDate?.getTime() || 0}
                file={originFile}
                fileType={fileType}
                collection={selectedCollection}
                nftName={name}
                previewUrl={previewUrl}
                price={price}
                rate={rate}
                saleType={selectedSaleType}
                startDate={startDate?.getTime() || 0}
                user={profile as User}
              />
            </VStack>
          </Flex>
        </VStack>

        {isOpen && (
          <MintModal
            isOpen={isOpen}
            handleUpload={handleIpfsUploading}
            handleConfirmTx={handleConfirmTx}
            isProcessingIPFS={isUploadingIpfs}
            hasIpfsProtocal={!!protocolURL}
            isAuthorizationLoading={isAuthorizationLoading}
            isNFTAuhorized={isNFTAuhorized}
            isMinting={isMinting}
            isMinted={isMinted}
            isTimedAuction={selectedSaleType === SaleType.AUCTION_TIMED}
            isOrderLoading={isOrderLoading}
            isOrdered={isOrdered}
            isUnlockSale={isUnlockSale}
            isLockSigning={isLockSigning}
            isUnlimitedAuction={selectedSaleType === SaleType.AUCTION_UNLIMITED}
            isAuctionSigning={isAuctionSigning}
            isAuctionSigned={isAuctionSigned}
            price={price}
            unlockedContent={unlockedContent}
            viewNFT={onHandleRedirect}
            onCancel={handleCloseMint}
          />
        )}
      </ChakraLayout>
    </Fragment>
  )
}

export default Minting
