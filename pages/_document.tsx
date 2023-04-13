import { ColorModeScript } from '@chakra-ui/react'
import { theme } from '@nftmall/uikit'
import NextDocument, { Head, Html, Main, NextScript } from 'next/document'

const refreshDocumentStyle = {
  background: theme.config.initialColorMode === 'dark' ? '#0c0a1d' : '#fff',
}

const APP_NAME = 'NFTmall'
const APP_DESCRIPTION = `People's NFT Marketplace. Collect, Trade and Materialize NFTs.`

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en" style={refreshDocumentStyle}>
        <Head>
          <meta name="application-name" content={APP_NAME} />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content={APP_NAME} />
          <meta name="description" content={APP_DESCRIPTION} />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#0993ec" />

          <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.png" />
          <link rel="apple-touch-icon" sizes="96x96" href="/icons/icon-96x96.png" />
          <link rel="apple-touch-icon" sizes="128x128" href="/icons/icon-128x128.png" />
          <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
          <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
          <link rel="apple-touch-icon" sizes="384x384" href="/icons/icon-384x384.png" />
          <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />

          <link rel="manifest" href="/manifest.json" />
          <link rel="shortcut icon" href="/favicon.ico" />
        </Head>
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
