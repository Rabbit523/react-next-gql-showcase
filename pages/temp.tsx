import { getItem } from '@nftmall/sdk'
import { useMulticall2Contract } from 'app/hooks'
import { GetStaticProps } from 'next'
import { NextSeo } from 'next-seo'
import { useEffect } from 'react'

import CoinbaseWalletCard from '../reactweb3/components/connectorCards/CoinbaseWalletCard'
import GnosisSafeCard from '../reactweb3/components/connectorCards/GnosisSafeCard'
import MetaMaskCard from '../reactweb3/components/connectorCards/MetaMaskCard'
import NetworkCard from '../reactweb3/components/connectorCards/NetworkCard'
import WalletConnectCard from '../reactweb3/components/connectorCards/WalletConnectCard'
import ProviderExample from '../reactweb3/components/ProviderExample'

export default function Home({ item }) {
  console.warn({ item })
  const multicallContract = useMulticall2Contract()
  // const results = useSingleContractMultipleData(multicallContract, 'getEthBalance', validAddressInputs)

  // dedicated logger
  useEffect(() => {
    if (multicallContract) {
      const func = async () => {
        const res = await multicallContract.getEthBalance('0xDB02C4B05a927E099E70025602e4f2E0ff2C0F4C')
        console.error({ multicallContract, balance: res.toString() })
      }
      func()
    }
  }, [multicallContract])

  return (
    <>
      <NextSeo title={'Home'} description="Home description" />
      <ProviderExample item={item} />
      <div style={{ display: 'flex', flexFlow: 'wrap', fontFamily: 'sans-serif' }}>
        <MetaMaskCard />
        <WalletConnectCard />
        <CoinbaseWalletCard />
        <NetworkCard />
        <GnosisSafeCard />
      </div>
    </>
  )
}

// export const getStaticProps: GetStaticProps = async (context) => {
//   try {
//     // TODO: @nftgeek remove this for multichain
//     const item = await getItem(
//       `ETHEREUM:0xb01e8837b11b1df35d40e68e854de8c84442da92:992407561042662499056588433035485513272269371282058383418102565974352855042`
//     )
//     return {
//       props: {
//         item,
//       },
//       // revalidate: REVALIDATE_1_DAY,
//     }
//   } catch (e) {
//     console.error(e)
//   }
//   return {
//     props: {
//       item: {},
//       // itemChainId, // if `notFound` is true, all undefined props are sent to frontend. unnecessary.
//       // itemContractAddress,
//       // itemTokenId,
//     },
//     // revalidate: 60,
//     // notFound: true,
//   }
// }
