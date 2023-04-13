import { MaxUint256 } from '@ethersproject/constants'
import { NFTMALL_ERC20_TRANSFERPROXY_ADDRESS, NFTMALL_TRANSFERPROXY_ADDRESS } from '@nftmall/sdk'
import { ChainId } from '@sushiswap/core-sdk'
import { useActiveWeb3React } from 'app/services/web3'
import { useCallback, useEffect, useState } from 'react'

import { getErc20Contract } from '../../utils/contractHelpers'
import { useERC721 } from './contract'

// FIXME: @deprecate this in favor of `useNFTApproveCallback`
export const useERC721TokenApprove = (contractAddress: string, nftChainId: number) => {
  const contract = useERC721(contractAddress)
  const { account, chainId } = useActiveWeb3React()
  const [isApproved, setIsApproved] = useState(false)

  const handleApprove = useCallback(async () => {
    if (chainId === nftChainId) {
      const tx = await contract.setApprovalForAll(NFTMALL_TRANSFERPROXY_ADDRESS[chainId], true)
      const receipt = await tx.wait()
      return receipt
    }
    return ''
  }, [chainId, contract, nftChainId])

  useEffect(() => {
    const fetchApprovals = async () => {
      // console.error('Token contract: ', contract, contract.isApprovedForAll, contract.address)
      try {
        const approval = await contract.isApprovedForAll(account, NFTMALL_TRANSFERPROXY_ADDRESS[chainId])
        setIsApproved(approval)
      } catch (e) {
        console.error(e)
      }
    }
    if (account && chainId && contract && nftChainId && chainId === nftChainId) {
      fetchApprovals()
    }
  }, [contract, account, chainId, nftChainId])

  return { isApproved, handleApprove }
}

export const onERC20TokenApprove = async (tokenAddress: string, chainId: ChainId, library: any) => {
  const contract = getErc20Contract(tokenAddress, library.getSigner())
  // TODO: Should refer from pancakeswap
  const tx = await contract.approve(NFTMALL_ERC20_TRANSFERPROXY_ADDRESS[chainId], MaxUint256.toString())
  const receipt = await tx.wait()
  return receipt
}

export const getERC20TokenApprovals = async (tokenAddress: string, chainId: ChainId, library: any, account: string) => {
  const contract = getErc20Contract(tokenAddress, library.getSigner())
  const approval = await contract.allowance(account, NFTMALL_ERC20_TRANSFERPROXY_ADDRESS[chainId])
  return parseInt(approval, 10) ? true : false
}
