import { ChakraLayout, ErrorCodeProps } from '@nftmall/uikit'
import dynamic from 'next/dynamic'
import { memo } from 'react'

const NotFound = memo(dynamic<ErrorCodeProps>(() => import('@nftmall/uikit').then((module) => module.NotFound)))

function Index() {
  return (
    <ChakraLayout display="flex" zIndex={1}>
      <NotFound code={404} />
    </ChakraLayout>
  )
}

export default Index
