import { connectorLocalStorageKey, uauthLocalStorageKey } from '@nftmall/sdk'
// import useUnstoppableAuth from 'app/contexts/UnstoppableAuthContext'
import { useActiveWeb3React } from 'app/services/web3'
import { useCallback } from 'react'

import { useAppDispatch } from '../../state/hooks'
import { profileClear } from '../../state/profile'

const useAuth = () => {
  const dispatch = useAppDispatch()
  // const { currentUser, signOut } = useUnstoppableAuth()
  // const { active, account, connector, activate, error, deactivate } = useWeb3React()
  const { disconnect } = useActiveWeb3React()
  // const { logout: moralisLogout } = useMoralis()

  const logout = useCallback(() => {
    dispatch(profileClear())
    // if (currentUser) {
    //   signOut()
    // }
    disconnect()
    // save current time stamp to prevent auto connect in the next 6 hrs.
    window.localStorage.setItem('disconnected_at', new Date().toString())
    window.localStorage.removeItem(connectorLocalStorageKey)
    window.localStorage.removeItem(uauthLocalStorageKey)
  }, [disconnect, dispatch])

  return { logout }
}

export default useAuth
