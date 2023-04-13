import { NFT, User } from '@prisma/client'
import { ethers } from 'ethers'
import { restAPI } from '../../utils/rest'

export const signTypedRequest = async (
  provider: any,
  account: string,
  message: string
): Promise<{ v: number; r: string; s: string }> => {
  return await provider.send('eth_signTypedData_v4', [account, message])
}

/**
 * BSC Wallet requires a different sign method
 * @see https://docs.binance.org/smart-chain/wallet/wallet_api.html#binancechainbnbsignaddress-string-message-string-promisepublickey-string-signature-string
 */
export const signMessage = async (provider: any, account: string, message: string): Promise<string> => {
  // FIXME: pancake's `window.BinanceChain` throws linting error here

  const anyWindow = window as any
  if (anyWindow.BinanceChain) {
    const { signature } = await anyWindow.BinanceChain.bnbSign(account, message)
    return signature
  }

  /**
   * Wallet Connect does not sign the message correctly unless you use their method
   * @see https://github.com/WalletConnect/walletconnect-monorepo/issues/462
   */
  if (provider.provider?.wc) {
    const wcMessage = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message))
    const signature = await provider.provider?.wc.signPersonalMessage([wcMessage, account])
    return signature
  }
  return provider.getSigner(account).signMessage(message)
}

export const handleUserFollow = async (user: User, mode: number, account: string, library: any): Promise<string> => {
  const message = `I would like to ${mode === 1 ? 'follow' : 'unfollow'} user ${user.userId}`
  try {
    const sig = await signMessage(library, account, message)
    const data = {
      sig,
      message,
      userId: account,
      to: user.userId,
    }
    if (mode) {
      restAPI.makeFollowUser(data).then(() => {
        return true
      })
    } else {
      restAPI.makeUnfollowUser(data).then(() => {
        return true
      })
    }
    return sig
  } catch (error) {
    return error.message
  }
}

export const handleNFTLike = async (
  likes: number,
  nft: NFT,
  userId: string,
  mode: number,
  account: string,
  library: any
): Promise<string> => {
  const message = `I would like to ${mode === 1 ? 'save' : 'remove'} like for '${nft.slug}'`
  try {
    const sig = await signMessage(library, account, message)
    const data = {
      nft: {
        likesCount: likes,
      },
      sig,
      message,
      slug: nft.slug,
      userId: account,
    }
    if (mode) {
      restAPI.makeLikeNFT(data).then(() => {
        return true
      })
    } else {
      restAPI.makeUnlikeNFT(data).then(() => {
        return true
      })
    }
    return sig
  } catch (error) {
    return error.message
  }
}
