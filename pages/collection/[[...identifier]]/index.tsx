import { Box } from '@chakra-ui/react'
import {
  isAddress,
  isUnionId,
  NETWORK_SLUG_TO_CHAINID,
  nextApiFetchers,
  NextCollection,
  parseUnionId,
  toUnionCollectionId,
} from '@nftmall/sdk'
import { Spinner } from '@nftmall/uikit'
import CollectionTemplate from 'app/features/collection/CollectionTemplate'
import { useNextCollection } from 'app/services/our-api/hooks'
import { REVALIDATE_1_HOUR, REVALIDATE_6_HOUR } from 'app/utils/constants'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import React, { FC, useMemo } from 'react'

interface CollectionPageProps {
  collection: NextCollection
}

const CollectionPage: FC<CollectionPageProps> = ({ collection: collectionFromServer }) => {
  const router = useRouter()

  const [chainIdentifier, collectionIdentifier] = router.query.identifier || []
  const blockchain = chainIdentifier?.toLowerCase()
  const chainId = NETWORK_SLUG_TO_CHAINID[blockchain]
  const collectionId = collectionIdentifier?.toLowerCase()

  const unionCollectionId = useMemo(() => {
    try {
      if (chainId && collectionId) {
        const uid = toUnionCollectionId(chainId, collectionId)
        if (isUnionId(uid)) return uid
        // throw new Error(`Invalid union id ${uid}`)
      }
    } catch (e) {
      console.error(e)
    }
  }, [chainId, collectionId])

  const {
    data: collection,
    isLoading: isNextCollectionLoading,
    error,
  } = useNextCollection({
    variables: { collectionId: unionCollectionId },
    shouldFetch: !!unionCollectionId,
    swrConfig: {
      refreshInterval: 120 * 1000, // once per 2 mins.
      fallbackData: collectionFromServer || undefined,
    },
  })
  // const { cache } = useSWRConfig()
  // console.log(cache)

  // console.warn({ collection, collectionFromServer })
  if (!collection) {
    return (
      <Box height="600px" position="relative">
        <Spinner />
      </Box>
    )
  }
  return <CollectionTemplate collection={collection} />
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { identifier } = context.params

  try {
    const [chainIdentifier, collectionIdentifier] = identifier || []
    const blockchain = chainIdentifier?.toLowerCase()
    // const chainId = NETWORK_SLUG_TO_CHAINID[blockchain]
    const collectionId = collectionIdentifier?.toLowerCase()

    // console.log({ p: context.params, blockchain, id })
    let collection = null
    let id

    if (blockchain && collectionId) {
      const chainId = NETWORK_SLUG_TO_CHAINID[blockchain]
      const addr = isAddress(collectionId)
      if (chainId && addr) {
        id = toUnionCollectionId(chainId, collectionId)
      }
    } else if (blockchain && !collectionId) {
      // then it may be a slug
      id = blockchain
    } else {
      // TODO: this is the case when user visits `/collection/`
      // we can display more meaningful content instead of 404 here
    }
    if (id) {
      collection = await nextApiFetchers.collection.getById(id)
      if (collection?.id) {
        // valid response
        return {
          props: {
            collection,
          },
          revalidate: REVALIDATE_1_HOUR,
        }
      }
    }
    // invalid data
    throw new Error('Invalid path args given')
  } catch (e) {
    console.error('=========COLLECTION PAGE: getStaticProps: Error', context, e)
  }
  return {
    props: {
      collection: null,
    },
    revalidate: REVALIDATE_6_HOUR,
    notFound: true,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  if (process.env.NODE_ENV !== 'production') return { paths: [], fallback: true }
  let paths = []
  // if (NODE_ENV !== 'production') return { paths: [], fallback: 'blocking' }
  try {
    const data = await nextApiFetchers.collection.topCollections({
      count: 12,
      needGoodCollection: true,
      hasMetadata: true,
    })
    paths = data.map((collection: NextCollection) => {
      const parsed = parseUnionId(collection.id)
      return {
        params: {
          identifier: [parsed.blockchainSlug, parsed.lowercaseAddress],
        },
      }
    })
  } catch (e) {
    // can report to sentry
    console.error('=========COLLECTION PAGE: getStaticPaths Failed', e)
  }
  console.log('=========COLLECTION PAGE===========', paths)
  return { paths, fallback: true }
}

export default CollectionPage
