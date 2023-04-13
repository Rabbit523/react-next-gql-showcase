import { Flex, useColorModeValue, useMediaQuery } from '@chakra-ui/react'
import { ChakraText, Spinner, theme } from '@nftmall/uikit'

import { SearchResults } from './SearchResults'
import { SearchBoxProps } from './types'

export function DesktopSearchBox(props: SearchBoxProps): JSX.Element {
  const { searchResults, isLoading, rate, handleAllResults, onSearchClear, toggleSearchBar, account, ...rest } = props
  const searchBarBackColor = useColorModeValue(theme.colors.dark.secondaryBg, theme.colors.light.secondaryBg)
  const [isLarger1024, isLarger1440, isLarger1920, isLarger2560, isLarger3000] = useMediaQuery([
    '(min-width: 1024px)',
    '(min-width: 1440px)',
    '(min-width: 1920px)',
    '(min-width: 2560px)',
    '(min-width: 3000px)',
  ])

  return (
    <Flex
      display={{ base: 'none', lg: 'flex' }}
      flexDirection="column"
      position="absolute"
      margin="0 !important"
      left={0}
      top="60px"
      width="452px"
      minHeight="200px"
      paddingX={4}
      paddingY={6}
      backgroundColor={searchBarBackColor}
      borderRadius="base"
      boxShadow={theme.colors.boxShadow}
      zIndex={2}
      {...rest}
    >
      {isLoading ? (
        <Spinner size="sm" />
      ) : searchResults.collectionResults.length + searchResults.userResults.length === 0 ? (
        <ChakraText
          flex={1}
          width="80%"
          marginTop={14}
          marginLeft="auto"
          marginRight="auto"
          textAlign="center"
          fontSize="sm"
        >
          No results found
        </ChakraText>
      ) : (
        <>
          <SearchResults rate={rate} searchResults={searchResults} onSearchClear={onSearchClear} account={account} />
          {/* <Flex width="100%" justifyContent="center" alignItems="center" marginTop={5}>
            <SecondaryGradientButton size="lg" px={8} onClick={handleAllResults}>
              All Results
            </SecondaryGradientButton>
          </Flex> */}
        </>
      )}
    </Flex>
  )
}
