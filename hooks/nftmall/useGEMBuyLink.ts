import { getTokenBuyLink, LINK_PANKCAKESWAP } from '@nftmall/sdk'
import { ChainId, GEM } from '@sushiswap/core-sdk'
import { useActiveWeb3React } from 'app/services/web3'

/**
 * get dex link to buy GEM on connected chain
 * by default pancakeswap
 * @returns url towards dex
 */
function useGEMBuyLink(chainId?: ChainId) {
  const { chainId: activeChainId } = useActiveWeb3React()
  const chain = chainId || activeChainId
  return chain && GEM[chain] ? getTokenBuyLink(GEM[chain]) : LINK_PANKCAKESWAP
}
export default useGEMBuyLink
