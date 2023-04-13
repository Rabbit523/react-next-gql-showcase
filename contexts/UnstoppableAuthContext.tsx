// import { connectorLocalStorageKey, uauthLocalStorageKey } from '@nftmall/sdk'
// import { UserInfo } from '@uauth/js'
// import { UAuthConnector } from '@uauth/web3-react'
// import { createContext, FC, useContext, useEffect, useMemo, useState } from 'react'
// import { useWeb3React } from '@web3-react/core'

// import { SUPPORTED_WALLETS } from '../config/wallets'

// interface UnstoppableAuthProviderProps {
//   children?: React.ReactNode
// }

// export const UnstoppableAuthProvider: FC<UnstoppableAuthProviderProps> = (props) => {
//   const { account } = useWeb3React()
//   const [currentUser, setCurrentUser] = useState<UserInfo>()
//   const [loadingInitial, setLoadingInitial] = useState<boolean>(true)

//   const eagerConnectUD = async () => {
//     const connector = SUPPORTED_WALLETS['UD'].connector
//     const udConnector =
//       typeof connector === 'function' ? ((await connector()) as UAuthConnector) : (connector as UAuthConnector)
//     await UAuthConnector.importUAuth()
//     // const isAuthorized = await udConnector.isAuthorized()
//     // console.log({ isAuthorized })
//     const username = window.localStorage.getItem(uauthLocalStorageKey)
//     if (username) {
//       udConnector.uauth
//         .user({
//           username,
//         })
//         .then((user) => {
//           console.log({ user })
//           setCurrentUser(user)
//         })
//         .catch((e) => {
//           console.error(e)
//         })
//         .finally(() => setLoadingInitial(false))
//     } else {
//       setLoadingInitial(false)
//     }
//   }

//   useEffect(() => {
//     if (account) {
//       console.log({ account })
//       const connectorId = window.localStorage.getItem(connectorLocalStorageKey)
//       console.log({ connectorId })
//       if (connectorId === 'Unstoppable Domains') {
//         eagerConnectUD()
//       } else {
//         setLoadingInitial(false)
//       }
//     } else {
//       setLoadingInitial(false)
//     }
//   }, [account])

//   const signOut = async () => {
//     try {
//       const connector = SUPPORTED_WALLETS['UD'].connector
//       const udConnector =
//         typeof connector === 'function' ? ((await connector()) as UAuthConnector) : (connector as UAuthConnector)
//       await udConnector.uauth.logout()
//       setCurrentUser(undefined)
//     } catch (e) {
//       console.log(e)
//     }
//   }

//   const memorizedReturnValue = useMemo(
//     () => ({
//       currentUser,
//       signOut,
//     }),
//     [currentUser]
//   )
//   console.log({ loadingInitial })
//   return (
//     <UnstoppableAuthContext.Provider value={memorizedReturnValue}>
//       {!loadingInitial && props.children}
//     </UnstoppableAuthContext.Provider>
//   )
// }

// export default function useUnstoppableAuth() {
//   return useContext(UnstoppableAuthContext)
// }

// export type AuthContextShape = {
//   currentUser?: UserInfo
//   signOut: () => Promise<void>
// }

// export const UnstoppableAuthContext = createContext({} as AuthContextShape)

export {}
