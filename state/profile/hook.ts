import { isAddress, isUnionId, parseUnionId, SWRParam, WindowChain } from '@nftmall/sdk'
import { User } from '@prisma/client'
import { useActiveWeb3React } from 'app/services/web3'
import { apolloAPI } from 'app/utils/apollo'
// import { useWeb3React } from '@web3-react/core'
import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import useSWR, { SWRResponse } from 'swr'

import { useAppDispatch } from '../hooks'
import { fetchProfile, profileClear } from '.'
import { ProfileState, State } from './types'

export const useFetchProfile = () => {
  const { account } = useActiveWeb3React()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (account) {
      dispatch(fetchProfile(account))
    } else {
      const ethereum = (window as WindowChain).ethereum
      if (ethereum) {
        // Listening to Event
        ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length <= 0) {
            dispatch(profileClear())
          }
        })
      }
    }
  }, [account, dispatch])
}

// TODO: update this using swr. `useUserProfile` hook
export const useProfile = () => {
  const { isLoading, isInitialized, hasError, data }: ProfileState = useSelector((state: State) => state.profile)
  return { profile: data, isLoading, isInitialized, hasError }
}

interface useUserProfileProps extends SWRParam {
  variables: {
    id: string
    skipCache?: boolean
  }
}

export const useUserProfile = ({
  variables,
  shouldFetch = true,
  swrConfig = undefined,
}: useUserProfileProps): SWRResponse<User, any> => {
  const lowercaseAddress = useMemo(() => {
    if (!variables?.id) {
      return undefined
    }
    const { id } = variables
    let checksumAddress = ''
    if (isUnionId(id)) {
      checksumAddress = parseUnionId(id, true).address
      return checksumAddress?.toLowerCase()
    } else {
      checksumAddress = isAddress(id) || '' // because isAddress returns checksummed address string
      return checksumAddress?.toLowerCase()
    }
  }, [variables])
  // Here the key 'userProfile' might be exact graphql query string
  // don't fetch when invalid `id` is given
  const canFetch = shouldFetch && !!lowercaseAddress
  // lowercaseAddress = checksumAddress.toString
  return useSWR(
    canFetch ? ['userProfile', lowercaseAddress] : null,
    async ([key, address]) => {
      const users = await apolloAPI.fetchUser(lowercaseAddress, variables?.skipCache)
      if (users?.length) {
        return users[0]
      }
      // there are no result?
      return {
        userId: lowercaseAddress,
        address: lowercaseAddress,
      } as User
    },
    swrConfig
  )
}
