// import { defaultAbiCoder } from '@ethersproject/abi'
// import { getCreate2Address } from '@ethersproject/address'
// import { AddressZero } from '@ethersproject/constants'
// import { keccak256 } from '@ethersproject/solidity'
import {
  // BENTOBOX_ADDRESS,
  // CHAINLINK_ORACLE_ADDRESS,
  // computePairAddress,
  // Currency,
  // FACTORY_ADDRESS,
  // KASHI_ADDRESS,
  Pair,
  Token,
} from '@sushiswap/core-sdk'
// import { CHAINLINK_PRICE_FEED_MAP } from 'app/config/oracles/chainlink'
// import { BASES_TO_TRACK_LIQUIDITY_FOR, PINNED_PAIRS } from 'app/config/routing'
// import { e10 } from 'app/functions'
import { useActiveWeb3React } from 'app/services/web3'
import { AppState } from 'app/state'
import { useAppDispatch, useAppSelector } from 'app/state/hooks'
import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'

import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  toggleURLWarning,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserSingleHopOnly,
  updateUserUseSushiGuard,
} from './actions'

function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  }
}

function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name
  )
}

export function useIsExpertMode(): boolean {
  return useAppSelector((state) => state.user.userExpertMode)
}

export function useExpertModeManager(): [boolean, () => void] {
  const dispatch = useAppDispatch()
  const expertMode = useIsExpertMode()

  const toggleSetExpertMode = useCallback(() => {
    dispatch(updateUserExpertMode({ userExpertMode: !expertMode }))
  }, [expertMode, dispatch])

  return [expertMode, toggleSetExpertMode]
}

export function useUserSingleHopOnly(): [boolean, (newSingleHopOnly: boolean) => void] {
  const dispatch = useAppDispatch()

  const singleHopOnly = useAppSelector((state) => state.user.userSingleHopOnly)

  const setSingleHopOnly = useCallback(
    (newSingleHopOnly: boolean) => {
      gtag('event', newSingleHopOnly ? 'Enabled Single Hop' : 'Disabled Single Hop', {
        event_category: 'Routing',
      })

      dispatch(updateUserSingleHopOnly({ userSingleHopOnly: newSingleHopOnly }))
    },
    [dispatch]
  )

  return [singleHopOnly, setSingleHopOnly]
}

export function useUserTransactionTTL(): [number, (userDeadline: number) => void] {
  const dispatch = useAppDispatch()
  const userDeadline = useSelector<AppState, AppState['user']['userDeadline']>((state) => {
    return state.user.userDeadline
  })

  const setUserDeadline = useCallback(
    (userDeadline: number) => {
      dispatch(updateUserDeadline({ userDeadline }))
    },
    [dispatch]
  )

  return [userDeadline, setUserDeadline]
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }))
    },
    [dispatch]
  )
}

export function useRemoveUserAddedToken(): (chainId: number, address: string) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }))
    },
    [dispatch]
  )
}

export function useUserAddedTokens(): Token[] {
  const { chainId } = useActiveWeb3React()
  const serializedTokensMap = useAppSelector(({ user: { tokens } }) => tokens)

  return useMemo(() => {
    if (!chainId) return []
    // @ts-ignore TYPE NEEDS FIXING
    return Object.values(serializedTokensMap?.[chainId] ?? {}).map(deserializeToken)
  }, [serializedTokensMap, chainId])
}

function serializePair(pair: Pair): SerializedPair {
  return {
    token0: serializeToken(pair.token0),
    token1: serializeToken(pair.token1),
  }
}

export function usePairAdder(): (pair: Pair) => void {
  const dispatch = useAppDispatch()

  return useCallback(
    (pair: Pair) => {
      dispatch(addSerializedPair({ serializedPair: serializePair(pair) }))
    },
    [dispatch]
  )
}

export function useURLWarningVisible(): boolean {
  return useAppSelector((state: AppState) => state.user.URLWarningVisible)
}

export function useURLWarningToggle(): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(toggleURLWarning()), [dispatch])
}

/**
 * Returns a boolean indicating if the user has enabled SushiGuard protection.
 */
export function useUserSushiGuard(): [boolean, (newUseSushiGuard: boolean) => void] {
  const dispatch = useAppDispatch()

  // @ts-ignore TYPE NEEDS FIXING
  const useSushiGuard = useSelector<AppState, AppState['user']['useSushiGuard']>(
    (state) => state.user.userUseSushiGuard
  )

  const setUseSushiGuard = useCallback(
    (newUseSushiGuard: boolean) => dispatch(updateUserUseSushiGuard({ userUseSushiGuard: newUseSushiGuard })),
    [dispatch]
  )

  return [useSushiGuard, setUseSushiGuard]
}
