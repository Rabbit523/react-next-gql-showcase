import { CloseIcon } from '@chakra-ui/icons'
import { Flex, HStack, useColorModeValue } from '@chakra-ui/react'
import {
  ChakraText,
  SearchBar,
  SearchBarEffect2SVG,
  SearchBarEffectSVG,
  Spinner,
  TertiaryIconButton,
  theme,
} from '@nftmall/uikit'

import { SearchResults } from './SearchResults'
import { SearchBoxProps } from './types'

export function MobileSearchBox(props: SearchBoxProps): JSX.Element {
  const {
    account,
    searchValue,
    rate,
    searchResults,
    isLoading,
    isTopBarHidden,
    onSearchChange,
    onSearchClear,
    onSearchKeyPress,
    toggleSearchBar,
    handleAllResults,
  } = props

  const searchBarBackColor = useColorModeValue(theme.colors.dark.secondaryBg, theme.colors.light.secondaryBg)
  return (
    <Flex
      flexDirection="column"
      position="absolute"
      left={0}
      top={0}
      width="100vw"
      height="100vh"
      paddingX={4}
      paddingY={6}
      backgroundColor={searchBarBackColor}
      className="search-dropdown--noise"
      zIndex={2}
    >
      <SearchBarEffectSVG position="absolute" left="0" top="0" width="100%" height="100%" zIndex={-1} />
      <SearchBarEffect2SVG position="absolute" right="0" bottom="0" width="100%" height="100%" zIndex={-1} />
      <HStack width="100%">
        <SearchBar
          flex={1}
          size="lg"
          height={10}
          value={searchValue}
          autoFocus={true}
          onChange={onSearchChange}
          onClear={onSearchClear}
          onKeyPress={onSearchKeyPress}
        />
        <TertiaryIconButton onClick={toggleSearchBar}>
          <CloseIcon width={4} height={4} color="white" />
        </TertiaryIconButton>
      </HStack>
      {/* <Text>{searchValue === '' && 'Start typing name of a collection or a user.'}</Text> */}
      {isLoading ? (
        <Spinner />
      ) : searchValue &&
        searchValue.length > 2 &&
        searchResults.collectionResults.length === 0 &&
        // searchResults.nftResults.length === 0 &&
        searchResults.userResults.length === 0 ? (
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
        <SearchResults
          flex={1}
          width="100%"
          paddingX={0}
          marginTop={8}
          overflowX="hidden"
          overflowY="auto"
          backgroundColor="transparent"
          border="none"
          zIndex={1}
          account={account}
          rate={rate}
          searchResults={searchResults}
          onSearchClear={toggleSearchBar}
        />
      )}
      {/* {!isLoading &&
        (searchResults.collectionResults.length !== 0 ||
          // searchResults.nftResults.length !== 0 ||
          searchResults.userResults.length !== 0) && (
          <Flex width="100%" justifyContent="center" alignItems="center" marginTop="auto">
            <SecondaryGradientButton size="lg" px={8} onClick={handleAllResults}>
              All Results
            </SecondaryGradientButton>
          </Flex>
        )} */}
    </Flex>
  )
}
