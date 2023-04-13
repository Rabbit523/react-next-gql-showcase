import { BIG_ZERO } from '@nftmall/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { useEffect, useState } from 'react'
import { useActiveWeb3React } from 'app/services/web3'
import useLastUpdated from './useLastUpdated'
import { getErc20Contract } from 'apps/frontend/utils/contractHelpers'
import { apolloAPI } from 'apps/frontend/utils/apollo'
import useSWR from 'swr'

// @deprecated
export const getTokenBalance = async (account: string, tokenAddress: string, library: any) => {
  const contract = getErc20Contract(tokenAddress, library.getSigner())
  try {
    const res = await contract.balanceOf(account)
    if (res) {
      return BigNumber.from(res.toString())
    }
  } catch (e) {
    console.error(e)
    return BigNumber.from(BIG_ZERO)
  }
  return BigNumber.from(BIG_ZERO)
}

export const useCurrencyExchangeRate = () => {
  // this is not actual route.
  const res = useSWR(['graphql/all_currencies'], () => apolloAPI.fetchCoinExchangeRate(), {
    refreshInterval: 5 * 60 * 1000, // once per 5 mins
  })
  // TODO: we can apply some modifications to response
  return res
}
