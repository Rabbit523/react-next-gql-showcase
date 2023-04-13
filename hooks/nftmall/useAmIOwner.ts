import { compareAddresses } from '@nftmall/sdk'
import { Item } from '@rarible/api-client'
import { useItemOwnerships } from 'app/services/union-api/hooks'
import { useActiveWeb3React } from 'app/services/web3'
import { useMemo } from 'react'

function useAmIOwner(item: Item) {
  const { account: myAccount } = useActiveWeb3React()
  const ownershipSWR = useItemOwnerships({
    variables: { itemId: item?.id },
    shouldFetch: !!item?.id,
    swrConfig: {
      refreshInterval: 60 * 1000, // once per 1 min.
    },
  })
  const { data: ownerships } = ownershipSWR
  const owners = ownerships?.ownerships
  const firstOwner = owners?.at(0)?.owner
  const amIOwner = useMemo(() => {
    if (!!myAccount && !!owners) {
      const me = owners?.find((ownership) => compareAddresses(ownership.owner, myAccount))
      return !!me
    }
    return false
  }, [myAccount, owners])
  return {
    amIOwner,
    owners,
    firstOwner,
    ownershipSWR,
  }
}
export default useAmIOwner
