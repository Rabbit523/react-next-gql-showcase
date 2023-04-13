import { Image } from '@nftmall/uikit'
import React, { FC, useCallback, useState } from 'react'

// import Image from '../Image'

export const UNKNOWN_ICON = 'https://raw.githubusercontent.com/sushiswap/icons/master/token/unknown.png'

interface LogoProps {
  srcs: string[]
  width: string | number
  height: string | number
  alt?: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
const Logo: FC<LogoProps> = ({ srcs, width, height, alt = '', className, style }) => {
  // const [, refresh] = useState<number>(0)

  return (
    <div className="rounded-full" style={{ width, height, ...style }}>
      <Image
        src={srcs[0] || UNKNOWN_ICON}
        // onErrorCapture={onErrorCapture}
        width={width}
        height={height}
        alt={alt}
        layout="fixed"
        // className={classNames('rounded-full', className)}
      />
    </div>
  )
}

export default Logo
