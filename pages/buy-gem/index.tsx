import { HStack, Tab, TabList, Tabs, Text } from '@chakra-ui/react'
import { ChakraLayout, ChakraText, Profile } from '@nftmall/uikit'
import { NextSeo } from 'next-seo'
import { FC, Fragment } from 'react'

interface BuyGemProps {
  user: Profile
}

const BuyGemPage: FC<BuyGemProps> = ({ user }) => {
  return (
    <Fragment>
      <NextSeo title="Buy GEM" />
      <ChakraLayout display="flex" flexDirection="column" width="100%" zIndex={1} position="relative">
        {/* <Tabs index={activeTabIndex} onChange={onChange} isLazy>
          <TabList border="none" overflowX="auto" overflowY="hidden" width="100%">
            {(isSearch ? defaultSearchTabs : defaultProfileTabs).map((tab, index) => (
              <Tab
                key={tab.label}
                fontWeight="bold"
                whiteSpace="nowrap"
                _focus={{ outline: 'none' }}
                textTransform={isSearch ? 'uppercase' : 'none'}
              >
                <HStack spacing={4}>
                  <ChakraText fontWeight="bold" type={index === activeTabIndex ? 'primary' : 'secondary'}>
                    {tab.label}
                  </ChakraText>
                  <ChakraText type={index === activeTabIndex ? 'main' : 'primary'}>
                    {tabCounts[tab.countKey]}
                  </ChakraText>
                </HStack>
              </Tab>
            ))}
          </TabList>
        </Tabs> */}
      </ChakraLayout>
    </Fragment>
  )
}

export default BuyGemPage
