import { Global } from '@emotion/react'

const Fonts = () => (
  <Global
    styles={`
      @font-face {
        font-family: 'EuclidCircular';
        src: url('/fonts/EuclidCircularA-Regular-WebXL.woff2');
        font-display: swap;
      }
      @font-face {
        font-family: 'EuclidCircular-Light';
        src: url('/fonts/EuclidCircularA-Light-WebXL.woff2');
        font-display: swap;
      }
      @font-face {
        font-family: 'EuclidCircular-Medium';
        src: url('/fonts/EuclidCircularA-Medium-WebXL.woff2');
        font-display: swap;
      }
      @font-face {
        font-family: 'EuclidCircular-Semibold';
        src: url('/fonts/EuclidCircularA-Semibold-WebXL.woff2');
        font-display: swap;
      }
      @font-face {
        font-family: 'EuclidCircular-Bold';
        src: url('/fonts/EuclidCircularA-Bold-WebXL.woff2');
        font-display: swap;
      }
    `}
  />
)

export default Fonts;