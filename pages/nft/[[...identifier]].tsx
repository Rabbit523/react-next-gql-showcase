import {
  BLOCKCHAIN_TO_URLSLUG,
  getAllItemsInCollection,
  getItem,
  isAddress,
  makeUnionAddress,
  NETWORK_SLUG_TO_CHAINID,
  NFTMALL_ERC721_ADDRESS,
  parseUnionId,
  toUnionItemId,
} from '@nftmall/sdk'
import { NFTPageSkeleton } from '@nftmall/uikit'
import { Item } from '@rarible/api-client'
import { ChainId } from '@sushiswap/core-sdk'
import NFTPageTemplate from 'app/features/nft/NFTTemplate'
import { useItem } from 'app/services/union-api/hooks'
import { REVALIDATE_2_HOUR, REVALIDATE_6_HOUR } from 'app/utils/constants'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { FC, useMemo } from 'react'

interface NFTPageProps {
  item: Item
  // itemChainId: ChainId
  // itemContractAddress: string
  // itemTokenId: string
}

const NFTPage: FC<NFTPageProps> = ({ item: itemServerSide }) => {
  const router = useRouter()
  // NOTE: we are doing this because rarible api can't run in node env.
  console.log(router)
  const [chainIdentifier, collectionIdentifier, tokenIdentifier] = router.query.identifier || []
  const chainId = NETWORK_SLUG_TO_CHAINID[chainIdentifier?.toLowerCase()]
  const collectionId = collectionIdentifier?.toLowerCase()
  const tokenId = tokenIdentifier?.toLowerCase()
  console.log({ chainId, collectionId, tokenId })
  // const { chainId, collectionId, tokenId } = props
  const unionItemId = useMemo(() => {
    try {
      if (chainId && collectionId && tokenId) {
        return toUnionItemId(chainId, collectionId, tokenId)
      }
    } catch (e) {
      console.error(e)
    }
  }, [chainId, collectionId, tokenId])

  const {
    data: item,
    isLoading: isItemLoading,
    error: itemLoadError,
    mutate,
  } = useItem({
    variables: { itemId: itemServerSide?.id || unionItemId },
    shouldFetch: !!(itemServerSide?.id || unionItemId),
    swrConfig: {
      refreshInterval: 30 * 1000,
      fallbackData: itemServerSide || undefined,
    },
  })
  if (itemLoadError) console.error(itemLoadError)
  console.warn({ itemServerSide, isItemLoading, itemLoadError })
  if (item) {
    return <NFTPageTemplate item={item} mutateItemSWR={mutate} />
  }
  // if (isItemLoading && !itemLoadError) {
  return <NFTPageSkeleton />
  // }
  // return <Text fontSize="xl">Something Went Wrong {JSON.stringify(itemLoadError)}</Text>
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { identifier } = context.params
  // 3 parts.     {chainKey}/{collectionId}/{tokenId}     nftmall.io/nft/bttc/0x123123/456456
  // 2 parts.     {chainKey}/{collectionId}:{tokenId}     nftmall.io/nft/bttc/0x123123:456456
  // 2 parts.     {collectionId}/{tokenId}                nftmall.io/nft/0x123123/456456
  // 2 parts.     {collectionSlug}/{tokenId}              nftmall.io/nft/cool-collection-slug/456456
  // 1 part.      {collectionId}:{tokenId}                nftmall.io/nft/0x123123:456456
  // 1 part.      {nftSlug}                               nftmall.io/nft/a-very-cool-nft-slug
  try {
    const [chainIdentifier, collectionIdentifier, tokenIdentifier] = identifier || []
    const itemChainId = NETWORK_SLUG_TO_CHAINID[chainIdentifier?.toLowerCase()]
    const itemContractAddress = isAddress(collectionIdentifier) // make checksumed address
    const itemTokenId = tokenIdentifier?.toLowerCase()
    console.log({ chainId: itemChainId, collectionId: itemContractAddress, tokenId: itemTokenId })

    // FIXME: @nftgeek remove this for multichain
    if (itemChainId && itemContractAddress && itemTokenId) {
      const item = await getItem(toUnionItemId(itemChainId, itemContractAddress, itemTokenId))
      if (item) {
        return {
          props: {
            item,
            itemChainId,
            itemContractAddress,
            itemTokenId,
          },
          revalidate: REVALIDATE_2_HOUR,
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
  return {
    props: {
      item: null,
      // itemChainId, // if `notFound` is true, all undefined props are sent to frontend. unnecessary.
      // itemContractAddress,
      // itemTokenId,
    },
    revalidate: REVALIDATE_6_HOUR,
    notFound: true,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  if (process.env.NODE_ENV !== 'production') return { paths: [], fallback: true }
  // NOTE: Build ISR for only NFTmall nft pages
  // const collections = NODE_ENV === 'production' ? [NFTMALL_ERC721_ADDRESS[ChainId.BTTC]] : []
  // FIXME: instead here, we should prerender recently listed items.
  return { paths: [], fallback: true }

  const collections = [NFTMALL_ERC721_ADDRESS[ChainId.THUNDERCORE].toLowerCase()]
  const promises = collections.map((col, index) => getAllItemsInCollection(makeUnionAddress(ChainId.THUNDERCORE, col)))
  const collectionsItems = await Promise.all(promises)
  console.log({ collectionsItems })
  // https://nextjs.org/docs/api-reference/data-fetching/get-static-paths
  let paths = []
  collectionsItems.forEach((items, index) => {
    paths = paths.concat(
      items.items.map((item) => {
        const parts = parseUnionId(item.id)
        return {
          params: {
            identifier: [BLOCKCHAIN_TO_URLSLUG[parts.blockchain], parts.contract, parts.tokenId],
          },
        }
      })
    )
  })
  console.log(JSON.stringify(paths, null, 2))
  // https://nextjs.org/docs/api-reference/data-fetching/get-static-paths#fallback-true
  // I think it's better to use `true` here.
  return { paths, fallback: true }
}

export default NFTPage
