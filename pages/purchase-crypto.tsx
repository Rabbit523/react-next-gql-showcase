import { Flex } from '@chakra-ui/react'
import { CRYPTO_PURCHASE_PAGE, defaultMetaData } from '@nftmall/sdk'
import { BannerProps, ChakraLayout, ENV } from '@nftmall/uikit'
import { NextSeo } from 'next-seo'
import dynamic from 'next/dynamic'
import { Fragment, memo, useState } from 'react'
import { isMobile } from 'react-device-detect'

const Banner = memo(dynamic<BannerProps>(() => import('@nftmall/uikit').then((module) => module.Banner)))
const IframeURL =
  process.env.NEXT_PUBLIC_NODE_ENV === ENV.PROD
    ? `${CRYPTO_PURCHASE_PAGE.iframe.prod}${process.env.NEXT_PUBLIC_TRANSAK_API_KEY}&themeColor=906DFE`
    : `${CRYPTO_PURCHASE_PAGE.iframe.staging}${process.env.NEXT_PUBLIC_TRANSAK_API_KEY}&themeColor=906DFE`

function Index() {
  const [iframeHeight, setIframeHeight] = useState(700)

  const handleIframeLoad = () => {
    const container = document.getElementById('iframe_container')
    if (container) {
      setIframeHeight(isMobile ? 600 : 850)
    }
  }
  return (
    <Fragment>
      <NextSeo {...defaultMetaData} title={`GEM Fiat | NFTmall`} />
      <Banner from="transak" />
      <ChakraLayout pt={{ base: 4, md: 8, default: 16 }} position="relative" zIndex={1}>
        <Flex justify="center" width="100%">
          <iframe
            title="Transak On/Off Ramp Widget (Website)"
            frameBorder={0}
            src={IframeURL}
            width="100%"
            height={`${iframeHeight}px`}
            id="iframe_container"
            className="iframe-container"
            onLoad={handleIframeLoad}
          />
        </Flex>
      </ChakraLayout>
    </Fragment>
  )
}

export default memo(Index)
