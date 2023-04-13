import { connectorLocalStorageKey } from '@nftmall/sdk'
import { IS_IN_IFRAME } from 'app/constants'
import { metaMask } from 'app/reactweb3/connectors/metaMask'
import { useActiveWeb3React } from 'app/services/web3'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'

import { SUPPORTED_WALLETS } from '../config/wallets'

export function useEagerConnect() {
  const { isActive } = useActiveWeb3React()
  const [tried, setTried] = useState(false)

  // gnosisSafe.isSafeApp() races a timeout against postMessage, so it delays pageload if we are not in a safe app;
  // if we are not embedded in an iframe, it is not worth checking
  // const [triedSafe, setTriedSafe] = useState(!IS_IN_IFRAME)

  // first, try connecting to a gnosis safe
  // useEffect(() => {
  //   if (!triedSafe) {
  //     import('@gnosis.pm/safe-apps-web3-react')
  //       .then(({ SafeAppConnector }) => new SafeAppConnector())
  //       .then((gnosisSafe) =>
  //         gnosisSafe.isSafeApp().then((loadedInSafe) => {
  //           if (loadedInSafe) {
  //             activate(gnosisSafe, undefined, true).catch(() => {
  //               setTriedSafe(true)
  //             })
  //           } else {
  //             setTriedSafe(true)
  //           }
  //         })
  //       )
  //   }
  // }, [activate, setTriedSafe, triedSafe])

  // then, if that fails, try connecting to an injected connector
  // useEffect(() => {
  //   if (!isActive && triedSafe) {
  //     injected.isAuthorized().then((isAuthorized) => {
  //       if (isAuthorized) {
  //         activate(injected, undefined, true).catch(() => {
  //           setTried(true)
  //         })
  //       } else {
  //         if (isMobile && window.ethereum) {
  //           activate(injected, undefined, true).catch(() => {
  //             setTried(true)
  //           })
  //         } else {
  //           setTried(true)
  //         }
  //       }
  //     })
  //   }
  // }, [activate, isActive, triedSafe])

  // wait until we get confirmation of a connection to flip the flag
  useEffect(() => {
    if (isActive) {
      setTried(true)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive) {
      const manualDisconnectDate = Date.parse(window.localStorage.getItem('disconnected_at'))
      if (manualDisconnectDate > 0 && Date.now() - manualDisconnectDate < 6 * 3600 * 1000) {
        // don't eager connect if user has manually disconnected in the last 6 hrs.
        console.debug('Skip eager connect')
        return
      }
      const connectorId = window.localStorage.getItem(connectorLocalStorageKey)
      if (connectorId) {
        // ok user has ever connected a wallet
        if (SUPPORTED_WALLETS[connectorId]?.connector) {
          // ok such connector presents
          const conn = SUPPORTED_WALLETS[connectorId].connector
          if (typeof conn !== 'function') {
            void conn.connectEagerly().catch(() => {
              console.debug('Failed to connect eagerly to', connectorId)
            })
          }
        } else {
          // no such connector?
          // maybe such connector has been removed during product updates.
          window.localStorage.removeItem(connectorLocalStorageKey)
        }
        return
      } else {
        // no connector. no manual disconnect = first time user?
        // try metamask
        metaMask.connectEagerly().catch(() => {
          console.debug('Failed to initially eagerly connect to meatmask.')
        })
      }
    }
  }, [isActive])

  return tried
}

export default useEagerConnect
