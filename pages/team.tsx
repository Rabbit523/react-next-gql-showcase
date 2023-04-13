import { SimpleGrid, VStack } from '@chakra-ui/react'
import { defaultMetaData } from '@nftmall/sdk'
import { Banner, ChakraHeading, ChakraLayout, ChakraTeamCard, ChakraText } from '@nftmall/uikit'
import { NextSeo } from 'next-seo'
import { Fragment, memo } from 'react'

import { companyTeam } from '../utils/constants'

function Index() {
  return (
    <Fragment>
      <NextSeo {...defaultMetaData} title={`Team | NFTmall`} />
      <Banner from="team" />
      <ChakraLayout display="flex" flexDir="column">
        <VStack zIndex={1} spacing={8} maxWidth={{ base: '100%', lg: '80%' }} marginX="auto">
          <ChakraHeading as="h1" fontSize={{ base: '3xl', lg: '5xl', xl: '7xl' }} textTransform="capitalize">
            About us
          </ChakraHeading>
          <ChakraText fontSize="lg" textAlign="center">
            NFTmall is a next generation, decentralized NFT marketplace for creators/artists and collectors. We are
            harnessing the potential of DeFi and eCommerce to redefine NFT sharing, creation and ownership. It is
            designed to empower young talents and allow leading artists and creators bring their dreams to life.
          </ChakraText>
        </VStack>
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3, xxxl: 4 }}
          mt={{ base: 16, md: 24, lg: 36 }}
          spacingX="6"
          spacingY="16"
          zIndex={1}
        >
          {companyTeam.map((member) => (
            <ChakraTeamCard
              key={member.name}
              image={member.image}
              name={member.name}
              title={member.title}
              bio={member.summary}
              links={member.links}
            />
          ))}
        </SimpleGrid>
      </ChakraLayout>
    </Fragment>
  )
}

export default memo(Index)
