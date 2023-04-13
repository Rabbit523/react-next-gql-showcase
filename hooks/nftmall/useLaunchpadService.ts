import { BigNumber } from '@ethersproject/bignumber'
import { delay, IProject, rpc, tryParseAmount } from '@nftmall/sdk'
import { Token } from '@sushiswap/core-sdk'
import useCurrencyBalance from 'app/lib/hooks/useCurrencyBalance'
import { useActiveWeb3React } from 'app/services/web3'
import { providers } from 'ethers'
import { useCallback, useMemo } from 'react'

import { getContract } from '../../utils/contractHelpers'
import { useApproveCallback } from '../useApproveCallback'
import { useContract } from '../useContract'

const IS_TESTING = false

export const useLaunchpadService = (project: IProject, mintAmountInput = 1) => {
  const { account, chainId, library } = useActiveWeb3React()
  const sale = project.meta
  const isConnected = account && chainId && library ? true : false

  const paymentCurrency = useMemo(
    () => new Token(project.chainId, sale.currencyContract, 18, sale.currencySymbol, sale.currencyName),
    [project.chainId, sale.currencyContract, sale.currencyName, sale.currencySymbol]
  )

  const payAmount = tryParseAmount((mintAmountInput * sale.presalePrice).toString(), paymentCurrency) // FIXME: presale or publicsale?

  const myWalletBalance = useCurrencyBalance(account, paymentCurrency)

  const [approveState, approveCallback] = useApproveCallback(payAmount, sale.saleContract)

  const activeSaleContract = useContract(sale.saleContract, sale.abi, true)

  const readOnlySaleContract = useMemo(() => {
    // when wallet is not connected, make readonly provider
    if (typeof window === 'undefined') return null
    const contract = getContract(sale.abi, sale.saleContract, new providers.JsonRpcProvider(rpc[project.chainId]))
    return contract
  }, [project.chainId, sale.abi, sale.saleContract])

  const saleContract = chainId === project.chainId ? activeSaleContract || readOnlySaleContract : readOnlySaleContract

  const getMintedSupply = useCallback(async () => {
    if (IS_TESTING) return 300
    // if (IS_TESTING) return Math.floor(Math.random() * 1000)
    try {
      const amount = await saleContract.supply() // this returns BigNumber object
      // console.log({ getMintedSupply: amount, number: BigNumber.from(amount).toNumber(), string: amount.toString() })
      return BigNumber.from(amount).toNumber() || 0
    } catch (e) {
      console.error(e)
      return 0
    }
  }, [saleContract])

  const mint = useCallback(
    async (amount: number) => {
      // const estimatedGas = await saleContract.estimateGas.mint(amount)
      // console.log({estimatedGas})
      const tx = await saleContract.mint(amount)
      // const contract = getContract(abi, contractAddress, library)
      // const fee = getDecimalAmount(BigNumber.from(price).mul(amount))
      // const tx = await contract.mint(amount, timestamp, signature, {
      //   value: fee.toString(),
      // })
      const receipt = await tx.wait()
      await delay(3000)
      return receipt.transactionHash
    },
    [saleContract]
  )

  const getOwnedSupply = useCallback(async (address: string) => {
    if (IS_TESTING) return Math.floor(Math.random() * 1000)
    // if (contractAddress !== ZERO_ADDRESS && getRPCProvider(collectionChainId)) {
    //   const contract = getContract(abi, contractAddress, getRPCProvider(collectionChainId))
    //   const amount = await contract.addressMintedBalance(address)
    //   return amount.toNumber()
    // }
    return 0
  }, [])

  const getTotalRaised = useCallback(async () => {
    if (IS_TESTING) return BigNumber.from(`${300 * 140}000000000000000000`)
    // if (IS_TESTING) return BigNumber.from(`${Math.floor(Math.random() * 10000)}000000000000000000`)
    try {
      const amount = await saleContract.totalRaised()
      // console.log({ getTotalRaised: amount, number: BigNumber.from(amount), string: amount.toString() })
      return BigNumber.from(amount)
    } catch (e) {
      console.error(e)
      return BigNumber.from('0')
    }
  }, [saleContract])

  return {
    getTotalSupply: getMintedSupply,
    getOwnedSupply,
    getTotalRaised,
    mint,
    approveState,
    approveCallback,
    paymentCurrency,
    payAmount,
    myWalletBalance,
  }
}
