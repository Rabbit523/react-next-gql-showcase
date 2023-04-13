import '../bootstrap'
import 'rc-time-picker/assets/index.css'
import 'react-calendar/dist/Calendar.css'
import 'react-multi-carousel/lib/styles.css'
import '../public/styles/global.css'
import '@pathofdev/react-tag-input/build/index.css'

import { ApolloProvider } from '@apollo/client'
import { ChakraProvider } from '@chakra-ui/react'
import { defaultMetaData } from '@nftmall/sdk'
import { theme } from '@nftmall/uikit'
import PageLayout from 'app/components/PageLayout'
import Web3ProviderNetwork from 'app/components/Web3ProviderNetwork'
// import { i18n } from '@lingui/core'
// import { I18nProvider } from '@lingui/react'
// import { remoteLoader } from '@lingui/remote-loader'
import Web3ReactManager from 'app/components/Web3ReactManager'
import { exception, pageview } from 'app/functions/gtag'
// import DefaultLayout from 'app/layouts/Default'
import { BlockNumberProvider } from 'app/lib/hooks/useBlockNumber'
import { MulticallUpdater } from 'app/lib/state/multicall'
import store, { persistor } from 'app/state'
import ApplicationUpdater from 'app/state/application/updater'
import ListsUpdater from 'app/state/lists/updater'
// import LogsUpdater from 'app/state/logs/updater'
import TransactionUpdater from 'app/state/transactions/updater'
import UserUpdater from 'app/state/user/updater'
// import * as plurals from 'make-plural/plurals'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { DefaultSeo, NextSeo } from 'next-seo'
import React, { Fragment, useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { SWRConfig } from 'swr'

import ModalProvider from '../contexts/ModalContext'
import { RefreshContextProvider } from '../contexts/RefreshContext'
import { ToastProvider } from '../contexts/ToastContext'
import { TopBarContextProvider } from '../contexts/TopBarContext'
import Fonts from '../utils/font'
import { useApollo } from '../utils/useApollo'

const swrConfig = { refreshInterval: 10000 }

// const UnstoppableAuthProvider = dynamic(
//   () => import('../contexts/UnstoppableAuthContext').then((mod) => mod.UnstoppableAuthProvider),
//   {
//     ssr: false,
//   }
// )

// NOTE: using `dynamic` sometimes causes `not found module` during build
// const PageLayout = dynamic(() => import('../components/PageLayout'))

if (typeof window !== 'undefined' && !!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  TagManager.initialize({ gtmId: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER })
}

// @ts-ignore TYPE NEEDS FIXING
function MyApp({ Component, pageProps, fallback, err }) {
  const apolloClient = useApollo(pageProps.initialApolloState)

  const router = useRouter()
  const { locale, events } = router

  useEffect(() => {
    // @ts-ignore TYPE NEEDS FIXING
    const handleRouteChange = (url) => {
      pageview(url)
    }
    events.on('routeChangeComplete', handleRouteChange)

    // @ts-ignore TYPE NEEDS FIXING
    const handleError = (error) => {
      exception({
        description: `${error.message} @ ${error.filename}:${error.lineno}:${error.colno}`,
        fatal: true,
      })
    }

    window.addEventListener('error', handleError)

    return () => {
      events.off('routeChangeComplete', handleRouteChange)
      window.removeEventListener('error', handleError)
    }
  }, [events])

  // Allows for conditionally setting a provider to be hoisted per page
  const Provider = Component.Provider || Fragment

  // Allows for conditionally setting a layout to be hoisted per page
  const Layout = Component.Layout || Fragment // DefaultLayout

  // Allows for conditionally setting a guard to be hoisted per page
  const Guard = Component.Guard || Fragment

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"
        />
      </Head>
      <DefaultSeo {...defaultMetaData} />
      <Fonts />

      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      <ChakraProvider theme={theme}>
        {/* <I18nProvider i18n={i18n} forceRenderOnLocaleChange={false}> */}
        <Web3ProviderNetwork>
          <Web3ReactManager>
            <ReduxProvider store={store}>
              <PersistGate persistor={persistor}>
                {() => (
                  <BlockNumberProvider>
                    <>
                      <ListsUpdater />
                      <UserUpdater />
                      <ApplicationUpdater />
                      <TransactionUpdater />
                      <MulticallUpdater />
                      {/* <LogsUpdater /> */}
                    </>
                    <Provider>
                      <Layout>
                        <Guard>
                          <SWRConfig value={swrConfig}>
                            {/* <NextSeo title="ToastProvider" /> */}
                            <ApolloProvider client={apolloClient}>
                              <RefreshContextProvider>
                                <ModalProvider>
                                  <ToastProvider>
                                    <TopBarContextProvider>
                                      <PageLayout>
                                        {/* <NextSeo title="PageLayout" /> */}
                                        <Component {...pageProps} err={err} />
                                      </PageLayout>
                                    </TopBarContextProvider>
                                  </ToastProvider>
                                </ModalProvider>
                              </RefreshContextProvider>
                            </ApolloProvider>
                          </SWRConfig>
                        </Guard>
                      </Layout>
                    </Provider>
                  </BlockNumberProvider>
                )}
              </PersistGate>
            </ReduxProvider>
          </Web3ReactManager>
        </Web3ProviderNetwork>

        {/* </I18nProvider> */}
      </ChakraProvider>
    </>
  )
}

export default MyApp
