import { ApolloClient, gql, HttpLink, InMemoryCache, split } from '@apollo/client'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { AccountType, User } from '@prisma/client'
import { SubscriptionClient } from 'subscriptions-transport-ws'

export const MAX_QUERY_SIZE = 1000
export const MAX_PAGE = 10000
export const PAGE_SIZE = 24

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_HASURA_GQL_API,
})

const createWSLink = () => {
  return new WebSocketLink(
    new SubscriptionClient(process.env.NEXT_PUBLIC_HASURA_WEBSOCKET, {
      lazy: true,
      reconnect: true,
    })
  )
}

export const client = new ApolloClient({
  ssrMode: typeof window === 'undefined',
  link: httpLink,
  cache: new InMemoryCache(),
})

export function createApolloClient() {
  const link =
    typeof window !== 'undefined'
      ? split(
          ({ query }) => {
            const definition = getMainDefinition(query)
            return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
          },
          createWSLink(),
          httpLink
        )
      : httpLink
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link,
    cache: new InMemoryCache(),
  })
}
class ApolloAPI {
  // NOTE: fetching currency data from DB. DB updates currency info by 10mins.
  async fetchCoinExchangeRate() {
    const { data } = await client.query({
      query: CURRENCY_RATE_QUERY,
    })
    return data.Currency
  }
  // NOTE: USER / COLLECTION related apis
  async fetchUser(userId: string, skipCache = false): Promise<User[]> {
    const { data } = await client.query({
      query: USER_BY_ID_QUERY,
      variables: {
        userId,
      },
      fetchPolicy: skipCache ? 'no-cache' : undefined,
    })

    return data.User
  }
  async fetchAllCollections() {
    const { data } = await client.query({
      query: COLLECTIONS_ALL_QUERY,
    })

    return data.User
  }
  async fetchHotCollections() {
    const { data } = await client.query({
      query: COLLECTIONS_BY_FEATURED_QUERY,
    })

    return data.User
  }
  async fetchCollectionByID(collectionId: string) {
    const { data } = await client.query({
      query: COLLECTION_BY_ID_QUERY,
      variables: {
        collectionId,
      },
    })
    return data.User
  }
  async fetchFeaturedUsers(limit: number) {
    const { data } = await client.query({
      query: USER_FEATURED_QUERY,
      variables: {
        limit,
      },
    })

    return data.User
  }
  async fetchFollowers(userId: string, offset: number, limit: number) {
    const { data } = await client.query({
      query: USER_BY_FOLLOWER_QUERY,
      variables: {
        userId,
        offset,
        limit,
      },
    })
    return data.User[0].followers
  }
  async fetchFollowing(userId: string, offset: number, limit: number) {
    const { data } = await client.query({
      query: USER_BY_FOLLOWING_QUERY,
      variables: {
        userId,
        offset,
        limit,
      },
    })
    return data.User[0].following
  }
  async fetchUserById(userId: string) {
    const { data } = await client.query({
      query: PROFILE_BY_ID_QUERY,
      variables: {
        userId,
      },
    })
    return data
  }
  // NOTE: NFT related apis
  async fetchNFTByCreator(creatorId: string, offset: number, limit: number) {
    const { data } = await client.query({
      query: NFTS_BY_CREATOR_QUERY,
      variables: {
        creatorId,
        offset,
        limit,
      },
    })

    return data.nft
  }
  async fetchNFTByOwner(ownerId: string, offset: number, limit: number) {
    const { data } = await client.query({
      query: NFTS_BY_OWNER_QUERY,
      variables: {
        ownerId,
        offset,
        limit,
      },
    })
    return data.nft
  }
  async fetchNFTByLiked(userId: string, offset: number, limit: number) {
    const { data } = await client.query({
      query: NFTS_BY_LIKED_QUERY,
      variables: {
        userId,
        offset,
        limit,
      },
    })
    return data.nft
  }
  async fetchNFTBySale(userId: string, offset: number, limit: number) {
    const { data } = await client.query({
      query: NFTS_BY_SALE_QUERY,
      variables: {
        userId,
        offset,
        limit,
      },
    })
    return data.nft
  }
  async fetchFeaturedNFTs(limit: number) {
    const { data } = await client.query({
      query: NFTS_BY_FEATURED_QUERY,
      variables: {
        limit,
      },
    })
    return data.nft
  }
  async fetchRecentNFTs(offset: number, limit: number) {
    const { data } = await client.query({
      query: NFTS_BY_RECENT_QUERY,
      variables: {
        offset,
        limit,
      },
    })
    return data.nft
  }
  async fetchNFTById(nftId: string) {
    const { data } = await client.query({
      query: NFT_BY_NFTID_QUERY,
      variables: {
        nftId,
      },
    })
    return data.nft[0]
  }
  async fetchNFTBySlug(slug: string) {
    const { data } = await client.query({
      query: NFT_BY_SLUG_QUERY,
      variables: {
        slug,
      },
    })
    return data.nft[0]
  }
  // NOTE: Search related apis
  async searchUsers(search: string, type: AccountType) {
    const { data } = await client.query({
      query: SEARCH_SIMILAR_USER_QUERY,
      variables: {
        hash: `%${search}%`,
        type,
      },
    })

    return data.User
  }

