// import { t } from '@lingui/macro'
// import { useLingui } from '@lingui/react'
import useEagerConnect from 'app/hooks/useEagerConnect'

export const Web3ReactManager = ({ children }: { children: JSX.Element }) => {
  // const { connector, chainId, isActivating, account, isActive, provider, isWrongNetwork } = useActiveWeb3React()

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  // useInactiveListener(!triedEager)

  return children
}

export default Web3ReactManager
