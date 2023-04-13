import { Box, chakra, useColorModeValue, useTheme } from '@chakra-ui/react'
import { CHAINID_TO_BLOCKCHAIN, nextApiFetchers } from '@nftmall/sdk'
import { BlacklistedUserModal, Footer } from '@nftmall/uikit'
import { AccountType } from '@prisma/client'
import { Blockchain } from '@rarible/api-client'
// import useUnstoppableAuth from 'app/contexts/UnstoppableAuthContext'
import useAuth from 'app/hooks/nftmall/useAuth'
// import { signMessage } from 'app/hooks/nftmall/useSignMessage'
import useToast from 'app/hooks/nftmall/useToast'
import { useCurrencyExchangeRate } from 'app/hooks/nftmall/useTokenBalances'
import useTopBar from 'app/hooks/nftmall/useTopBar'
import { useActiveWeb3React } from 'app/services/web3'
import { useModalOpen, useNetworkModalToggle, useWalletModalToggle } from 'app/state/application/hooks'
import { ApplicationModal } from 'app/state/application/reducer'
import { useFetchProfile, useProfile } from 'app/state/profile/hook'
import { supportedChainIds } from 'app/utils/constants'
import { restAPI } from 'app/utils/rest'
import { useRouter } from 'next/router'
import NextNprogress from 'nextjs-progressbar'
import { FC, Fragment, useCallback, useEffect, useMemo, useState } from 'react'

import Navbar from '../Navbar'
import NetworkModal from '../NetworkModal'
import WalletModal from '../WalletModal'

interface PageLayoutProps {
  children: React.ReactNode
}

