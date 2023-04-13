import {
  CollectionStats,
  getFileExtension,
  makeIpfsProtocolURL,
  makeTokenURI,
  NFTFilterDto,
  NFTFilterRes,
  NftTransferHistory,
  PinataResponse,
  UserFilterDto,
} from '@nftmall/sdk'
import { OrderSignature } from '@nftmall/uikit'
import { Auction, NFT, Order, User } from '@prisma/client'
import axios from 'axios'

axios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.data) {
      if (error.response.status) {
        error.response.data.status = error.response.status
      }
      return Promise.reject(error.response.data)
    }
    return Promise.reject(error)
  }
)

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
const MORALIS_APP_ID = process.env.NEXT_PUBLIC_MORALIS_APP_ID
const MORALIS_SERVER_URL = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY

interface updateUserAPIRes {
  user: User
}

interface VerificationRes {
  verification: boolean
}

interface LaunchpadSigRes {
  signature: string
  timestamp: number
}

export interface UserTabCounts {
  collected: number
  created: number
  followers: number
  followings: number
  likes: number
  sales: number
}
class ApiService {
  createUser(address: string) {
    return new Promise<User>((resolve, reject) => {
      axios
        .post(`${BACKEND_URL}/users`, { user: { address } })
        .then((response) => {
          resolve(response.data.user)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  updateUser(data: any, sig: any) {
    return new Promise<updateUserAPIRes>((resolve, reject) => {
      axios
        .put(`${BACKEND_URL}/user`, { user: data, ...sig })
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  updateCloudinaryImage(data: FormData) {
    return new Promise<updateUserAPIRes>((resolve, reject) => {
      axios
        .post(`${BACKEND_URL}/profiles/updateImage`, data)
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
  async makeFollowUser(data: any) {
    try {
      const response = await axios.post(`${BACKEND_URL}/profiles/${data.to}/follow`, data)
      return response.data
    } catch (error) {
      return error
    }
  }

  async makeUnfollowUser(data: any) {
    try {
      const response = await axios.post(`${BACKEND_URL}/profiles/${data.to}/unfollow`, data)
      return response.data
    } catch (error) {
      return error
    }
  }

  getNextTokenID(address: string, chainId: number, collectionId: string) {
    return new Promise<any>((resolve, reject) => {
      axios
        .get(
          `${MORALIS_SERVER_URL}/functions/getNextTokenId?_ApplicationId=${MORALIS_APP_ID}&address=${address}&chainId=${chainId}&collectionId=${collectionId}`
        )
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  createNFT(data: any) {
    return new Promise<NFT>((resolve, reject) => {
      axios
        .post(`${BACKEND_URL}/nfts`, { nft: data })
        .then((response) => {
          resolve(response.data.nft)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  createNFTOrder(data: any) {
    return new Promise<Order>((resolve, reject) => {
      axios
        .post(`${BACKEND_URL}/orders`, { order: data })
        .then((response) => {
          resolve(response.data.order)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  createAuction(data: any) {
    return new Promise<Auction>((resolve, reject) => {
      axios
        .post(`${BACKEND_URL}/auctions`, data)
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  cancelAuction(auctionId: string, data: any) {
    return new Promise((resolve, reject) => {
      axios
        .post(`${BACKEND_URL}/auction/${auctionId}`, data)
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  /**
   * @param tokenAddress nft token address
   * @param tokenId nft token id
   * @param chainId nft chain id
   * @returns nft transfer history
   */
  getNftTransfers(tokenAddress: string, tokenId: string, chainId: number) {
    return new Promise<NftTransferHistory[]>((resolve, reject) => {
      axios
        .get(`${BACKEND_URL}/nft/${tokenAddress}/${tokenId}/${chainId}/transfers`)
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  getCollectionStats(collectionId: string) {
    return new Promise<CollectionStats>((resolve, reject) => {
      axios
        .get(`${BACKEND_URL}/${collectionId}/stats`)
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  async makeLikeNFT(data: any) {
    try {
      const response = await axios.post(`${BACKEND_URL}/nfts/${data.slug}/like`, data)
      return response.data
    } catch (error) {
      return error
    }
  }

  async makeUnlikeNFT(data: any) {
    try {
      const response = await axios.post(`${BACKEND_URL}/nfts/${data.slug}/unlike`, data)
      return response.data
    } catch (error) {
      return error
    }
  }

  verifyOwnership(data: any) {
    return new Promise<VerificationRes>((resolve, reject) => {
      axios
        .post(`${BACKEND_URL}/v1/ownership/${data.nftId}`, data)
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
  refreshMetadata(slug: string) {
    axios.get(`${BACKEND_URL}/nfts/${slug}/refresh`)
  }

  pinFileToIPFS(data, wrapWithDirectory = true) {
    if (wrapWithDirectory) {
      const pinataOptions = JSON.stringify({
        wrapWithDirectory,
      })
      data.append('pinataOptions', pinataOptions)
    }
    return new Promise<PinataResponse>((resolve, reject) => {
      axios
        .post(`https://api.pinata.cloud/pinning/pinFileToIPFS`, data, {
          maxContentLength: -1,
          headers: {
            'Content-Type': 'multipart/form-data;',
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
            // path: 'nft',
          },
        })
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
  /**
   * pin nft image to ipfs and return ipfs protocol url
   * @param file user uploaded file
   * @param wrapWithDirectory whether to wrap in dir or not
   * @returns "ipfs://QmeJ9bqXWWwv3DzE9eRqvcAUPzwXDiqEAjwbkQeG7531e7/nft.jpg"
   */
  async pinFile(file: File, wrapWithDirectory = true) {
    const data = new FormData()
    // TODO: better file naming for collection
    const fileNameToUpload = 'nft.' + getFileExtension(file.name) // nft.jpg, nft.mp4
    data.append('file', file, fileNameToUpload)

    const res = await this.pinFileToIPFS(data, wrapWithDirectory)
    return makeIpfsProtocolURL(res.IpfsHash, fileNameToUpload)
  }

  /**
   * pin metadata json to ipfs and return its path (i.e tokenURI)
   * "QmXbNWPyyc8xSs6pDUPfCC2PffXvdKh2bFcYzwhHpNgR3Q/metadata.json"
   * @param metadata nft metadata
   * @param wrapWithDirectory whether to wrap in dir or not
   * @returns tokenURI
   */
  async pinMetadata(metadata, wrapWithDirectory = true) {
    const fileNameToUpload = 'metadata.json'
    const jsonString = JSON.stringify(metadata)
    const file = new File([jsonString], 'metadata.json', { type: 'text/json' })
    const data = new FormData()
    data.append('file', file, fileNameToUpload)
    const res = await this.pinFileToIPFS(data, wrapWithDirectory)
    return makeTokenURI(res.IpfsHash)
  }

  /**
   * Unused.  we instead pin metadata as json file
   * @param data
   * @returns
   */
  pinJSONToIPFS(data: any) {
    return new Promise<PinataResponse>((resolve, reject) => {
      axios
        .post(
          `https://api.pinata.cloud/pinning/pinJSONToIPFS`,
          {
            // pinataOptions: {
            //   wrapWithDirectory: true,
            // },
            pinataMetadata: {
              name: 'metadata.json',
            },
            pinataContent: data,
          },
          {
            headers: {
              pinata_api_key: PINATA_API_KEY,
              pinata_secret_api_key: PINATA_SECRET_API_KEY,
            },
          }
        )
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  async subscribe(email: string) {
    return new Promise((resolve, reject) => {
      axios
        .post(`${BACKEND_URL}/newsletter-subscribe`, { email })
        .then((res) => resolve(res.data))
        .catch((e) => reject(e))
    })
  }

  async fetchCoinExchangeRate() {
    try {
      const res = await axios.get(process.env.NEXT_PUBLIC_COINGECKO_URL)
      return res.data
    } catch (err) {
      return err
    }
  }

  async orderSignature(data: OrderSignature) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/nft/order-signature`, data)
      return response.data
    } catch (error) {
      return error
    }
  }

  async lockedSignature(tokenID, message, sig) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/nft/locked-signature`, {
        tokenID,
        message,
        sig,
      })
      return response.data
    } catch (error) {
      return error
    }
  }

  async getUnlockSignature(tokenID, sig) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/nft/unlocked-signature`, {
        tokenID,
        sig,
      })
      return response.data
    } catch (error) {
      return error
    }
  }

  async bidSignature(data: OrderSignature) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/nft/bid-signature`, data)
      return response.data
    } catch (error) {
      return error
    }
  }

  async checkAcceptBidRequest(txHash: string, network: string) {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/nft/check-bid-transaction`, {
        txHash,
        network,
      })
      return response.data
    } catch (error) {
      return error
    }
  }

  async sendReport(email: string, description: string, url: string) {
    try {
      const response = await axios.post(`${BACKEND_URL}/reports`, { email, description, url })
      return response.data
    } catch (error) {
      return error
    }
  }

  async createCBCheckout(checkout) {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_COINBASE_CHECKOUTS_URL}`, checkout, {
        headers: {
          'Content-Type': 'application/json',
          'X-CC-Version': '2018-03-22',
          'X-CC-Api-Key': process.env.NEXT_PUBLIC_COINBASE_API_KEY,
        },
      })
      return response.data
    } catch (error) {
      return error
    }
  }

  async registerOrder(order) {
    try {
      const response = await axios.post(`${BACKEND_URL}/commerce`, order, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      return error
    }
  }

  filterNFTs(data: NFTFilterDto) {
    return new Promise<NFTFilterRes>((resolve, reject) => {
      axios
        .post(`${BACKEND_URL}/nft/filter`, data)
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  filterUsers(data: UserFilterDto) {
    return new Promise<NFTFilterRes>((resolve, reject) => {
      axios
        .post(`${BACKEND_URL}/user/filter`, data)
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  getUserDetailDataCount(address: string) {
    return new Promise<UserTabCounts>((resolve, reject) => {
      axios
        .get(`${BACKEND_URL}/user/${address}`)
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  getLaunchpadSignature(project_id: string, collection_id: string, minter: string, amount: number) {
    return new Promise<LaunchpadSigRes>((resolve, reject) => {
      axios
        .post(`${BACKEND_URL}/v1/launchpad/${project_id}/${collection_id}/getsignature`, { minter, amount })
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  resolveDomain(domain: string) {
    return new Promise<any>((resolve, reject) => {
      axios
        .get(`${BACKEND_URL}/v1/resolve/${domain}/`)
        .then((response) => {
          resolve(response.data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  revalidateURI(uri: string) {
    return axios.get('/api/revalidate', {
      params: {
        secret: process.env.NEXT_PUBLIC_PAGE_REVALIDATION_TOKEN,
        uri: uri,
      },
    })
  }
}

export const restAPI = new ApiService()
