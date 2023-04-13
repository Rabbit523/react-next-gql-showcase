import { Contract } from '@ethersproject/contracts'
import { ABIs, NFTMALL_ERC721_ADDRESS } from '@nftmall/sdk'
import { useActiveWeb3React } from 'app/services/web3'
import { useMemo } from 'react'

import ERC721Abi from '../../config/abi/ERC721.json'
import { getNFTmallERC721Contract } from '../../utils/contractHelpers'
import { useContract } from '../useContract'

// export const useExchangeContract = () => {
//   const { account, chainId, library } = useActiveWeb3React()

//   return useMemo(() => {
//     if (account) {
//       return getExchangeContract(contractAddresses[chainId]?.Exchange, library.getSigner())
//     } else {
//       return null
//     }
//   }, [account, chainId, library])
// }

export const useERC721 = (contractAddress: string): Contract | null => {
  return useContract(contractAddress, ERC721Abi)
}

export const useERC1155 = (contractAddress: string): Contract | null => {
  return useContract(contractAddress, ABIs.erc1155ABI)
}

export const useNFTmallERC721Contract = () => {
  const { account, chainId, library } = useActiveWeb3React()

  return useMemo(() => {
    if (account) {
      return getNFTmallERC721Contract(NFTMALL_ERC721_ADDRESS[chainId], library.getSigner())
    } else {
      return null
    }
  }, [account, chainId, library])
}