const PageLayout: FC<PageLayoutProps> = ({ children }) => {
  const { logout } = useAuth()
  const { data: rate } = useCurrencyExchangeRate()
  const { profile, hasError } = useProfile()
  const { account, provider, chainId, isWrongNetwork, isActive } = useActiveWeb3React()
  // const { currentUser } = useUnstoppableAuth()
  const theme = useTheme()
  const { toastError, toastSuccess } = useToast()
  const router = useRouter()
  const [isCheckout, setIsCheckout] = useState(false)
  const [isBlacklistedModal, setIsBlackListedModal] = useState(false)
  const toggleWalletModal = useWalletModalToggle()
  const toggleNetworkModal = useNetworkModalToggle()
  const isNetworkModalOpen = useModalOpen(ApplicationModal.NETWORK)
  const { recommendedTopMarginPx } = useTopBar()

  // Show network modal on wrong networks
  useEffect(() => {
    if ((isWrongNetwork && !isNetworkModalOpen) || (!isWrongNetwork && isNetworkModalOpen)) {
      toggleNetworkModal()
    }
  }, [isWrongNetwork]) // DON'T ADD OTHER DEPS HERE

  useFetchProfile()

  useEffect(() => {
    if (router.pathname === '/checkout') {
      setIsCheckout(true)
    } else {
      setIsCheckout(false)
    }
  }, [router.pathname])

  useEffect(() => {
    if (provider && account) {
      const securityCheck = localStorage.getItem('NFTMALL_SIG')
      if (!securityCheck) {
        handleSecurityAsk()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, account])

  // useMemo(() => {
  //   if (!hasError && profile && !profile.username && router.pathname !== '/signup') {
  //     console.log(router?.pathname)
  //     router.push({ pathname: '/signup', query: { redirect: router.pathname } })
  //   }
  // }, [hasError, profile, router])

  useMemo(() => {
    // if user has not entered username and email, go to settings page.
    if (
      isActive &&
      account &&
      !hasError &&
      profile &&
      !profile.username &&
      !router.asPath?.includes('/account/settings')
    ) {
      // router.push({ pathname: '/account/settings', query: { redirect: router.asPath } })
    }

    // if user switches account in his metamask that has a valid profile, no need to stay on profile page.
    // just go to redirect link
    if (
      isActive &&
      account &&
      !hasError &&
      profile &&
      profile.username &&
      router.asPath?.includes('/account/settings') &&
      router?.query?.redirect
    ) {
      // router.replace(router.query.redirect as string)
    }
  }, [account, hasError, isActive, profile, router])

  useMemo(() => {
    if (profile?.blacklisted) {
      setIsBlackListedModal(true)
    } else {
      setIsBlackListedModal(false)
    }
  }, [profile?.blacklisted])

  const handleSecurityAsk = useCallback(async () => {
    // try {
    //   const msg = SecurityCheckMsg.concat(`Wallet address: ${account.toLowerCase()}\n\n`)
    //   // msg.concat(`Nonce: ${}`)
    //   const sig = await signMessage(library, account, msg)
    //   localStorage.setItem('NFTMALL_SIG', JSON.stringify({ time: new Date().getTime(), sig }))
    // } catch (e) {
    //   toastError('An error occurred.', e.message)
    // }
  }, [account, provider, toastError])

  const handleSubmit = useCallback(
    (email: string) => {
      restAPI
        .subscribe(email)
        .then(() => {
          toastSuccess('Thanks for signing up!')
        })
        .catch((e) => {
          console.error(e)
          toastError('An error occurred.', e.message)
        })
    },
    [toastError, toastSuccess]
  )

  const handleSearch = useCallback(
    async (search: string) => {
      const data = {
        offset: 0,
        limit: 5,
        nameQuery: search,
      }
      //  nextApiFetchers.collection.filter({
      //   skip: 0,
      //   count: 5,
      //   searchText: search,
      //   // sortBy: 'volume30d',
      //   hasMetadata: true,
      // })
      // const nftResults = restAPI.filterNFTs(data)
      try {
        const count = 8
        const [userResults, collectionResults] = await Promise.all([
          restAPI.filterUsers({ offset: 0, limit: count, nameQuery: search, type: AccountType.USER }),
          // filterUnionCollection(chainId || ChainId.THUNDERCORE, search),
          nextApiFetchers.collection.filter({
            chain: CHAINID_TO_BLOCKCHAIN[chainId] || Blockchain.ETHEREUM,
            searchText: search,
            count: count,
            skip: 0,
          }),
        ])
        console.log('Search result: ', userResults, collectionResults)
        return {
          collectionResults: collectionResults,
          // nftResults: res[1].result,
          userResults: userResults.result,
        }
      } catch (e) {
        console.error(e)
        // toastError('Oops', 'Searching failed. Try again after few mins.')
        return {
          userResults: [],
          collectionResults: [],
          // nftResults: [],
        }
      }
    },
    [chainId]
  )

  return (
    <Fragment>
      <NextNprogress
        color={useColorModeValue(theme.colors.light.primaryBg, 'white')}
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
        showOnShallow={true}
        options={{ easing: 'ease', speed: 500 }}
      />
      <chakra.main background={isCheckout ? theme.colors.bgStroke : ''}>
        <WalletModal />
        <NetworkModal isOpen={isNetworkModalOpen} onClose={toggleNetworkModal} />
        {router.pathname !== '/signup' && (
          <Navbar
            logout={logout}
            openConnectModal={toggleWalletModal}
            profile={profile}
            // udUser={currentUser}
            isCheckout={isCheckout}
            isNetworkModal={isNetworkModalOpen}
            isWrongNetwork={isWrongNetwork}
            networkModalHandler={toggleNetworkModal}
            handleSearch={handleSearch}
            rate={rate}
            supportedChainIds={supportedChainIds}
          />
        )}
        <Box
          as="section"
          // mt={{ base: hidden ? 24 : 36, lg: hidden ? 20 : 36 }} FIXME: add
          marginTop={`${recommendedTopMarginPx}px`}
          minHeight={
            router.pathname === '/signup' ? '100vh' : isCheckout ? 'calc(100vh - 348px)' : 'calc(100vh - 440px)'
          }
        >
          {children}
        </Box>
        {router.pathname !== '/signup' && (
          <Footer
            account={account}
            openConnectModal={toggleWalletModal}
            profile={profile}
            isCheckout={isCheckout}
            subscribe={handleSubmit}
          />
        )}
        {isBlacklistedModal && <BlacklistedUserModal isOpen={isBlacklistedModal} />}
      </chakra.main>
    </Fragment>
  )
}

export default PageLayout