  async searchNFTs(search: string) {
    const { data } = await client.query({
      query: SEARCH_SIMILAR_NFT_QUERY,
      variables: {
        hash: `%${search}%`,
      },
    })

    return data.nft
  }
}

// NOTE: Define fields and fragments for query model
export const userFields = () => gql`
  fragment userFields on User {
    chainId
    userId
    address
    accountType
    name
    username
    email
    isEmailVerified
    phone
    isPhoneVerified
    bio
    avatar
    coverImage
    canReceiveEmailNotifications
    canReceiveSMSNotifications
    canReceivePushNotifications
    links
    blacklisted
    featured
    createdAt
    updatedAt
    userVersion
    verified
  }
`
export const orderFields = () => gql`
  fragment orderFields on Order {
    chainId
    orderId
    nftId
    originalOrderData
    sellOrder
    data
    make
    makerId
    makeStock
    makeTokenContract
    makeTokenId
    makeValueCurrency
    take
    takeStock
    takeTokenContract
    takeTokenId
    takeValueCurrency
    salt
    start
    end
    signature
    type
    active
    cancelled
    completed
    sold
    fill
    affiliateFee
    createdAt
    updatedAt
    maker: User {
      ...userFields
    }
    nft {
      ownerId
    }
  }
`
export const nftFields = () => gql`
  fragment nftFields on nft {
    chainId
    nftId
    collectionId
    tokenId
    creatorId
    ownerId
    tokenURI
    metadata
    name
    slug
    description
    image
    cdnImage
    royalties
    width
    height
    duration
    mimeType
    lockedContent
    blacklisted
    deleted
    tagId
    likesCount
    nftVersion
    createdAt
    updatedAt
    orders: Orders(where: { active: { _eq: true }, completed: { _eq: false }, cancelled: { _eq: false } }) {
      ...orderFields
    }
  }
  ${orderFields()}
`
export const auctionFields = () => gql`
  fragment auctionFields on Auction {
    chainId
    wonBidId
    auctionId
    collectionId
    createdAt
    currencyId
    endDate
    extended
    inProgress
    initEndDate
    makerId
    minPrice
    nftId
    startDate
    status
    type
    updatedAt
    maker: userByMakerid {
      ...userFields
    }
    order: Order {
      ...orderFields
    }
    nft {
      ...nftFields
    }
  }
`
export const nftFragment = () => gql`
  fragment nftFragment on nft {
    ...nftFields
    creator: userByCreatorid {
      ...userFields
      followers: UserfollowsByB {
        user: User {
          ...userFields
        }
      }
    }
    owner: userByOwnerid {
      ...userFields
    }
    likedBy: _NFTLikes {
      User {
        ...userFields
      }
    }
    auctions: Auctions(where: { inProgress: { _eq: true } }) {
      ...auctionFields
    }
  }
  ${auctionFields()}
  ${nftFields()}
  ${userFields()}
`
export const userFragment = () => gql`
  fragment userFragment on User {
    ...userFields
    followers: UserfollowsByB {
      user: User {
        ...userFields
      }
    }
    following: _UserFollows {
      user: userByB {
        ...userFields
      }
    }
    likes: _NFTLikes {
      nft {
        ...nftFragment
      }
    }
    created: nftsByCreatorid(
      where: { blacklisted: { _eq: false }, deleted: { _eq: false } }
      order_by: { updatedAt: desc }
    ) {
      ...nftFragment
    }
    collected: nftsByOwnerid(
      where: { blacklisted: { _eq: false }, deleted: { _eq: false } }
      order_by: { updatedAt: desc }
    ) {
      ...nftFragment
    }
    sale: nftsByOwnerid(
      where: {
        blacklisted: { _eq: false }
        deleted: { _eq: false }
        _or: [
          { Orders: { active: { _eq: true }, sellOrder: { _eq: true } } }
          { Auctions: { inProgress: { _eq: true } } }
        ]
      }
      order_by: { updatedAt: desc }
    ) {
      ...nftFragment
    }
  }
  ${userFields()}
  ${nftFragment()}
  ${orderFields()}
`

