import { unionApiClient } from '@nftmall/sdk'
import { EthersEthereum } from '@rarible/ethers-ethereum'
import { createRaribleSdk, LogsLevel } from '@rarible/sdk'
import { EthereumWallet } from '@rarible/sdk-wallet'
import { useActiveWeb3React } from 'app/services/web3'
import { useMemo } from 'react'

export default function useUnionSDK() {
  const { account: myAccount, chainId: activeChainId, provider } = useActiveWeb3React()

  const unionAPI = unionApiClient

  const unionSDK = useMemo(() => {
    console.log('Creating unionSDK... ', myAccount)
    if (!!myAccount && !!activeChainId && !!provider) {
      const ethersEth = new EthersEthereum(provider.getSigner())
      const eth = new EthereumWallet(ethersEth)
      return createRaribleSdk(eth, 'prod', { logs: LogsLevel.DISABLED })
    }
    // when account is not connected
    return createRaribleSdk(undefined, 'prod', { logs: LogsLevel.DISABLED })
  }, [activeChainId, provider, myAccount])

  return {
    unionAPI,
    unionSDK,
  }
}
