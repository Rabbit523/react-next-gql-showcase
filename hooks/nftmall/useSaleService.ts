import {
  BLOCKCHAIN_TO_CHAINID,
  compareAddresses,
  getOwnershipId,
  getServiceFeePercent,
  isERC721Collection,
  isERC1155Collection,
  parseUnionId,
  PricingHelperFunc,
  SaleSide,
  SaleType,
  tryParseAmount,
  unionAssetToCurrency,
  unionAssetTypeToCurrency,
} from '@nftmall/sdk'
import { CollectionType, Item } from '@rarible/api-client'
import { ChainId, Currency, CurrencyAmount, WNATIVE } from '@sushiswap/core-sdk'
import { useActiveWeb3React } from 'app/services/web3'
import { useSupportedCurrenciesByChainId } from 'app/state/lists/nftmall/hooks'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  useActiveAuctionByERC721Item,
  useCollection,
  useItemRoyalties,
  useOwnership,
  useSortedBidsByItem,
  useSortedSellOrdersByItem,
} from '../../services/union-api/hooks'
import useAmICreator from './useAmICreator'
import useAmIOwner from './useAmIOwner'

const getItemChainId = (item: Item): ChainId | undefined => {
  return parseUnionId(item.id, true).chainId
}

/**
 * check if user's wallet is connected to the same network as nft
 * @param item nft item
 * @returns true / false
 */
export const useAmIOnSameChain = (item: Item) => {
  const { account: myAccount, chainId } = useActiveWeb3React()
  const itemChainId = BLOCKCHAIN_TO_CHAINID[item?.blockchain] || parseUnionId(item.id).chainId
  const onSameChain = useMemo(() => !!myAccount && !!chainId && itemChainId === chainId, [myAccount, chainId, item])
  return {
    amIOnSameChain: onSameChain,
    myChainId: chainId,
    itemChainId,
  }
}