// NOTE: Currency related query builder
export const CURRENCY_RATE_QUERY = gql`
  query AllCurrencies {
    Currency {
      address
      chainId
      currencyId
      decimals
      name
      rate
      symbol
      usdPrice
    }
  }
`

// NOTE: COLLECTION related query builder
export const COLLECTIONS_ALL_QUERY = gql`
  query AllCollections {
    User(where: { blacklisted: { _eq: false }, accountType: { _eq: "COLLECTION" } }) {
      ...userFields
    }
  }
  ${userFields()}
`
export const COLLECTION_ROUTES_QUERY = gql`
  query AllCollectionNames {
    User(where: { accountType: { _eq: "COLLECTION" } }) {
      username
      address
    }
  }
`
export const COLLECTIONS_BY_FEATURED_QUERY = gql`
  query FeaturedCollections {
    User(where: { featured: { _eq: true }, accountType: { _eq: "COLLECTION" } }) {
      ...userFields
    }
  }
  ${userFields()}
`
export const COLLECTION_BY_ID_QUERY = gql`
  query CollectionByCollectionId($collectionId: String) {
    User(where: { userId: { _eq: $collectionId }, accountType: { _eq: "COLLECTION" } }) {
      ...userFields
      configAppendTokenIdToName
      configEnablePhysicalNFT
      configShowCreator
      configCommonRoyalty
      configCommonCreatorId
    }
  }
  ${userFields()}
`
export const COLLECTION_BY_COLLECTION_NAME_QUERY = gql`
  query CollectionByCollectionName($collectionName: String) {
    User(where: { username: { _eq: $collectionName }, accountType: { _eq: "COLLECTION" } }) {
      ...userFields
    }
  }
  ${userFields()}
`

// NOTE: USER related query builder
export const PROFILE_BY_ID_QUERY = gql`
  query ProfileByUserId($userId: String) {
    User(where: { userId: { _eq: $userId }, accountType: { _eq: "USER" } }) {
      ...userFields
      followers: UserfollowsByB {
        user: User {
          ...userFields
        }
      }
      following: _UserFollows {
        user: userByB {
          ...userFields
        }
      }
    }
  }
  ${userFields()}
`
export const PROFILE_BY_USERNAME_QUERY = gql`
  query ProfileByUserName($username: String) {
    User(where: { username: { _eq: $username }, accountType: { _eq: "USER" } }) {
      ...userFields
      followers: UserfollowsByB {
        user: User {
          ...userFields
        }
      }
      following: _UserFollows {
        user: userByB {
          ...userFields
        }
      }
    }
  }
  ${userFields()}
`
export const PROFILE_DETAIL_SUBSCRIPTION = gql`
  subscription getUserData($username: String, $userId: String) {
    User(
      where: {
        userId: { _eq: $userId }
        username: { _eq: $username }
        blacklisted: { _eq: false }
        accountType: { _eq: "USER" }
      }
    ) {
      ...userFields
      followers: UserfollowsByB {
        user: User {
          ...userFields
        }
      }
      following: _UserFollows {
        user: userByB {
          ...userFields
        }
      }
    }
  }
  ${userFields()}
`
export const USER_BY_ID_QUERY = gql`
  query UserByUserId($userId: String) {
    User(where: { userId: { _eq: $userId }, blacklisted: { _eq: false }, accountType: { _eq: "USER" } }) {
      ...userFields
    }
  }
  ${userFields()}
`
export const USER_FEATURED_QUERY = gql`
  query UsersByFeatured($limit: Int) {
    User(
      limit: $limit
      where: { featured: { _eq: true }, blacklisted: { _eq: false }, accountType: { _eq: "USER" } }
      order_by: { updatedAt: desc }
    ) {
      ...userFragment
    }
  }
  ${userFragment()}
`
export const USER_ROUTES_QUERY = gql`
  query {
    User(
      where: {
        blacklisted: { _eq: false }
        accountType: { _eq: "USER" }
        _or: [{ name: { _neq: "" } }, { username: { _neq: "" } }, { bio: { _neq: "" } }]
      }
    ) {
      username
      address
    }
  }
`
export const USER_BY_FOLLOWER_QUERY = gql`
  query UserByFollower($userId: String, $offset: Int, $limit: Int) {
    User(where: { userId: { _eq: $userId }, accountType: { _eq: "USER" } }, offset: $offset, limit: $limit) {
      followers: UserfollowsByB {
        user: User {
          ...userFields
          following: _UserFollows {
            user: userByB {
              ...userFields
            }
          }
        }
      }
    }
  }
  ${userFields()}
`
export const USER_BY_FOLLOWING_QUERY = gql`
  query UserByFollower($userId: String, $offset: Int, $limit: Int) {
    User(where: { userId: { _eq: $userId }, accountType: { _eq: "USER" } }, offset: $offset, limit: $limit) {
      following: _UserFollows {
        user: userByB {
          ...userFields
          following: _UserFollows {
            user: userByB {
              ...userFields
            }
          }
        }
      }
    }
  }
  ${userFields()}
`

