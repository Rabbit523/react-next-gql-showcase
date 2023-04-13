import { useSingleCallResult } from 'app/lib/hooks/multicall'
import { useMemo } from 'react'

import { useNFTContract } from './useNFTContract'

export function useNFTAllowance(token?: string, owner?: string, spender?: string): boolean | undefined {
  const contract = useNFTContract(token)

  const inputs = useMemo(() => [owner, spender], [owner, spender])
  const allowance = useSingleCallResult(
    contract,
    'isApprovedForAll',
    // isERC721Collection(token) ? 'isApprovedForAll' : 'isApprovedForAll', // same method for both erc1155 and erc721?!
    inputs
  ).result
  // console.log(allowance)

  return useMemo(() => (token && allowance ? Boolean(allowance) : undefined), [token, allowance])
}
