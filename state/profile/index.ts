import { User } from '@prisma/client'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ProfileState } from './types'
import type { AppDispatch } from '../'
import { restAPI } from '../../utils/rest'
import { apolloAPI } from '../../utils/apollo'
// import { SIGN_MESSAGE } from '@nftmall/sdk'
// import { signMessage } from 'app/hooks/nftmall/useSignMessage'
// import useActiveWeb3React from 'apps/frontend/hooks/useActiveWeb3React'

const initialState: ProfileState = {
  hasError: false,
  isInitialized: false,
  isLoading: true,
  data: null,
}

interface ProfileFetchResponse {
  profile?: User | null
}

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    profileInitialize: (state) => {
      state.isInitialized = true
    },
    profileFetchStart: (state) => {
      state.isLoading = true
    },
    profileFetchSucceeded: (_state, action: PayloadAction<ProfileFetchResponse>) => {
      const { profile } = action.payload
      return {
        hasError: false,
        isInitialized: true,
        isLoading: false,
        data: profile,
      }
    },
    profileFetchFailed: (state) => {
      state.isLoading = false
      state.isInitialized = true
    },
    profileClear: () => ({
      ...initialState,
      hasError: false,
      isLoading: false,
      isInitialized: true,
    }),
    registerUserStart: (state) => {
      state.isLoading = true
    },
    registerUserFailed: (_state, action: PayloadAction<ProfileFetchResponse>) => {
      const { profile } = action.payload
      return {
        isLoading: false,
        isInitialized: true,
        hasError: !!profile,
        data: null,
      }
    },
    registerUserSucceeded: (_state, action: PayloadAction<ProfileFetchResponse>) => {
      const { profile } = action.payload
      return {
        isInitialized: true,
        isLoading: false,
        hasError: false,
        data: profile,
      }
    },
  },
})

// Actions
export const {
  profileInitialize,
  profileFetchStart,
  profileFetchSucceeded,
  profileFetchFailed,
  profileClear,
  registerUserStart,
  registerUserFailed,
  registerUserSucceeded,
} = profileSlice.actions

// Thunks
// TODO: this should be an AsyncThunk
export const fetchProfile = (address: string) => async (dispatch: AppDispatch) => {
  const userId = address.toLowerCase()
  try {
    dispatch(profileFetchStart())
    const data = await apolloAPI.fetchUser(userId)

    if (data.length > 0) {
      dispatch(profileFetchSucceeded({ profile: data[0] }))
    } else {
      dispatch(profileFetchFailed())
      dispatch(registerUser(userId))
    }
  } catch (error) {
    dispatch(profileFetchFailed())
    dispatch(registerUser(userId))
  }
}

export const registerUser = (address: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(registerUserStart())
    // const signature = await signMessage(library, address, SIGN_MESSAGE)
    const response = await restAPI.createUser(address)
    if (response.blacklisted) {
      dispatch(registerUserFailed({ profile: response }))
    } else {
      dispatch(registerUserSucceeded({ profile: response }))
    }
  } catch (error) {
    dispatch(registerUserFailed({ profile: null }))
  }
}

export default profileSlice.reducer