// NOTE: NFT related query builder
export const ALL_NFTS_SLUG_QUERY = gql`
  query AllNFTSlugs($collectionIds: [String!]) {
    nft(
      where: {
        blacklisted: { _eq: false }
        deleted: { _eq: false }
        userByCreatorid: { blacklisted: { _eq: false } }
        collectionId: { _in: $collectionIds }
      }
    ) {
      slug
      nftId
    }
  }
`
export const NFTS_BY_FEATURED_QUERY = gql`
  query NFTSByFeatured($limit: Int) {
    nft(
      limit: $limit
      order_by: { updatedAt: desc }
      where: {
        blacklisted: { _eq: false }
        deleted: { _eq: false }
        collectionId: { _eq: "0xa8f9890df31adb87bb006b3c4767957f712cff3d" }
        creatorId: { _neq: "" }
        ownerId: { _neq: "" }
      }
    ) {
      ...nftFragment
    }
  }
  ${nftFragment()}
`
export const NFTS_BY_RECENT_QUERY = gql`
  query NFTSByRecent($offset: Int, $limit: Int) {
    nft(
      offset: $offset
      limit: $limit
      order_by: { updatedAt: desc }
      where: {
        blacklisted: { _eq: false }
        deleted: { _eq: false }
        userByCreatorid: { blacklisted: { _eq: false } }
        _or: [
          { Orders: { active: { _eq: true }, sellOrder: { _eq: true } } }
          { Auctions: { inProgress: { _eq: true }, type: { _eq: "TIMED" } } }
        ]
      }
    ) {
      ...nftFragment
    }
  }
  ${nftFragment()}
`
export const NFTS_BY_CREATOR_QUERY = gql`
  query NFTSByCreatorId($creatorId: String, $offset: Int, $limit: Int) {
    nft(
      where: { creatorId: { _eq: $creatorId }, deleted: { _eq: false }, blacklisted: { _eq: false } }
      order_by: { updatedAt: desc }
      offset: $offset
      limit: $limit
    ) {
      ...nftFragment
    }
  }
  ${nftFragment()}
`
export const NFTS_BY_OWNER_QUERY = gql`
  query NFTSByOwnerId($ownerId: String, $offset: Int, $limit: Int) {
    nft(
      where: {
        ownerId: { _eq: $ownerId }
        deleted: { _eq: false }
        creatorId: { _neq: $ownerId }
        blacklisted: { _eq: false }
      }
      order_by: { updatedAt: desc }
      offset: $offset
      limit: $limit
    ) {
      ...nftFragment
    }
  }
  ${nftFragment()}
`
export const NFT_BY_NFTID_QUERY = gql`
  query NFTByNFTId($nftId: String) {
    nft(where: { nftId: { _eq: $nftId }, deleted: { _eq: false }, blacklisted: { _eq: false } }) {
      chainId
      nftId
      collectionId
      tokenId
      creatorId
      ownerId
      tokenURI
      metadata
      name
      slug
      description
      image
      cdnImage
      royalties
      width
      height
      duration
      mimeType
      lockedContent
      blacklisted
      deleted
      tagId
      likesCount
      nftVersion
      createdAt
      updatedAt
      creator: userByCreatorid {
        ...userFields
        followers: UserfollowsByB {
          user: User {
            ...userFields
          }
        }
      }
      owner: userByOwnerid {
        ...userFields
      }
    }
  }
  ${userFields()}
`
export const NFT_BY_SLUG_QUERY = gql`
  query NFTBySlug($slug: String) {
    nft(where: { slug: { _eq: $slug }, deleted: { _eq: false }, blacklisted: { _eq: false } }) {
      chainId
      nftId
      collectionId
      tokenId
      creatorId
      ownerId
      tokenURI
      metadata
      name
      slug
      description
      image
      cdnImage
      royalties
      width
      height
      duration
      mimeType
      lockedContent
      blacklisted
      deleted
      tagId
      likesCount
      nftVersion
      createdAt
      updatedAt
      creator: userByCreatorid {
        ...userFields
        followers: UserfollowsByB {
          user: User {
            ...userFields
          }
        }
      }
      owner: userByOwnerid {
        ...userFields
      }
    }
  }
  ${userFields()}
`
export const NFT_DETAIL_SUBSCRIPTION = gql`
  subscription getNFTData($slug: String) {
    nft(where: { slug: { _eq: $slug }, deleted: { _eq: false }, blacklisted: { _eq: false } }) {
      ...nftFragment
    }
  }
  ${nftFragment()}
`
export const NFT_DETAIL_QUERY = gql`
  query getNFTData($slug: String) {
    nft(
      where: { slug: { _eq: $slug }, deleted: { _eq: false }, blacklisted: { _eq: false } }
      order_by: { updatedAt: desc }
    ) {
      ...nftFragment
    }
  }
  ${nftFragment()}
`
export const NFTS_MORE_BY_CREATOR_QUERY = gql`
  query NFTSByCreatorId($creatorId: String, $slug: String) {
    nft(
      where: {
        creatorId: { _eq: $creatorId }
        deleted: { _eq: false }
        blacklisted: { _eq: false }
        slug: { _neq: $slug }
        _or: [
          { Orders: { active: { _eq: true }, sellOrder: { _eq: true } } }
          { Auctions: { inProgress: { _eq: true }, type: { _eq: "TIMED" } } }
        ]
      }
      order_by: { updatedAt: desc }
    ) {
      ...nftFragment
    }
  }
  ${nftFragment()}
`
export const NFTS_BY_LIKED_QUERY = gql`
  query NFTByUserId($userId: String, $offset: Int, $limit: Int) {
    nft(
      where: { blacklisted: { _eq: false }, _NFTLikes: { User: { userId: { _eq: $userId } } } }
      order_by: { updatedAt: desc }
      offset: $offset
      limit: $limit
    ) {
      ...nftFragment
    }
  }
  ${nftFragment()}
`
export const NFTS_BY_SALE_QUERY = gql`
  query NFTBySale($userId: String, $offset: Int, $limit: Int) {
    nft(
      where: {
        blacklisted: { _eq: false }
        deleted: { _eq: false }
        ownerId: { _eq: $userId }
        _or: [
          { Orders: { active: { _eq: true }, sellOrder: { _eq: true } } }
          { Auctions: { inProgress: { _eq: true } } }
        ]
      }
      order_by: { updatedAt: desc }
      offset: $offset
      limit: $limit
    ) {
      ...nftFragment
    }
  }
  ${nftFragment()}
`

// NOTE: Search related query builder
export const SEARCH_SIMILAR_USER_QUERY = gql`
  query SearchUsers($hash: String, $type: accounttype) {
    User(where: { accountType: { _eq: $type }, blacklisted: { _eq: false }, name: { _ilike: $hash } }, limit: 3) {
      ...userFields
      followers: UserfollowsByB {
        user: User {
          ...userFields
        }
      }
    }
  }
  ${userFields()}
`
export const SEARCH_SIMILAR_NFT_QUERY = gql`
  query SearchNFTs($hash: String) {
    nft(
      where: {
        name: { _ilike: $hash }
        blacklisted: { _eq: false }
        deleted: { _eq: false }
        userByCreatorid: { blacklisted: { _eq: false } }
      }
      order_by: { updatedAt: desc }
      limit: 3
    ) {
      ...nftFields
      auctions: Auctions(where: { inProgress: { _eq: true } }) {
        ...auctionFields
      }
      creator: userByCreatorid {
        ...userFields
      }
      owner: userByOwnerid {
        ...userFields
      }
    }
  }
  ${nftFields()}
  ${auctionFields()}
  ${userFields()}
`

export const apolloAPI = new ApolloAPI()
