import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { useWeb3React, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'
import { NextSeo } from 'next-seo'

import { coinbaseWallet, hooks as coinbaseWalletHooks } from '../connectors/coinbaseWallet'
import { hooks as metaMaskHooks, metaMask } from '../connectors/metaMask'
import { hooks as networkHooks, network } from '../connectors/network'
import { hooks as walletConnectHooks, walletConnect } from '../connectors/walletConnect'
import { getName } from '../utils'

const connectors: [MetaMask | WalletConnect | CoinbaseWallet | Network, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [network, networkHooks],
]

function Child({ item }) {
  // const { connector } = useWeb3React()
  const { connector, chainId, accounts, isActivating, account, isActive, provider, ENSNames, ENSName, hooks } =
    useWeb3React()
  console.log(`Priority Connector is: ${getName(connector)}`)
  console.log({ connector, chainId, accounts, isActivating, account, isActive, provider, ENSNames, ENSName, hooks })
  return (
    <>
      <NextSeo title={item?.meta?.name || 'dummy'} description="dummy description" />
      Child content
    </>
  )
}

export default function ProviderExample({ item }) {
  return (
    <Web3ReactProvider connectors={connectors}>
      <NextSeo title={'ProviderExample'} description="ProviderExample description" />
      <Child item={item} />
    </Web3ReactProvider>
  )
}
