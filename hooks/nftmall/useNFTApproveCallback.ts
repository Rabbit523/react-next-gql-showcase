import { TransactionResponse } from '@ethersproject/providers'
import { calculateGasMargin } from 'app/functions/trade'
import { useActiveWeb3React } from 'app/services/web3'
import { useHasPendingApproval, useTransactionAdder } from 'app/state/transactions/hooks'
import { useCallback, useMemo } from 'react'

import { ApprovalState } from '../useApproveCallback'
import { useNFTAllowance } from './useNFTAllowance'
import { useNFTContract } from './useNFTContract'

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useNFTApproveCallback(
  tokenAddress: string,
  amountToApprove = true,
  spender?: string
): [ApprovalState, () => Promise<void>] {
  const { account } = useActiveWeb3React()
  // const token = collection // amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined
  const currentAllowance = useNFTAllowance(tokenAddress, account ?? undefined, spender)
  // TODO: is it ok not to make clone of `useHasPendingApproval` ?!
  const pendingApproval = useHasPendingApproval(tokenAddress, spender)

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    // if (amountToApprove.currency.isNative) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (currentAllowance === undefined) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance !== amountToApprove // false < true
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender])

  const tokenContract = useNFTContract(tokenAddress)
  const addTransaction = useTransactionAdder()

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }
    if (!tokenAddress) {
      console.error('no token')
      return
    }

    if (!tokenContract) {
      console.error('tokenContract is null')
      return
    }

    if (!amountToApprove) {
      console.error('missing amount to approve')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }

    const estimatedGas = await tokenContract.estimateGas.setApprovalForAll(spender, amountToApprove)

    return tokenContract
      .setApprovalForAll(spender, amountToApprove, {
        gasLimit: calculateGasMargin(estimatedGas),
      })
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Approve ' + amountToApprove,
          approval: { tokenAddress: tokenAddress, spender: spender },
        })
      })
      .catch((error: Error) => {
        console.debug('Failed to approve token', error)
        throw error
      })
  }, [approvalState, tokenAddress, tokenContract, amountToApprove, spender, addTransaction])

  return [approvalState, approve]
}
