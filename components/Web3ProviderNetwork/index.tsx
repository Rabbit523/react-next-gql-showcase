// import { createWeb3ReactRoot } from '@web3-react/core'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'

// import { coinbaseWallet, hooks as coinbaseWalletHooks } from '../../reactweb3/connectors/coinbaseWallet'
import { hooks as metaMaskHooks, metaMask } from '../../reactweb3/connectors/metaMask'
import { hooks as networkHooks, network } from '../../reactweb3/connectors/network'
import { hooks as walletConnectHooks, walletConnect } from '../../reactweb3/connectors/walletConnect'

type Connectors = [MetaMask | WalletConnect | CoinbaseWallet | Network, Web3ReactHooks][]

const connectors: Connectors = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  // [coinbaseWallet, coinbaseWalletHooks],
  [network, networkHooks],
]

function Web3ProviderNetwork({ children }) {
  return <Web3ReactProvider connectors={connectors}>{children}</Web3ReactProvider>
}

export default Web3ProviderNetwork
