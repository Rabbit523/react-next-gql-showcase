import { BoxProps, FlexProps, StackProps } from '@chakra-ui/react'
import { NavItem, NextCollection, UserSearchResult } from '@nftmall/sdk'
import { Auction, Currency, NFT, Order, User } from '@prisma/client'
import { ChainId } from '@sushiswap/core-sdk'
// import { UserInfo } from '@uauth/js'

export interface NavbarProps {
  supportedChainIds: ChainId[]
  profile: User
  udUser?: any
  // udUser?: UserInfo
  isCheckout: boolean
  isNetworkModal: boolean
  isWrongNetwork: boolean
  rate: Currency[]
  handleSearch: (search: string) => Promise<any>
  logout: () => void
  openConnectModal: () => void
  // changeNetwork: (key: number) => void
  networkModalHandler: () => void
}
export interface SearchResultsProps extends StackProps {
  account: string
  onSearchClear: () => void
  rate: Currency[]
  searchResults: {
    collectionResults: NextCollection[]
    // nftResults: Item[]
    userResults: UserSearchResult[]
  }
}

export interface SearchBoxProps extends FlexProps {
  searchValue?: string
  isShow?: boolean
  isLoading?: boolean
  isTopBarHidden?: boolean
  rate: Currency[]
  searchResults: {
    collectionResults: NextCollection[]
    // nftResults: NFT[]
    userResults: UserSearchResult[]
  }
  account: string
  onSearchChange?: (value: string) => void
  onSearchClear: () => void
  onSearchKeyPress?: () => void
  toggleSearchBar: () => void
  handleAllResults?: () => void
}

export interface NFTSearchResult extends NFT {
  orders: Order[]
  auctions: Auction[]
}

export interface CollectionItemProps extends BoxProps {
  collection: NextCollection
  onSearchClear: () => void
  hoverBg: string
}

export interface UserItemProps extends BoxProps {
  user: UserSearchResult
  onSearchClear: () => void
  hoverBg: string
  account: string
}

export interface NFTItemProps extends BoxProps {
  nft: NFTSearchResult
}

export interface DropdownMenuProps {
  profile: User
  udUser?: any
  // udUser?: UserInfo
  logout: () => void
}
export interface MobileDropdownMenuProps {
  isOpen: boolean
  profile: User
  onPresentConnectModal: () => void
  onClose: () => void
  logout: () => void
}
export interface MainDropdownMenuProps {
  hoverOpen?: boolean
}

export interface SubmenuProps {
  link: NavItem
  onClose: () => void
}
