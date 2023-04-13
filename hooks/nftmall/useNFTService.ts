import { delay, getItemURI, makeUnionAddress, parseUnionId, toUnionAccount } from '@nftmall/sdk'
import { Collection, ItemId, UnionAddress } from '@rarible/api-client'
import { MintType, TokenId } from '@rarible/sdk'
import { toContractAddress, toUnionAddress } from '@rarible/types'
import { ChainId } from '@sushiswap/core-sdk'
import { retry, RetryableError } from 'app/functions/retry'
import { useActiveWeb3React } from 'app/services/web3'
import { restAPI } from 'app/utils/rest'
import { useCallback } from 'react'

import useUnionSDK from '../../services/union-api/hooks/useUnionSDK'

export default function useNFTService() {
  const { account, chainId } = useActiveWeb3React()
  const { unionSDK } = useUnionSDK()

  const generateNextTokenId = useCallback(
    async (chainId: ChainId, collection: Collection, minter = account) => {
      const nextTokenId = await unionSDK.nft.generateTokenId({
        collection: toContractAddress(collection.id),
        minter: toUnionAddress(toUnionAccount(chainId, minter)),
      })
      return nextTokenId
    },
    [account, unionSDK?.nft]
  )

  const burn = useCallback(
    async (itemId: ItemId) => {
      const burnRequest = await unionSDK.nft.burn({ itemId })
      const tx = await burnRequest.submit({ amount: 1 })
      if (tx) {
        return await tx.wait()
      }
      const { promise, cancel } = retry(
        async () => {
          const item = await unionSDK.apis.item.getItemById({ itemId })
          if (item.deleted) return item
          throw new RetryableError()
        },
        { n: 5, minWait: 2000, maxWait: 5000 }
      )
      await promise
    },
    [unionSDK?.apis.item, unionSDK?.nft]
  )

  const transfer = useCallback(
    async (itemId: ItemId, receipentId: UnionAddress) => {
      // const asset: Erc721AssetType = {
      //   assetClass: 'ERC721',
      //   contract: toAddress(contract),
      //   tokenId,
      // }
      // await sdk.nft.transfer(asset, toAddress(receiverAddress), toBigNumber('1'))
      // return await tx.wait()
      const submission = await unionSDK.nft.transfer({
        itemId,
      })
      const tx = await submission.submit({ to: receipentId })
      await tx.wait()
      // TODO:
      const receiverAddress = parseUnionId(receipentId).address
      const { promise, cancel } = retry(
        async () => {
          const ownershipId = `${itemId}:${receiverAddress}`
          console.warn({ ownershipId })
          const ownership = await unionSDK.apis.ownership.getOwnershipById({ ownershipId })
          if (ownership) {
            // ok, transferred
            return true
          }
          throw new RetryableError()
        },
        { n: 5, minWait: 2000, maxWait: 5000 }
      )
      await promise
    },
    [unionSDK?.apis.ownership, unionSDK?.nft]
  )

  const mint = useCallback(
    async (
      collection: Collection,
      tokenId: TokenId,
      tokenURI: string,
      royalty: number,
      minter = account,
      supply = 1
    ) => {
      const action = await unionSDK.nft.mint({
        collection,
        tokenId,
      })
      const result = await action.submit({
        uri: tokenURI,
        creators: [
          {
            account: toUnionAddress(makeUnionAddress(ChainId.MAINNET, minter)),
            value: 10000,
          },
        ],
        royalties: [
          {
            account: toUnionAddress(makeUnionAddress(ChainId.MAINNET, minter)),
            value: royalty,
          },
        ],
        lazyMint: false,
        supply: supply,
      })
      if (result.type !== MintType.ON_CHAIN) {
        throw new Error('Must be on the same chain')
      }
      // submit tx
      // console.error('=========== Minting TX:', result.transaction, result)
      await result.transaction.wait()

      // retry until our indexer catches this minting event
      const { promise, cancel } = retry(
        async () => {
          const item = await unionSDK.apis.item.getItemById({ itemId: result.itemId })
          if (item) return item
          throw new RetryableError()
        },
        { n: 10, minWait: 2000, maxWait: 5000 }
      )
      let item = await promise
      console.warn(item)
      // alert('Got item' + item.id)

      // wait until the metadata is available...
      const { promise: metadataPromise } = retry(
        async () => {
          // notify `meta-loader` load new nft's metadata ASAP!
          await unionSDK.apis.item.resetItemMeta({ itemId: result.itemId })
          const serverItem = await unionSDK.apis.item.getItemById({ itemId: result.itemId })
          if (serverItem?.meta) return serverItem
          throw new RetryableError()
        },
        { n: 20, minWait: 2000, maxWait: 5000 }
      )
      try {
        item = await metadataPromise
        console.warn('Got item meta', item.meta)
      } catch (e) {
        // NOTE: here, item's metadata not found until 20 retries.
        // instead of failing, let's move onto the next steps
        console.error('Item metadata not recognized yet.', item)
      }
      // alert('Got item meta')

      // prebuild nft page #1095
      try {
        await restAPI.revalidateURI(getItemURI(item))
        delay(2_000)
      } catch (e) {
        console.error('Prebuilding nft page has failed', e)
      }
    },
    [account, unionSDK.apis.item, unionSDK.nft]
  )

  return { burn, generateNextTokenId, transfer, mint }
}
