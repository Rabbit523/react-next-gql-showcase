import {
  Box,
  Collapse,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem as ChakraMenuItem,
  MenuList,
  useColorModeValue,
  useDisclosure,
  useMediaQuery,
} from '@chakra-ui/react'
import { CLOUDNIARY_THEME_URL, NavItem, navLinks, NETWORK_ICON } from '@nftmall/sdk'
import {
  AvatarIcon,
  ChakraDivider,
  ChakraText,
  Image,
  MenuItem,
  NextChakraLink,
  SearchBarEffect2SVG,
  SearchBarEffectSVG,
  TertiaryButton,
  theme,
} from '@nftmall/uikit'
import { ChainId } from '@sushiswap/core-sdk'
import useGEMBuyLink from 'app/hooks/nftmall/useGEMBuyLink'
import { useActiveWeb3React } from 'app/services/web3'
import { useRouter } from 'next/router'
import { BiChevronDown } from 'react-icons/bi'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

import { bottomSocialLinks } from './constants'
import { DropdownMenuProps, MainDropdownMenuProps, MobileDropdownMenuProps, SubmenuProps } from './types'

function MobileDropdownMenu({ isOpen, onPresentConnectModal, onClose, logout }: MobileDropdownMenuProps) {
  const { account } = useActiveWeb3React()
  const gemLink = useGEMBuyLink()
  const searchBarBackColor = useColorModeValue(theme.colors.dark.secondaryBg, theme.colors.light.secondaryBg)
  const handleAuth = () => {
    onClose()
    if (account) {
      logout()
    } else {
      onPresentConnectModal()
    }
  }
  return (
    <Drawer onClose={onClose} isOpen={isOpen} size="xs">
      <DrawerOverlay />
      <DrawerContent padding={0}>
        <Box display="flex" width="full" height="full" padding={5} backgroundColor={searchBarBackColor}>
          <SearchBarEffectSVG position="absolute" left="0" top="0" width="100%" height="100%" zIndex={0} />
          <SearchBarEffect2SVG position="absolute" right="0" bottom="0" width="100%" height="100%" zIndex={0} />
          <DrawerCloseButton zIndex={2} />
          <DrawerBody padding={0} zIndex={1}>
            <Flex flex={1} width="100%" direction="column" align="flex-start" overflowY="auto">
              <Box aria-label="Mobile Menu" flex="1 0 auto" width="100%" marginTop={5}>
                {navLinks.map((item, index) =>
                  item.children ? (
                    <MobileSubMenu link={item} onClose={onClose} key={item.label} />
                  ) : (
                    <MenuItem
                      href={index === 0 ? gemLink : item.href}
                      label={item.label}
                      onClose={onClose}
                      key={item.label}
                    />
                  )
                )}
                <MenuItem href="/create" label="Create" onClose={onClose} />
                {account && <MenuItem href="/account" label="My Profile" onClose={onClose} />}
                {account && <MenuItem href="/account/settings" label="Profile Settings" onClose={onClose} />}
                <MenuItem onClick={handleAuth} label={account ? 'Logout' : 'Sign In'} data-cy="connect-wallet" />
              </Box>
              <Flex width="100%" justifyContent="space-around" flexWrap="wrap" marginTop={8} className="icon-link">
                <ChakraDivider />
                {bottomSocialLinks.map((item) => (
                  <NextChakraLink
                    key={item.href}
                    href={item.href}
                    margin={2}
                    isExternal
                    _hover={{
                      transition: 'all 0.3s ease',
                    }}
                    _focus={{
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Icon as={item.icon} fontSize="xl" />
                  </NextChakraLink>
                ))}
              </Flex>
            </Flex>
          </DrawerBody>
        </Box>
      </DrawerContent>
    </Drawer>
  )
}

function DesktopDropdownMenu(props: DropdownMenuProps) {
  const { profile, udUser, logout } = props
  const bgColor = useColorModeValue(theme.colors.light.secondaryBg, theme.colors.dark.secondaryBg)
  const borderColor = useColorModeValue(theme.colors.light.thirdStroke, theme.colors.dark.primaryStroke)
  const hoverBGColor = useColorModeValue(theme.colors.light.primaryStroke, theme.colors.dark.fourthStroke)
  const [isLarger768] = useMediaQuery(['(min-width: 768px)'])

  return (
    <Menu>
      {udUser?.sub === profile.address ? (
        <MenuButton
          disabled={isLarger768 ? false : true}
          as={TertiaryButton}
          data-cy="btn-user-menu"
          aria-label="menu"
          variant="unstyled"
          _focus={{ outline: 'none' }}
        >
          {udUser.sub}
        </MenuButton>
      ) : (
        <MenuButton
          borderRadius="50%"
          disabled={isLarger768 ? false : true}
          data-cy="btn-user-menu"
          aria-label="menu"
          as={IconButton}
          icon={<AvatarIcon user={profile} width={48} />}
          variant="unstyled"
          _focus={{ outline: 'none' }}
        />
      )}
      <MenuList
        minWidth="320px"
        background={bgColor}
        padding={4}
        borderColor={borderColor}
        borderRadius={1.5}
        borderWidth={1.4}
        boxShadow={theme.colors.boxShadow}
      >
        <ChakraMenuItem p={0}>
          <MenuItem href="/account" label="My Profile" width="100%" _hover={{ background: hoverBGColor }} />
        </ChakraMenuItem>
        <ChakraMenuItem p={0}>
          <MenuItem
            href="/account/settings"
            label="Profile Settings"
            width="100%"
            _hover={{ background: hoverBGColor }}
          />
        </ChakraMenuItem>

        <MenuDivider />
        <ChakraMenuItem p={0}>
          <MenuItem onClick={logout} label="Disconnect" width="100%" _hover={{ background: hoverBGColor }} />
        </ChakraMenuItem>
      </MenuList>
    </Menu>
  )
}

function MainDropdownMenu(props: MainDropdownMenuProps) {
  const { hoverOpen } = props
  const bgColor = useColorModeValue(theme.colors.light.secondaryBg, theme.colors.dark.secondaryBg)
  const borderColor = useColorModeValue(theme.colors.light.thirdStroke, theme.colors.dark.primaryStroke)
  const hoverBGColor = useColorModeValue(theme.colors.light.primaryStroke, theme.colors.dark.fourthStroke)
  const textColor = useColorModeValue(theme.colors.light.primaryText, theme.colors.dark.primaryText)
  return (
    <Menu>
      <MenuButton
        background={bgColor}
        borderColor={borderColor}
        color={textColor}
        borderWidth={1}
        borderRadius="full"
        paddingLeft={{ base: 1, xxs: 1, xs: 1, sm: 2, md: 4 }}
        paddingRight={{ base: 1, xxs: 0, xs: 1, sm: 1, md: 3 }}
        paddingY={{ base: 1, md: 4 }}
        _focus={{ outline: 'none' }}
        _active={{ bg: theme.colors.primaryGradient }}
        _hover={{
          borderColor: '#3FA4FA',
        }}
      >
        <HStack spacing={1}>
          <ChakraText>Category</ChakraText>
          <Icon as={BiChevronDown} w={6} h={6} />
        </HStack>
      </MenuButton>
      <MenuList
        minWidth="320px"
        background={bgColor}
        padding={4}
        borderColor={borderColor}
        borderRadius="10px"
        borderWidth="1px"
        boxShadow={theme.colors.boxShadow}
        _hover={{
          borderColor: '#3FA4FA',
        }}
      >
        <ChakraMenuItem>
          <HStack spacing={2}>
            <Image
              src={CLOUDNIARY_THEME_URL + NETWORK_ICON[ChainId.ETHEREUM]}
              alt="Switch Network"
              width={24}
              height={24}
              className="border-radius-full"
            />
            <ChakraText>BNB</ChakraText>
          </HStack>
        </ChakraMenuItem>
        <ChakraMenuItem>
          <HStack spacing={2}>
            <Image
              src={CLOUDNIARY_THEME_URL + NETWORK_ICON[ChainId.ETHEREUM]}
              alt="Switch Network"
              width={24}
              height={24}
              className="border-radius-full"
            />
            <ChakraText>BNB</ChakraText>
          </HStack>
        </ChakraMenuItem>
        <ChakraMenuItem>
          <HStack spacing={2}>
            <Image
              src={CLOUDNIARY_THEME_URL + NETWORK_ICON[ChainId.ETHEREUM]}
              alt="Switch Network"
              width={24}
              height={24}
              className="border-radius-full"
            />
            <ChakraText>BNB</ChakraText>
          </HStack>
        </ChakraMenuItem>
      </MenuList>
    </Menu>
  )
}

function MobileSubMenu({ link, onClose }: SubmenuProps) {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Box>
      <MenuItem onClick={onToggle}>
        <Flex align="center">
          <ChakraText fontSize="lg" fontWeight="bold">
            {link.label}
          </ChakraText>
          {/* <Box className="nav-link--effect">New</Box> */}
          <Box marginStart="2" as={isOpen ? FaChevronUp : FaChevronDown} fontSize="xs" />
        </Flex>
      </MenuItem>
      <Collapse in={isOpen}>
        <Box pl="5">
          {link.children?.map((item, idx) => (
            <MenuItem href={item.href} label={item.label} onClose={onClose} key={idx} />
          ))}
        </Box>
      </Collapse>
    </Box>
  )
}

function DesktopSubmenu(props: NavItem) {
  const { label, children } = props
  const bgColor = useColorModeValue(theme.colors.light.secondaryBg, theme.colors.dark.secondaryBg)
  const borderColor = useColorModeValue(theme.colors.light.thirdStroke, theme.colors.dark.primaryStroke)
  const hoverBGColor = useColorModeValue(theme.colors.light.primaryStroke, theme.colors.dark.fourthStroke)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const router = useRouter()

  const handleToggleItem = (item: NavItem) => {
    onClose()
    if (item.href) {
      router.push(item.href)
    }
  }

  return (
    <Menu isOpen={isOpen}>
      <MenuButton
        aria-label="nav-menu"
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
        h={{ base: 10, default: 12 }}
        mx={4}
        bg="transparent"
        _hover={{ bg: 'transparent' }}
        _focus={{ boxShadow: 'none' }}
        _active={{ bg: 'transparent' }}
      >
        <Flex align="center">
          <ChakraText fontSize="lg" fontWeight="bold">
            {label}
          </ChakraText>
          {/* <Box className="nav-link--effect">New</Box> */}
          <Box marginStart="2" as={isOpen ? FaChevronUp : FaChevronDown} fontSize="xs" />
        </Flex>
      </MenuButton>
      <MenuList
        minWidth="320px"
        background={bgColor}
        padding={4}
        borderColor={borderColor}
        borderRadius="2xl"
        borderWidth={1.4}
        boxShadow={theme.colors.boxShadow}
        onMouseEnter={onOpen}
        onMouseLeave={onClose}
      >
        {children?.map((item, idx) => (
          <ChakraMenuItem p={0} key={idx}>
            <MenuItem
              label={item.label}
              onClick={() => handleToggleItem(item)}
              width="100%"
              _hover={{ background: hoverBGColor }}
            />
          </ChakraMenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}

export const Submenu = {
  Mobile: MobileSubMenu,
  Desktop: DesktopSubmenu,
}

export const DropdownMenu = {
  Mobile: MobileDropdownMenu,
  Desktop: DesktopDropdownMenu,
  Main: MainDropdownMenu,
}
