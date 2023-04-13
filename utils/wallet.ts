// Set of helper functions to facilitate wallet setup

import { WindowChain } from '@nftmall/sdk'

/**
 * Prompt the user to add a custom token to metamask
 * @param tokenAddress
 * @param tokenSymbol
 * @param tokenDecimals
 * @param tokenImage
 * @returns {boolean} true if the token has been added, false otherwise
 */
export const registerToken = async (
  tokenAddress: string,
  tokenSymbol: string,
  tokenDecimals: number,
  tokenImage: string
) => {
  const ethereum = (window as WindowChain).ethereum
  const tokenAdded = ethereum
    ? ethereum.on
      ? await ethereum.on({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      })
      : null
    : null

  return tokenAdded
}
