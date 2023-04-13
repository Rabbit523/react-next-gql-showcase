import { Contract } from '@ethersproject/contracts'
import { ABIs } from '@nftmall/sdk'

import { useContract } from '../useContract'

export function useNFTContract(token?: string): Contract | null {
  // const parsedId = useMemo(() => parseUnionId(token?.id, true), [token?.id])
  // return useContract(parsedId?.address, isERC721Collection(token) ? ABIs.erc721ABI : ABIs.erc1155ABI, true)
  return useContract(token, ABIs.erc721ABI, true)
}
