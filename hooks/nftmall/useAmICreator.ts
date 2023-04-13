import { useMemo } from 'react'
import { Item } from '@rarible/api-client'
import { useActiveWeb3React } from 'app/services/web3'
import { compareAddresses } from '@nftmall/sdk'

const useAmICreator = (item: Item) => {
  const { account: myAccount } = useActiveWeb3React()
  const creators = item?.creators
  const firstCreator = creators?.at(0)?.account
  const amICreator = useMemo(() => {
    if (!!myAccount && !!creators) {
      const me = creators?.find((creator) => compareAddresses(creator.account, myAccount))
      return !!me
    }
    return false
  }, [myAccount, creators])
  return {
    amICreator,
    creators,
    firstCreator,
  }
}

export default useAmICreator
