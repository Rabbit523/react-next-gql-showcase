import { BLOCKCHAIN_TO_CHAINID, getPlatformFee, parseUnionId, toUnionCurrency } from '@nftmall/sdk'
import { Item, ItemId, Order, OrderId } from '@rarible/api-client'
import { CHAIN_KEY, Currency, CurrencyAmount } from '@sushiswap/core-sdk'
import { retry, RetryableError } from 'app/functions/retry'
import useUnionSDK from 'app/services/union-api/hooks/useUnionSDK'
import { useActiveWeb3React } from 'app/services/web3'
import { useCallback } from 'react'

export default function useOrderService() {
  const activeWeb3 = useActiveWeb3React()

  const { unionSDK } = useUnionSDK()

  const amIOnCorrectChainId = useCallback(
    (correctChainId) => {
      if (activeWeb3.chainId !== correctChainId) {
        throw new Error(`Please change your network to ${CHAIN_KEY[correctChainId].toUpperCase()}`)
        return 0
      }
      return correctChainId
    },
    [activeWeb3]
  )

  const validateItemId = useCallback(
    (itemId: ItemId | string) => {
      const { chainId: itemChainId } = parseUnionId(itemId)
      return amIOnCorrectChainId(itemChainId)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [amIOnCorrectChainId, activeWeb3]
  )

  const validateOrderId = useCallback(
    (orderId: OrderId | string) => {
      const [blockchain, orderHash] = orderId.split(':')
      const orderChainId = BLOCKCHAIN_TO_CHAINID[blockchain]
      return amIOnCorrectChainId(orderChainId)
    },
    [amIOnCorrectChainId]
  )

  /**
   * https://docs.rarible.org/reference/order/#list-nft-for-sale
   *
   * @param currency
   * @param creator
   * @param contract
   * @param itemId
   * @param price
   * @returns
   */
  const createSellOrder = useCallback(
    async (item: Item, currencyAmount: CurrencyAmount<Currency>, supply = 1) => {
      const itemChainId = validateItemId(item.id)
      if (!itemChainId) return
      const price = currencyAmount.toExact()
      const currency = toUnionCurrency(currencyAmount.currency)
      const creator = item.creators[0].account
      const platformFee = getPlatformFee(
        creator,
        activeWeb3.account,
        currencyAmount.currency.symbol,
        'SELL',
        itemChainId
      )
      // TODO: try to give empty `payouts` array
      // const payouts: Part[] = [{ account: toAddress(myAccount), value: 10000 }]
      const sellResponse = await unionSDK.order.sell({
        itemId: item.id,
      })
      const sellOrderId = await sellResponse.submit({
        amount: supply,
        price, // this accept number as well.
        currency,
        originFees: [platformFee],
        expirationDate: new Date(Date.now() + 3 * 30 * 24 * 3600 * 1000), // 3 months = 90 days
      })

      const { promise, cancel } = retry(
        async () => {
          const item = await unionSDK.apis.order.getOrderById({ id: sellOrderId })
          if (item?.id === sellOrderId) return item
          throw new RetryableError()
        },
        { n: 10, minWait: 2000, maxWait: 5000 }
      )
      return await promise
    },
    [validateItemId, activeWeb3?.account, unionSDK.order, unionSDK.apis.order]
  )

  const placeBid = useCallback(
    async (item: Item, currencyAmount: CurrencyAmount<Currency>, supply = 1) => {
      const itemChainId = validateItemId(item.id)
      if (!itemChainId) return
      const price = currencyAmount.toExact()
      const currency = toUnionCurrency(currencyAmount.currency)
      const creator = item.creators[0].account
      const platformFee = getPlatformFee(
        creator,
        activeWeb3.account,
        currencyAmount.currency.symbol,
        'SELL',
        itemChainId
      )
      const toSubmit = {
        amount: supply,
        price,
        currency,
        originFees: [platformFee],
      }
      const response = await unionSDK.order.bid({
        itemId: item.id,
      })
      // console.warn({ submitInfo: toSubmit, response })
      const orderId = await response.submit(toSubmit)
      // I THINK no need to wait here.
      return orderId
    },
    [activeWeb3?.account, unionSDK.order, validateItemId]
  )

  const cancelBid = useCallback(
    async (item: Item, order: Order) => {
      console.log({ item, order })
      const itemChainId = validateItemId(item.id)
      if (!itemChainId) return
      const cancelBidTx = await unionSDK.order.cancel
        .start({
          orderId: order.id,
        })
        .runAll()
      await cancelBidTx.wait()

      const { promise, cancel } = retry(
        async () => {
          const newItem = await unionSDK.apis.order.getOrderById({ id: order.id })
          if (newItem?.cancelled) return newItem
          throw new RetryableError()
        },
        { n: 5, minWait: 2000, maxWait: 5000 }
      )
      return await promise
    },
    [unionSDK.apis.order, unionSDK.order.cancel, validateItemId]
  )

  const acceptBid = useCallback(
    async (item: Item, order: Order, quantity = 1) => {
      // creatorId?: string, ownerId?: string, currency?: string
      const itemChainId = validateItemId(item.id)
      if (!itemChainId) return
      const acceptBidResponse = await unionSDK.order.acceptBid({
        order,
      })
      const acceptBidTx = await acceptBidResponse.submit({ amount: quantity, infiniteApproval: true })
      await acceptBidTx.wait()
      const bidderAddress = parseUnionId(order.maker).address

      const { promise, cancel } = retry(
        async () => {
          const ownershipId = `${item.id}:${bidderAddress}`
          console.warn({ ownershipId })
          try {
            const ownership = await unionSDK.apis.ownership.getOwnershipById({
              ownershipId,
            })
            return ownership
          } catch (e) {
            console.log('Ownership not changed.', e)
          }
          throw new RetryableError()
        },
        { n: 5, minWait: 2000, maxWait: 5000 }
      )
      return await promise
      // const price = currencyAmount.toExact()
      // const currency = toUnionCurrency(currencyAmount.currency)
      // const platformFee = getPlatformFeeOld(creator, myAccount, currencyAmount.currency.symbol, 'seller', itemChainId)
      // const toSubmit = {
      //   amount: 1,
      //   price,
      //   currency,
      //   originFees: [platformFee],
      // }
      // const response = await unionSDK.order.bid({
      //   itemId: item.id,
      // })
      // console.warn({ submitInfo: toSubmit, response })
      // const orderId = await response.submit(toSubmit)
      // return orderId
      // const platformFee = getPlatformFee(creatorId, ownerId, currency, 'seller')
      // const originFees: Part[] = [platformFee]
      // const payouts: Part[] = [{ account: toAddress(myAccount), value: 10000 }]
      // return await ethSDK.order.acceptBid({
      //   order: order as SimpleRaribleV2Order,
      //   payouts,
      //   originFees,
      //   amount: 1,
      //   infinite: true,
      // })
      // const acceptBidResponse = await sdk1.order.acceptBid({
      // 	orderId: bidOrderId,
      // })
      // let errorMessage
      // try {
      // 	const fillBidResult = await acceptBidResponse.submit({
      // 		amount: 1,
      // 		infiniteApproval: true,
      // 		itemId: toItemId(`${erc721Contract}:${tokenId}`),
      // 	})
      // 	await fillBidResult.wait()
      // } catch (e: any) {
      // 	errorMessage = e.message
      // }
    },
    [unionSDK.apis.ownership, unionSDK.order, validateItemId]
  )

  const matchOrder = useCallback(
    async (order: Order, currency: string, quantity = 1) => {
      const orderId = order.id
      const orderChainId = validateOrderId(orderId)
      if (!orderChainId) {
        return
      }

      const platformFee = getPlatformFee('', '', currency, 'BUY', orderChainId)
      const originFees = [platformFee]

      const fillAction = await unionSDK.order.buy({ orderId })
      const tx = await fillAction.submit({
        amount: quantity,
        originFees,
      })
      const txReceipt = await tx.wait()

      const expectedStock = parseInt(order.makeStock) - quantity

      const { promise, cancel } = retry(
        async () => {
          const newOrder = await unionSDK.apis.order.getOrderById({ id: orderId })
          const newMakeStock = parseInt(newOrder.makeStock)

          console.warn({ expectedStock, newMakeStock })

          if (expectedStock === newMakeStock) {
            // successfully matched.
            return newOrder
          }
          throw new RetryableError()
        },
        { n: 5, minWait: 2000, maxWait: 5000 }
      )
      await promise
      return txReceipt
    },
    [unionSDK.apis.order, unionSDK.order, validateOrderId]
  )

  const cancelOrder = useCallback(
    async (orderId: OrderId) => {
      const orderChainId = validateOrderId(orderId)
      if (!orderChainId) {
        return
      }
      const tx = await unionSDK.order.cancel.start({ orderId }).runAll()
      await tx.wait()

      const { promise, cancel } = retry(
        async () => {
          const newItem = await unionSDK.apis.order.getOrderById({ id: orderId })
          if (newItem?.cancelled) return newItem
          throw new RetryableError()
        },
        { n: 5, minWait: 2000, maxWait: 5000 }
      )
      return await promise
    },
    [unionSDK.apis.order, unionSDK.order.cancel, validateOrderId]
  )

  return {
    createSellOrder,
    cancelOrder,
    placeBid,
    matchOrder,
    acceptBid,
    cancelBid,
  }
}
