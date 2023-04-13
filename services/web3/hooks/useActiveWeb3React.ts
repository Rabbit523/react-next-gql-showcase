import { useWeb3React } from '@web3-react/core'
import { supportedChainIds } from 'app/utils/constants'
import { useCallback, useMemo } from 'react'

export function useActiveWeb3React() {
  // if (process.env.REACT_APP_IS_WIDGET) {
  //   return useWidgetsWeb3React()
  // }
  const { connector, chainId, accounts, isActivating, account, isActive, provider, ENSNames, ENSName, hooks } =
    useWeb3React()

  const isWrongNetwork = useMemo(() => {
    if (!chainId) return false
    if (!account) return false
    return !supportedChainIds.includes(chainId)
  }, [account, chainId])

  const disconnect = useCallback(() => {
    if (!connector) {
      console.warn('Connector does not exist.')
      return
    }
    if (connector?.deactivate) {
      void connector.deactivate()
    } else {
      void connector.resetState()
    }
  }, [connector])

  // const interfaceContext = useWeb3React<Web3Provider>()
  // const interfaceNetworkContext = useWeb3React<Web3Provider>(
  //   process.env.REACT_APP_IS_WIDGET ? undefined : NetworkContextName
  // )

  // if (interfaceContext.active) {
  //   return interfaceContext
  // }

  // return interfaceNetworkContext
  const estimatedGasPrice = useMemo(async () => {
    if (provider && chainId) {
      try {
        const gasPrice = await provider.getGasPrice()
        // console.error('gasPrice:', gasPrice.toString())
        return gasPrice
      } catch (e) {
        console.error('Could not estimate gas price', e)
      }
    }
    return undefined
  }, [chainId, provider])

  return {
    connector,
    chainId,
    account,
    isActive,
    isActivating,
    provider,
    library: provider,
    isWrongNetwork, // my custom value
    disconnect,
    estimatedGasPrice,
  }
}

export default useActiveWeb3React
