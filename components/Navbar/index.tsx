import { SearchIcon } from '@chakra-ui/icons'
import {
  Box,
  Container,
  Flex,
  HStack,
  Icon,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  useMediaQuery,
  useTheme,
  VStack,
} from '@chakra-ui/react'
import { CLOUDNIARY_THEME_URL, navLinks, NETWORK_ICON, NETWORK_LABEL } from '@nftmall/sdk'
import {
  AvatarIcon,
  ChakraErrorText,
  ChakraText,
  Image,
  LogoFooter,
  LogoHeader,
  MenuItem,
  MenuToggle,
  MobileMenuLSVG,
  NextChakraLink,
  PrimaryGradientButton,
  SearchBar,
  TertiaryButton,
  TertiaryIconButton,
  TopBar,
  useContainerDimensions,
  useScrollDirection,
} from '@nftmall/uikit'
import useGEMBuyLink from 'app/hooks/nftmall/useGEMBuyLink'
import useTopBar from 'app/hooks/nftmall/useTopBar'
import { useActiveWeb3React } from 'app/services/web3'
import { TOPBAR_LINK, TOPBAR_TEXT } from 'app/utils/constants'
import { useRouter } from 'next/router'
import { FC, useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { isFirefox } from 'react-device-detect'
import { BiChevronDown, BiLock } from 'react-icons/bi'
import { FiAlertTriangle } from 'react-icons/fi'

import Announcement from './Announcement'
import { DesktopSearchBox } from './DesktopSearchBox'
import { DropdownMenu, Submenu } from './DropdownMenu'
import { MobileSearchBox } from './MobileSearchBox'
import { NavbarProps } from './types'
import Warning from './Warning'

const Navbar: FC<NavbarProps> = ({
  profile,
  udUser,
  isCheckout,
  isWrongNetwork,
  rate,
  handleSearch,
  openConnectModal,
  networkModalHandler,
  logout,
}) => {
  const { chainId, account } = useActiveWeb3React()
  const router = useRouter()
  const theme = useTheme()
  const [isLarger768, isLarger1280] = useMediaQuery(['(min-width: 768px)', '(min-width: 1280px)'])

  // This breaks when 'Wrong network' is shown.
  const logoVariant = useBreakpointValue({ base: 'icon', sm: 'full-width' })

  const [mobileSearchBoxShow, setMobileSearchBoxShow] = useState(false)
  const [searchResults, setSearchResults] = useState({
    collectionResults: [],
    // nftResults: [],
    userResults: [],
  })
  const [searchValue, setSearchValue] = useState('')
  const [mobileSearchValue, setMobileSearchValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEnterKeyEvent, setIsEnterKeyEvent] = useState(false)
  const [desktopSearchBoxShown, setDesktopSearchBoxShown] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout>()
  const isScrollingDown = useScrollDirection(100)
  const { isAnnounceBarHidden, setAnnounceBarHiddenTime, increaseTopBarWarningCount, decreaseTopBarWarningCount } =
    useTopBar()
  const boxRef = useRef(null)
  const navRef = useRef(null)
  const boxRefDimensions = useContainerDimensions(boxRef)
  const navRefDimensions = useContainerDimensions(boxRef)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // WTF?!
  const handleClickEvent = useCallback((event: any) => {
    const desktopSearchBar = document.getElementById('desktop_search_bar')
    const desktopSearchBox = document.getElementById('desktop_search_box')

    if (
      desktopSearchBar &&
      desktopSearchBox &&
      desktopSearchBar !== event.target &&
      !desktopSearchBar.contains(event.target) &&
      desktopSearchBox !== event.target &&
      !desktopSearchBox.contains(event.target)
    ) {
      setDesktopSearchBoxShown(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('click', handleClickEvent)

    return () => {
      document.removeEventListener('click', handleClickEvent)
    }
  }, [handleClickEvent])

  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      console.log('route change routeChangeComplete')
    })
    return () => {
      router.events.off('routeChangeComplete', () => {
        console.log('stoped')
      })
    }
  }, [router.events])

  const handleBodyScroll = (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'visible'
      document.body.style.position = 'static'
      const offsetY = Math.abs(parseInt(document.body.style.top || '0', 10))
      document.body.style.removeProperty('top')
      window.scrollTo(0, offsetY || 0)
    } else {
      const offsetY = document.documentElement.scrollTop
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `${-offsetY}px`
    }
  }

  const toggleSearchBar = useCallback(() => {
    handleBodyScroll(mobileSearchBoxShow)
    setSearchValue('')
    setMobileSearchValue('')
    setSearchResults({
      collectionResults: [],
      // nftResults: [],
      userResults: [],
    })
    setMobileSearchBoxShow(!mobileSearchBoxShow)
  }, [mobileSearchBoxShow])

  const onSearchChange = useCallback(
    async (value: string) => {
      if (mobileSearchBoxShow) {
        setMobileSearchValue(value)
      } else {
        setSearchValue(value)
      }
      if (value.length > 2) {
        setDesktopSearchBoxShown(true)
        setIsLoading(true)

        const timeout = setTimeout(async () => {
          if (value !== '' && value.length > 2 && !isEnterKeyEvent) {
            const response = await handleSearch(value)
            const { collectionResults, /*nftResults,*/ userResults } = response
            setSearchResults({
              collectionResults,
              // nftResults,
              userResults,
            })
            setIsLoading(false)
            if (typingTimeout) {
              clearTimeout(typingTimeout)
            }
          }
        }, 1500)
        setTypingTimeout(timeout)
      } else {
        setDesktopSearchBoxShown(false)
      }
    },
    [handleSearch, isEnterKeyEvent, mobileSearchBoxShow, typingTimeout]
  )

  const onSearchClear = useCallback(() => {
    setSearchValue('')
    setMobileSearchValue('')
    setSearchResults({
      collectionResults: [],
      // nftResults: [],
      userResults: [],
    })
  }, [])

  const handleAllResults = useCallback(() => {
    // setIsEnterKeyEvent(true)
    // if (mobileSearchBoxShow) {
    //   if (
    //     searchResults.collectionResults.length > 0 ||
    //     // searchResults.nftResults.length > 0 ||
    //     searchResults.userResults.length > 0
    //   ) {
    //     router.push({ pathname: '/search', query: { name: mobileSearchValue } })
    //   }
    //   setIsEnterKeyEvent(false)
    //   toggleSearchBar()
    // } else {
    //   if (
    //     searchResults.collectionResults.length > 0 ||
    //     // searchResults.nftResults.length > 0 ||
    //     searchResults.userResults.length > 0
    //   ) {
    //     router.push({ pathname: '/search', query: { name: searchValue } })
    //   }
    //   setIsEnterKeyEvent(false)
    //   onSearchClear()
    // }
  }, [
    mobileSearchBoxShow,
    mobileSearchValue,
    onSearchClear,
    router,
    searchResults?.collectionResults?.length,
    searchResults?.userResults?.length,
    searchValue,
    toggleSearchBar,
  ])

  const isVisibleSignIn = !isCheckout && !(account && profile) && !isWrongNetwork
  const isVisibleWrongNetwork = !isCheckout && !(account && profile) && isWrongNetwork
  const isVisibleProfileWarningBar = account && profile && !profile.username

  const gemLink = useGEMBuyLink()

  useEffect(() => {
    if (isVisibleProfileWarningBar) {
      increaseTopBarWarningCount()
    } else {
      decreaseTopBarWarningCount()
    }
  }, [isVisibleProfileWarningBar])

  return (
    <Box
      ref={navRef}
      as="nav"
      position="fixed"
      zIndex={99}
      width="100%"
      height={
        navRef && boxRef && !isLarger1280 && isScrollingDown && !mobileSearchBoxShow && !isOpen
          ? navRefDimensions.height - boxRefDimensions.height
          : 'auto'
      }
    >
      {isVisibleProfileWarningBar && (
        <TopBar
          background={theme.colors.toast.warning}
          isWarning
          isMobileMenuShown={isOpen || mobileSearchBoxShow}
          isAnnounceBarHidden={isAnnounceBarHidden}
          setAnnounceBarHiddenTime={setAnnounceBarHiddenTime}
        >
          <Warning />
        </TopBar>
      )}
      <Box
        ref={boxRef}
        position="relative"
        zIndex={99}
        background={
          isFirefox
            ? isOpen
              ? 'rgba(0, 0, 0, 0.8)'
              : 'rgba(0, 0, 0, 0.6) none repeat scroll 0% 0%'
            : isOpen
            ? 'linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%)'
            : 'transparent'
        }
        backdropFilter="blur(32px)"
        transform={
          !isLarger1280 && isScrollingDown && !mobileSearchBoxShow && !isOpen ? 'translate3d(0, -200%, 0)' : 'none'
        }
        transition="transform 0.5s"
      >
        <TopBar
          background={useColorModeValue(theme.colors.light.secondaryBg, theme.colors.light.secondaryBg)}
          isMobileMenuShown={isOpen || mobileSearchBoxShow}
          isAnnounceBarHidden={isAnnounceBarHidden}
          setAnnounceBarHiddenTime={setAnnounceBarHiddenTime}
        >
          <Announcement link={TOPBAR_LINK} text={TOPBAR_TEXT} />
        </TopBar>

        {/* asdf */}
        {isOpen && (
          <MobileMenuLSVG position="absolute" left="-100px" bottom="0" width="256px" height="318px" zIndex={-1} />
        )}
        <Container
          display="flex"
          flexDirection="column"
          height="100%"
          width="90%"
          maxWidth="90%"
          paddingX={0}
          paddingY={3}
        >
          <Flex align="center" justify="space-between" wrap="wrap" w="100%">
            <HStack flex={1} align="center" spacing={2}>
              {logoVariant === 'icon' ? <LogoFooter /> : <LogoHeader />}
              {!isCheckout && (
                <VStack position="relative">
                  <SearchBar
                    id="desktop_search_bar"
                    display={{ base: 'none', default: 'flex' }}
                    maxWidth="532px"
                    size="lg"
                    placeholder="User or Collection"
                    value={searchValue}
                    onChange={onSearchChange}
                    onClear={onSearchClear}
                    onKeyPress={handleAllResults}
                  />
                  {desktopSearchBoxShown && searchValue !== '' && (
                    <DesktopSearchBox
                      id="desktop_search_box"
                      account={account}
                      rate={rate}
                      searchResults={searchResults}
                      isLoading={isLoading}
                      handleAllResults={handleAllResults}
                      onSearchClear={onSearchClear}
                      toggleSearchBar={toggleSearchBar}
                    />
                  )}
                </VStack>
              )}
            </HStack>
            {!isCheckout && (
              <Flex w="auto" align="center" justify="flex-end">
                <Box as="ul" aria-label="Main Menu" display={{ base: 'none', xl: 'flex' }} listStyleType="none">
                  {navLinks.map((item, index) => (
                    <Box as="li" key={item.label} id={`nav__menuitem-${index}`}>
                      {item.children ? (
                        <Submenu.Desktop {...item} />
                      ) : (
                        <MenuItem href={index === 0 ? gemLink : item.href} label={item.label} isUnderline={true} />
                      )}
                    </Box>
                  ))}
                </Box>
                <Flex gridColumnGap={{ base: 2, xl: 4 }}>
                  <NextChakraLink display={{ base: 'none', xl: 'flex' }} href="/create">
                    {account && profile && (
                      <PrimaryGradientButton
                        fontWeight="bold"
                        fontSize={{ base: 'md', default: 'lg' }}
                        size={isLarger768 ? 'lg' : 'md'}
                        width="max-content"
                        aria-label="go to create page"
                      >
                        Create
                      </PrimaryGradientButton>
                    )}
                  </NextChakraLink>
                  <TertiaryIconButton
                    display={{ base: 'flex', default: 'none' }}
                    onClick={toggleSearchBar}
                    aria-label="search database"
                    size={isLarger768 ? 'lg' : 'md'}
                  >
                    <SearchIcon width={4} height={4} color="white" />
                  </TertiaryIconButton>

                  {isWrongNetwork ? (
                    <TertiaryButton
                      onClick={networkModalHandler}
                      aria-label="wrong network"
                      size={{ base: 'md', md: 'lg' }}
                      borderRadius="full"
                      paddingLeft={{ base: '4px !important', xxs: 1, xs: 1, sm: 2, md: 4 }}
                      paddingRight={{ base: '4px !important', xxs: 0, xs: 1, sm: 1, md: 3 }}
                    >
                      <HStack spacing={1}>
                        <ChakraErrorText as="span" display={{ base: 'none', xs: 'block' }}>
                          Wrong Network
                        </ChakraErrorText>
                        <Icon
                          color="orangered"
                          as={FiAlertTriangle}
                          w={5}
                          h={5}
                          display={{ base: 'block', xs: 'none' }}
                        />
                        <Icon as={BiChevronDown} w={6} h={6} />
                      </HStack>
                    </TertiaryButton>
                  ) : chainId && account ? (
                    <TertiaryButton
                      onClick={networkModalHandler}
                      aria-label="switch network"
                      size={{ base: 'md', md: 'lg' }}
                      paddingLeft={{ base: '8px !important', xxs: 1, xs: 1, sm: 2, md: 4 }}
                      paddingRight={{ base: '2px !important', xxs: 0, xs: 1, sm: 1, md: 3 }}
                      borderRadius="full"
                      // style={!isLarger768 ? { paddingLeft: '8px', paddingRight: '2px' } : undefined}
                    >
                      <HStack spacing={1}>
                        <Image
                          src={CLOUDNIARY_THEME_URL + NETWORK_ICON[chainId]}
                          alt="Switch Network"
                          width={24}
                          height={24}
                          className="border-radius-full"
                        />
                        <ChakraText display={{ base: 'none', md: 'block' }}>{NETWORK_LABEL[chainId]}</ChakraText>
                        <Icon as={BiChevronDown} w={6} h={6} />
                      </HStack>
                    </TertiaryButton>
                  ) : null}
                  {isVisibleSignIn && (
                    <PrimaryGradientButton
                      // display={{ base: 'none', lg: 'flex' }}
                      width="max-content"
                      fontSize={{ base: 'md', md: 'lg' }}
                      size={{ base: 'md', md: 'lg' }}
                      fontWeight="bold"
                      onClick={openConnectModal}
                      data-testid="connect-wallet"
                      aria-label="connect-wallet"
                    >
                      Sign In
                    </PrimaryGradientButton>
                  )}
                  {account &&
                    profile &&
                    (isLarger1280 ? (
                      <DropdownMenu.Desktop profile={profile} udUser={udUser} logout={logout} />
                    ) : (
                      <NextChakraLink href="/account" display="flex">
                        {udUser?.sub === account.toLowerCase() ? (
                          udUser?.sub
                        ) : (
                          <AvatarIcon user={profile} width={isLarger768 ? 48 : 40} />
                        )}
                      </NextChakraLink>
                    ))}
                  <MenuToggle toggle={onOpen} isOpen={isOpen} isLarger768={isLarger768} />
                </Flex>
              </Flex>
            )}
            {isCheckout && (
              <HStack spacing={2}>
                <ChakraText>SECURE PAYMENT</ChakraText>
                <Icon as={BiLock} w={6} h={6} marginLeft={1}></Icon>
              </HStack>
            )}
          </Flex>
          {!isCheckout && (
            <DropdownMenu.Mobile
              onPresentConnectModal={openConnectModal}
              onClose={onClose}
              logout={logout}
              profile={profile}
              isOpen={isOpen}
            />
          )}
          {!isCheckout && mobileSearchBoxShow && (
            <MobileSearchBox
              account={account}
              searchValue={mobileSearchValue}
              searchResults={searchResults}
              rate={rate}
              isLoading={isLoading}
              onSearchChange={onSearchChange}
              onSearchClear={onSearchClear}
              onSearchKeyPress={handleAllResults}
              toggleSearchBar={toggleSearchBar}
              handleAllResults={handleAllResults}
            />
          )}
        </Container>
      </Box>
      {/* <ChakraDivider width="100%" mt={{ base: 4, default: 8 }} /> */}
    </Box>
  )
}

export default Navbar