export const useSaleService = (item: Item) => {
  // ======== Fixed price sale
  const { account: myAccount, chainId, library } = useActiveWeb3React()
  // NOTE: Here https://github.com/NFTmall/NFTmall/issues/1056
  // const { data: activeSellOrder } = useActiveSellOrderByItem(item.id)
  const bestSellOrder = item?.bestSellOrder
  const { amIOwner, firstOwner, ownershipSWR } = useAmIOwner(item)
  const { amICreator, firstCreator } = useAmICreator(item)

  /// start
  const { data: collection, isLoading: isCollectionLoading } = useCollection({
    variables: { collectionId: item.contract },
    shouldFetch: !!item?.contract,
    swrConfig: {
      refreshInterval: 60 * 1000, // once per 1 min.
    },
  })

  const ownershipId = getOwnershipId(item, myAccount)
  const { data: ownership, mutate: mutateOwnershipSWR } = useOwnership({
    variables: { ownershipId: ownershipId },
    shouldFetch: ownershipId && collection?.type === CollectionType.ERC1155,
    swrConfig: {
      refreshInterval: 60 * 1000, // once per 1 min.
    },
  })

  const isERC721 = isERC721Collection(collection)
  const isERC1155 = isERC1155Collection(collection)
  // console.log({ ownership, ownershipId })
  /// end

  // ======================================================== Sell Orders
  // These are for both erc721, ERC1155 collections
  const { data: sortedSellOrders, mutate: mutateSortedSellOrders } = useSortedSellOrdersByItem({
    variables: { itemId: item?.id },
    shouldFetch: !!item?.id,
    // shouldFetch: collection?.type === CollectionType.ERC1155 && !!item?.id,
    swrConfig: {
      refreshInterval: 2 * 60 * 1000, // once per 1 min.
    },
  })
  const mySellOrders = useMemo(
    () =>
      !!myAccount && !!sortedSellOrders
        ? sortedSellOrders.filter((order) => compareAddresses(order.maker, myAccount))
        : [],
    [myAccount, sortedSellOrders]
  )
  const amISeller: boolean = mySellOrders?.length > 0
  // ======================================================== Sell Orders

  const { amIOnSameChain, itemChainId } = useAmIOnSameChain(item)

  // all currencies available for this nft
  const supportedCurrencies = useSupportedCurrenciesByChainId(itemChainId)
  // can't bid using native currency such as ETH. must convert to WETH
  const currenciesForBidding = useMemo(() => supportedCurrencies.filter((cur) => !cur.isNative), [supportedCurrencies])
  // exclude WETB from buying and selling
  const currenciesForBuySell = useMemo(
    () => supportedCurrencies.filter((cur) => !cur.equals(WNATIVE[itemChainId])),
    [supportedCurrencies, itemChainId]
  )

  const { data: royaltiesList, isLoading: isRoyaltiesLoading } = useItemRoyalties({
    variables: { itemId: item?.id },
    shouldFetch: !!item?.id,
    swrConfig: {
      refreshInterval: 30 * 60 * 1000, // once per 30 min.  this value rarely changes
    },
  })
  // TODO: there might be many guys here
  const firstGuyRoyalty = royaltiesList?.royalties?.at(0)?.value

  const bestSellOrderCurrency = useMemo(() => {
    if (bestSellOrder?.take && itemChainId) {
      return unionAssetToCurrency(bestSellOrder.take, itemChainId)
    }
    return null
  }, [bestSellOrder, itemChainId])

  const calcPriceHelper = useCallback(
    (priceEach: CurrencyAmount<Currency>, side: SaleSide, quantity = 1) => {
      // checkMinBalance = true
      const feePercent = getServiceFeePercent(firstCreator, myAccount, priceEach.currency.symbol, side)
      const totalPrice = priceEach.multiply(quantity)
      const feeAmount = totalPrice.multiply(feePercent).divide(10000)
      const feeInUSD = 123.45 // TODO:
      const afterFeeAmount = side === 'SELL' ? totalPrice.subtract(feeAmount) : totalPrice.add(feeAmount)
      const currencySymbol = priceEach.currency.symbol
      const priceInUSD = 123.45 // TODO:
      const requiredMinPrice = tryParseAmount('0.1', priceEach.currency)
      const inputGTEMinPrice = priceEach.greaterThan(requiredMinPrice)

      return {
        inputPrice: priceEach,
        // inputPriceNumber: inputCurrencyAmount?.toFixed(10),
        feePercent,
        feeAmount,
        // feeAmountNumber: feeAmount?.toFixed(10),
        feeInUSD,
        afterFeeAmount,
        // afterFeeAmountNumber: afterFeeAmount?.toFixed(10),
        currencySymbol,
        priceInUSD,
        requiredMinPrice,
        inputGTEMinPrice,
      }
    },
    [firstCreator, myAccount]
  )

  // Mainly for selling
  // For FixedSaleModal
  const calculateSellPrices: PricingHelperFunc = useCallback(
    (inputCurrencyAmount: CurrencyAmount<Currency>, action = 'LISTING', quantity = 1) => {
      // inputPrice = 1.234
      // ownership check
      const side = 'SELL'
      // if (!amIOwner) {
      //   return {
      //     can: false,
      //     error: 'You are not owner of this item.',
      //   }
      // }
      // if (bestSellOrder && action !== 'ACCEPTING_BID') {
      //   return {
      //     can: false,
      //     error: 'Sell order already exists.',
      //   }
      // }
      // balance check
      const res = calcPriceHelper(inputCurrencyAmount, side, quantity)
      // console.warn({ res })
      const can = true
      const error = ''
      // if (action === 'LISTING') {
      //   // minimum bid check user is bidding
      //   if (!res.inputGTEMinPrice) {
      //     can = false
      //     error = `Enter at least ${res.requiredMinPrice.toSignificant(6)} ${selectedCurrency.symbol}.`
      //   }
      // }

      return {
        can, // seller must be owner && currency must be supported
        error,
        currencySymbol: res.currencySymbol, // seller's chosen sell currency
        price: res.inputPrice, // price in token
        priceInUSD: res.priceInUSD, // price in usd
        serviceFeePercent: res.feePercent, // service fee
        serviceFeeAmount: res.feeAmount, // service fee in the selected currency
        afterFeeAmount: res.afterFeeAmount, // receive amount after fee
      }
    },
    [calcPriceHelper]
  )

  // Mainly for buying and bidding.
  // For CheckoutModal
  const calculateBuyPrices: PricingHelperFunc = useCallback(
    (inputCurrencyAmount: CurrencyAmount<Currency>, action = 'BUYING', quantity = 1) => {
      const side = 'BUY'
      // if (amIOwner) {
      //   return {
      //     can: false,
      //     error: 'Your already own this item.',
      //   }
      // }
      // if (!amIOnSameChain) {
      //   return {
      //     can: false,
      //     error: `Please connect your wallet to '${CHAINID_TO_URLSLUG[itemChainId]}'.`,
      //   }
      // }
      // if (action === 'BUYING' && !bestSellOrder) {
      //   return {
      //     can: false,
      //     error: 'Sell order does not exist.',
      //   }
      // }

      const res = calcPriceHelper(inputCurrencyAmount, side, quantity)
      // console.warn({ res })

      const can = true
      const error = ''

      if (action === 'BIDDING') {
        // we are doing this in the modal comopnent
        // minimum bid check user is bidding
        // if (!res.inputGTEMinPrice) {
        //   can = false
        //   error = `Enter at least ${res.requiredMinPrice.toSignificant(6)} ${selectedCurrency.symbol}.`
        // }
      } else {
        // balance check
        if (bestSellOrderCurrency && !bestSellOrderCurrency.equals(inputCurrencyAmount.currency)) {
          return {
            can: false,
            error: `Choose the same currency as the sell order.`,
          }
        }

        // const hasSufficientBalance = false // currencyBalance.greaterThan(res.inputPrice)

        // if (!hasSufficientBalance) {
        //   can = false
        //   error = 'Insufficient balance.'
        // }
      }

      return {
        can, // seller must be owner && currency must be supported
        error,
        currencySymbol: res.currencySymbol, // seller's chosen sell currency
        price: res.inputPrice, // price in token
        priceInUSD: res.priceInUSD, // price in usd
        serviceFeePercent: res.feePercent, // service fee
        serviceFeeAmount: res.feeAmount, // service fee in the selected currency
        afterFeeAmount: res.afterFeeAmount, // receive amount after fee
      }
    },
    [calcPriceHelper, bestSellOrderCurrency]
  )

  // ======== Auction related stuff
  const {
    data: activeAuction,
    isLoading,
    mutate: mutateAuction,
  } = useActiveAuctionByERC721Item({
    variables: { itemId: item?.id },
    shouldFetch: !!item?.id,
    swrConfig: {
      refreshInterval: 2 * 60 * 1000, // once per 2 min.
    },
  })
  const auctionCurrency = useMemo(() => {
    if (activeAuction?.buy && itemChainId) {
      return unionAssetTypeToCurrency(activeAuction.buy, itemChainId)
    }
    return null
  }, [itemChainId, activeAuction?.buy])

  // here auction may not exist.
  // ==== Bids
  const { data: sortedBids, mutate: mutateSortedBids } = useSortedBidsByItem({
    variables: { itemId: item?.id },
    shouldFetch: !!item?.id,
    swrConfig: {
      refreshInterval: 2 * 60 * 1000, // once per 1 min.
    },
  })
  const highestBid = sortedBids?.at(0)
  const myBids = useMemo(
    () => !!myAccount && !!sortedBids && sortedBids.filter((order) => compareAddresses(order.maker, myAccount)),
    [myAccount, sortedBids]
  )
  const amIBidder: boolean = myBids?.length > 0 // useMemo(() => myBids?.length > 0, [myBids])

  const [isStartingLater, setIsStartingLater] = useState(false)
  const [isBidableAuction, setBidableAuction] = useState(false)
  const [isOrderCountdown, setIsOrderCountdown] = useState(false)
  const [auctionTime, setAuctionTime] = useState<Date>() // this is for countdown timer. need better naming.
  const [isTimedOrder, setIsTimedOrder] = useState(false)

  const mutate = useCallback(() => {
    mutateSortedBids()
    mutateSortedSellOrders()
    // FIXME: for now not interested in auctions
    // mutateAuction()
    ownershipSWR.mutate()
    mutateOwnershipSWR()
  }, [mutateOwnershipSWR, mutateSortedBids, mutateSortedSellOrders, ownershipSWR])

  const onHandleInterval = useEffect(() => {
    // console.warn(`Use effect triggered: ${Date.now() / 5000}`)
    // continue here
    if (isStartingLater) {
      if (Date.parse(activeAuction.endTime) > new Date().getTime()) {
        setAuctionTime(new Date(activeAuction?.endTime))
        setIsStartingLater(false)
        setBidableAuction(true)
      } else {
        setIsStartingLater(false)
        setBidableAuction(false)
      }
    } else if (isTimedOrder) {
      setIsOrderCountdown(false)
    } else {
      setBidableAuction(false)
    }
  }, [Math.floor(Date.now() / 5000)])

  const saleType: SaleType = useMemo(() => {
    if (!!activeAuction && !!bestSellOrder) {
      throw new Error('Auction and Fixed Price sale can not co-exist!')
    }
    if (activeAuction) {
      if (Date.parse(activeAuction.endTime) > 0) {
        return SaleType.AUCTION_TIMED
      }
      return SaleType.AUCTION_UNLIMITED
    }
    if (bestSellOrder) {
      return SaleType.FIXED_PRICE
    }
    return SaleType.NOT_FOR_SALE
  }, [activeAuction, bestSellOrder])

  useEffect(() => {
    // const price = getBalanceAmount(BigNumber.from(auction.minPrice))
    // const currency = getCurrency(auction.currencyId, auction.chainId)
    // const currencyValue = getCurrencyValue(rate, currency)
    // const inUSD = price.mul(currencyValue).decimalPlaces(1)
    // TODO: combine with above useeffect
    const startTime = new Date(activeAuction?.data.startTime)
    const endTime = new Date(activeAuction?.endTime)
    const currentTime = new Date()
    if (+startTime > +currentTime) {
      setIsStartingLater(true)
      setAuctionTime(startTime)
    }
    if (+endTime > +currentTime && +startTime < +currentTime) {
      setAuctionTime(endTime)
      setBidableAuction(true)
    }
  }, [activeAuction])

  const numMyListedItems = useMemo(() => {
    let sum = 0
    for (let i = 0; i < mySellOrders.length; i++) {
      sum += parseInt(mySellOrders[i].makeStock)
    }
    return sum
  }, [mySellOrders])

  const numMyBalance = useMemo(() => {
    if (!myAccount || !collection) return 0
    if (collection.type === CollectionType.ERC1155) {
      return ownership?.value ? parseInt(ownership?.value) : 0
    }
    return amIOwner ? 1 : 0 // for erc721
  }, [amIOwner, collection, myAccount, ownership?.value])

  const maxItemsForSale = useMemo(() => {
    if (!myAccount || !collection) return 0
    if (numMyBalance > numMyListedItems) {
      return numMyBalance - numMyListedItems
    }
    return 0
  }, [collection, myAccount, numMyBalance, numMyListedItems])

  // NOTE: The owner can put on sale if there is no fixed, timed, unlimited auction
  const canListForSale: boolean = useMemo(() => {
    console.warn({ mySellOrders, numMyListedItems })
    if (!collection) return false
    if (collection.type === CollectionType.ERC1155) {
      return maxItemsForSale > 0
    }
    return amIOwner && !bestSellOrder && !activeAuction // for erc721
  }, [activeAuction, amIOwner, bestSellOrder, collection, maxItemsForSale, mySellOrders, numMyListedItems])

  const canRemoveSale: boolean = useMemo(() => {
    //NOTE: If fixed sale, owner can cancel sale at anytime
    //NOTE: If timed auction and it has more than 1 bid, then owner can't remove sale, else can cancel at anytime
    if (!collection || !myAccount) return false
    if (isERC1155) {
      if (mySellOrders.length) {
        // I have listing(s)
        return true
      }
      return false
    }
    if (isERC721) {
      if (amIOwner) {
        if (bestSellOrder) {
          return true
        } else if (activeAuction) {
          if (saleType === SaleType.AUCTION_UNLIMITED) {
            return true
          } else {
            if (!sortedBids) {
              return true
            }
          }
        }
      }
    }
    return false
  }, [
    collection,
    myAccount,
    isERC1155,
    isERC721,
    mySellOrders.length,
    amIOwner,
    bestSellOrder,
    activeAuction,
    saleType,
    sortedBids,
  ])

  const canBid: boolean = useMemo(() => {
    if (!collection) return false
    if (collection.type === CollectionType.ERC1155) {
      return false
    }
    if (!amIOwner) {
      if (bestSellOrder) {
        return true
      } else if (activeAuction) {
        if (saleType === SaleType.AUCTION_UNLIMITED) {
          return true
        } else {
          if (!isStartingLater && isBidableAuction) {
            return true
          }
        }
      } else {
        return true
      }
    }
    return false
  }, [collection, amIOwner, bestSellOrder, activeAuction, saleType, isStartingLater, isBidableAuction])

  const canDirectlyBuy: boolean = useMemo(() => {
    if (!myAccount) return true // to show buy now button when wallet is not connected.
    if (!collection || !myAccount) return false
    if (collection.type === CollectionType.ERC1155) {
      // FIXME:
      return false
      if (amIOwner) {
        // I own several items. I can buy more if there are more sellers.
        if (sortedSellOrders?.length > 0) {
          for (let i = 0; i < sortedSellOrders.length; i++) {
            if (!compareAddresses(sortedSellOrders[i].maker, myAccount)) {
              // not mine. then can buy.
              return true
            }
          }
          // all mine? then can't buy
          return false
        }
        // no sell orders? can't buy
        return false
      } else {
        // I own nothing so can buy from any seller.
        return !!bestSellOrder
      }
      return true
    }
    if (collection.type === CollectionType.ERC721) {
      return !amIOwner && !!bestSellOrder
    }
    return false
  }, [amIOwner, bestSellOrder, collection, myAccount, sortedSellOrders])

  const canTransfer: boolean = useMemo(() => {
    if (isERC1155) {
      return false
    }
    if (isERC721) {
      return amIOwner && !(activeAuction && saleType === SaleType.AUCTION_TIMED)
    }
    return false
  }, [isERC1155, isERC721, amIOwner, activeAuction, saleType])

  const canBurn: boolean = useMemo(() => {
    if (isERC1155) {
      return false
    }
    if (isERC721) {
      return amIOwner
    }
    return false
  }, [amIOwner, isERC1155, isERC721])

  const minBiddableValue = useMemo(() => {
    return '1'.toBigNumber(18) // at least $1
    // NOTE: If timed auction, the biddable min price should be greater than auction's min price or highest bidder's bid value
    // if (saleType === SaleType.AUCTION_TIMED) {
    //   if (highestBid) {
    //     if (selectedCurrency?.symbol === highestBid.currency) {
    //       // Must be 5% more
    //       const addedPercent = BigNumber.from(highestBid.priceInToken).mul(0.05)
    //       const balance = BigNumber.from(highestBid.priceInToken).add(addedPercent)
    //       return balance.decimalPlaces(3)
    //     } else {
    //       //NOTE: Convert highest bidder's currency value to customer selected currency value
    //       const currencyValue = getCurrencyValue(rate, selectedCurrency?.symbol) // selected currency's USD rate
    //       const baseBalance = BigNumber.from(highestBid.priceInUSD).dividedBy(BigNumber.from(currencyValue)) // highest bid price in selected currency
    //       const addedPercent = baseBalance.mul(0.05)
    //       const balance = baseBalance.add(addedPercent)
    //       return balance.decimalPlaces(3)
    //     }
    //   } else {
    //     if (selectedCurrency?.symbol === activeAuction.currency) {
    //       return BigNumber.from(activeAuction.priceInToken)
    //     } else {
    //       //NOTE: Convert auction's currency min price to customer selected currency value
    //       const currencyValue = getCurrencyValue(rate, selectedCurrency?.symbol)
    //       const auctionValue = BigNumber.from(activeAuction.priceInUSD)
    //       const baseBalance = auctionValue.dividedBy(BigNumber.from(currencyValue))
    //       return baseBalance.decimalPlaces(3)
    //     }
    //   }
    // } else if (sortedBids?.length > 0) {
    //   // TODO: caculate minBiddable price for second bid
    //   // NOTE: if second bid, it should be greater than prev bid value
    //   const myPrevBid = sortedBids.find((bid) => bid.maker === account?.toLowerCase())
    //   if (myPrevBid) {
    //     const prevBidCurrency = getCurrencySymbol(myPrevBid.make.assetType, nft.chainId)
    //     const prevPriceInToken = getBalanceAmount(BigNumber.from((myPrevBid.make as Asset).value))
    //     if (selectedCurrency?.symbol === prevBidCurrency) {
    //       const addedPercent = BigNumber.from(prevPriceInToken).mul(0.05)
    //       const balance = BigNumber.from(prevPriceInToken).add(addedPercent)
    //       return balance.decimalPlaces(3)
    //     } else {
    //       const currencyValue = getCurrencyValue(rate, prevBidCurrency)
    //       const prevPriceInUSD = prevPriceInToken.mul(currencyValue).decimalPlaces(2)
    //       //NOTE: Convert highest bidder's currency value to customer selected currency value
    //       const selectedCurrencyValue = getCurrencyValue(rate, selectedCurrency?.symbol) // selected currency's USD rate
    //       const baseBalance = BigNumber.from(prevPriceInUSD).dividedBy(BigNumber.from(selectedCurrencyValue)) // highest bid price in selected currency
    //       const addedPercent = baseBalance.mul(0.05)
    //       const balance = baseBalance.add(addedPercent)
    //       return balance.decimalPlaces(3)
    //     }
    //   }
    // }
    // return BigNumber.from(getDefaultOrderMinPrice(selectedCurrency?.symbol))
  }, [])

  return {
    itemChainId,
    collection,
    isERC721,
    isERC1155,
    ownership, // for erc1155 only
    myBalance: numMyBalance,
    maxItemsForSale,
    saleType,
    activeAuction,
    bestSellOrder,
    bestSellOrderCurrency,
    auctionCurrency,
    amIOwner,
    amIOnSameChain,
    amIBidder,
    amICreator,
    amISeller,
    firstOwner,
    firstCreator,
    myBids,
    mySellOrders,
    highestBid,
    canListForSale,
    canRemoveSale,
    canBid,
    canDirectlyBuy,
    canTransfer,
    canBurn,
    calculateSellPrices,
    calculateBuyPrices,
    isOrderCountdown,
    auctionTime,
    minBiddableValue,
    sortedBids,
    sortedSellOrders,
    mutate,
    // available currencies
    supportedCurrencies,
    currenciesForBidding,
    currenciesForBuySell,
    royaltiesList,
    firstGuyRoyalty,
  }
}

// const useAuctionService = (item: Item, selectedCurrencySymbol: string) => {
//   const { account: myAccount, chainId } = useActiveWeb3React()
//   const { data: activeAuction, isLoading } = useActiveAuctionByERC721Item(item.id)
//   // here auction may not exist.
//   const { data: sortedBids } = useSortedBidsByItem(item.id)
//   const highestBid = sortedBids?.at(0)
//   const myBids = useMemo(
//     () => !!myAccount && !!sortedBids && sortedBids.filter((order) => compareAddresses(order.maker, myAccount)),
//     [myAccount, sortedBids],
//   )
//   const amIBidder = useMemo(() => myBids?.length > 0, [myBids])

//   let canBuyNow = false
//   let canBidNow = false
//   return {
//     activeAuction,
//     canBuyNow, // must have enough balance, auction must not end
//     canBidNow, // can bid now as buyer
//     highestBid, // highest bid
//     myBids, // my bids
//     amIBidder, // am i one of bidders
//     minBidPrice: 0,
//     canBid: false,
//     canCancelBid: false,
//     bidServiceFee: 0,
//     bidServiceFeeAmount: 0,
//   }
// }

export default useSaleService
