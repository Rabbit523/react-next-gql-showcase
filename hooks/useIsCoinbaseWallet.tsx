import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { useActiveWeb3React } from 'app/services/web3'

export default function useIsCoinbaseWallet(): boolean {
  const { connector } = useActiveWeb3React()
  return connector instanceof CoinbaseWallet
  // return useMemo(() => {
  //   return (
  //     connector instanceof WalletLinkConnector ||
  //     (connector instanceof InjectedConnector && window.walletLinkExtension) ||
  //     window?.ethereum?.isCoinbaseWallet
  //   )
  // }, [connector])
}
