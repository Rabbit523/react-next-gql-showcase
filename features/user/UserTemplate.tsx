import {
  Box,
  ButtonProps,
  ContainerProps,
  Flex,
  HeadingProps,
  HStack,
  Stack,
  TextProps,
  useMediaQuery,
  VStack,
} from '@chakra-ui/react'
import {
  compareAddresses,
  defaultProfileSocialFields,
  defaultProfileTabs,
  defaultUserCoverURL,
  delay,
  getUserPageMeta,
  hasValues,
  TabData,
  truncateAddress,
  uriFromLink,
  uriToHttps,
  uriToSocialLink,
} from '@nftmall/sdk'
import {
  AvatarIconProps,
  ChakraExternalLink,
  ChakraTextProps,
  CopyButton,
  FileUploadModalProps,
  ModalProps,
  MultiPortalButtonProps,
  PencilUploadButton,
  Profile,
  reactIcons,
  SharePortalButtonProps,
} from '@nftmall/uikit'
import { NFT, User } from '@prisma/client'
import useReportModal from 'app/features/report/useReportModal'
import useModal from 'app/hooks/nftmall/useModal'
import { signMessage } from 'app/hooks/nftmall/useSignMessage'
import useToast from 'app/hooks/nftmall/useToast'
import { useActiveWeb3React } from 'app/services/web3'
import { useWalletModalToggle } from 'app/state/application/hooks'
import { useAppDispatch } from 'app/state/hooks'
import { profileFetchSucceeded } from 'app/state/profile'
import { useUserProfile } from 'app/state/profile/hook'
import { apolloAPI } from 'app/utils/apollo'
import { restAPI, UserTabCounts } from 'app/utils/rest'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { FC, Fragment, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'

import { ChakraDataTabs } from './ChakraDataTabs'

const AvatarIcon = memo(dynamic<AvatarIconProps>(() => import('@nftmall/uikit').then((module) => module.AvatarIcon)))
const ChakraGradientText = memo(
  dynamic<TextProps>(() => import('@nftmall/uikit').then((module) => module.ChakraGradientText))
)
const ChakraHeading = memo(dynamic<HeadingProps>(() => import('@nftmall/uikit').then((module) => module.ChakraHeading)))
const ChakraLayout = memo(dynamic<ContainerProps>(() => import('@nftmall/uikit').then((module) => module.ChakraLayout)))
const ChakraText = memo(dynamic<ChakraTextProps>(() => import('@nftmall/uikit').then((module) => module.ChakraText)))
const FileUploadModal = memo(
  dynamic<FileUploadModalProps>(() => import('@nftmall/uikit').then((module) => module.FileUploadModal))
)
const LoadingModal = memo(dynamic<ModalProps>(() => import('@nftmall/uikit').then((module) => module.LoadingModal)))
const MultiPortalButton = memo(
  dynamic<MultiPortalButtonProps>(() => import('@nftmall/uikit').then((module) => module.MultiPortalButton))
)
const PrimaryGradientButton = memo(
  dynamic<ButtonProps>(() => import('@nftmall/uikit').then((module) => module.PrimaryGradientButton))
)
const SharePortalButton = memo(
  dynamic<SharePortalButtonProps>(() => import('@nftmall/uikit').then((module) => module.SharePortalButton))
)
const UploadButton = memo(dynamic<ButtonProps>(() => import('@nftmall/uikit').then((module) => module.UploadButton)))

interface UserTemplate {
  user: Profile
}

const UserTemplate: FC<UserTemplate> = ({ user: userFromParent }) => {
  const { data: user, mutate: mutateProfile } = useUserProfile({
    variables: { id: userFromParent?.userId, skipCache: true },
    shouldFetch: !!userFromParent?.userId,
    swrConfig: {
      fallbackData: userFromParent,
    },
  })

  const { account, library } = useActiveWeb3React()
  const dispatch = useAppDispatch()
  // const { data: rate, isLoading: isLoadingRate } = useCurrencyExchangeRate()
  const [isLargerThan768, isLarger1920] = useMediaQuery(['(min-width: 768px)', '(min-width: 1920px)'])
  const initialLimit = isLarger1920 ? 10 : isLargerThan768 ? 6 : 3
  const router = useRouter()
  const { toastError, toastSuccess } = useToast()
  const [collections, setCollections] = useState<User[]>([])
  const [isAvatarUpload, setIsAvatarUpload] = useState(false)
  const [isCoverUpload, setIsCoverUpload] = useState(false)
  const isOwner = useMemo(() => !!(account && user && compareAddresses(user.userId, account)), [account, user])
  const [isTabLoading, setIsTabLoading] = useState(true)
  const [followerCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingsCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [selectedTabIndex, setSelectedTab] = useState(0) // TODO:
  const [tabData, setTabData] = useState<TabData[]>(defaultProfileTabs)
  const [tabCounts, setTabCounts] = useState<UserTabCounts>()
  const [offsets, setOffsets] = useState([])
  const [canLoadMore, setCanLoadMore] = useState([])
  const [loadingTitle, setLoadingTitle] = useState('')
  const [loadingMessage, setLoadingMessage] = useState('')
  const [onPresentLoadingModal, onDismissLoadingModal] = useModal(
    <LoadingModal title={loadingTitle} description={loadingMessage} />
  )
  const toggleWalletModal = useWalletModalToggle()

  const pageMeta = useMemo(() => getUserPageMeta(userFromParent), [userFromParent])
  const socialLinks = useMemo(() => (user?.links ? JSON.parse(JSON.stringify(user.links)) : undefined), [user.links])
  const tabDataInitialize = useCallback(
    async (tabIndex: number, isInitialize = false) => {
      return
      const tmpTabData = [...tabData]
      const tmpOffsets = [...offsets]
      const tmpLoadable = [...canLoadMore]
      const offset = tmpOffsets.find((offset) => offset.index === tabIndex)
      const isLoadMore = tmpLoadable.find((obj) => obj.index === tabIndex)
      let updateLoadable: boolean
      if (isInitialize || !isLoadMore || isLoadMore?.value) {
        setIsTabLoading(true)
        try {
          const offsetParam = isInitialize ? 0 : offset ? offset.value : 0
          if (tabIndex === 0) {
            const content = await apolloAPI.fetchNFTBySale(user.userId, offsetParam, initialLimit)
            tmpTabData[tabIndex].content = isInitialize ? content : [...tmpTabData[tabIndex].content, ...content]
            updateLoadable = content.length < initialLimit ? false : true
          } else if (tabIndex === 1) {
            const content = await apolloAPI.fetchNFTByOwner(user.userId, offsetParam, initialLimit)
            const filteredContent = content?.filter((nft: NFT) => nft.creatorId !== user.userId)
            tmpTabData[tabIndex].content = isInitialize
              ? filteredContent
              : [...tmpTabData[tabIndex].content, ...filteredContent]
            updateLoadable = content.length < initialLimit ? false : true
          } else if (tabIndex === 2) {
            const content = await apolloAPI.fetchNFTByCreator(user.userId, offsetParam, initialLimit)
            tmpTabData[tabIndex].content = isInitialize ? content : [...tmpTabData[tabIndex].content, ...content]
            updateLoadable = content.length < initialLimit ? false : true
          } else if (tabIndex === 3) {
            const content = await apolloAPI.fetchNFTByLiked(user.userId, offsetParam, initialLimit)
            tmpTabData[tabIndex].content = isInitialize ? content : [...tmpTabData[tabIndex].content, ...content]
            updateLoadable = content.length < initialLimit ? false : true
          } else if (tabIndex === 4) {
            const content = await apolloAPI.fetchFollowers(user.userId, offsetParam, initialLimit)
            tmpTabData[tabIndex].content = isInitialize ? content : [...tmpTabData[tabIndex].content, ...content]
            updateLoadable = content.length < initialLimit ? false : true
          } else if (tabIndex === 5) {
            const content = await apolloAPI.fetchFollowing(user.userId, offsetParam, initialLimit)
            tmpTabData[tabIndex].content = isInitialize ? content : [...tmpTabData[tabIndex].content, ...content]
            updateLoadable = content.length < initialLimit ? false : true
          }
          setTabData(tmpTabData)
          setIsTabLoading(false)
          // NOTE: update offset for the load more event
          if (offset) {
            offset.value = isInitialize ? initialLimit : offset.value + initialLimit
            setOffsets(tmpOffsets)
          } else {
            tmpOffsets.push({
              index: tabIndex,
              value: initialLimit,
            })
          }
          setOffsets(tmpOffsets)
          // NOTE: if fetched length is less than purposed limit, then that means there is no data to fetch more.
          if (!isLoadMore) {
            tmpLoadable.push({
              index: tabIndex,
              value: updateLoadable,
            })
          } else {
            isLoadMore.value = updateLoadable
          }
          setCanLoadMore(tmpLoadable)
        } catch (e) {
          console.log(e)
        }
        setIsTabLoading(false)
      }
    },
    [canLoadMore, initialLimit, offsets, tabData, user.userId]
  )

  useEffect(() => {
    // let isCancel = false
    // const fetchData = async () => {
    //   try {
    //     const res = await apolloAPI.fetchAllCollections()
    //     setCollections(res)
    //   } catch (e) {
    //     console.error(e)
    //   }
    // }
    // if (!isCancel) {
    //   fetchData()
    // }
    // return () => {
    //   isCancel = true
    // }
  }, [])

  useEffect(() => {
    // let isCancel = false
    // const fetchData = async () => {
    //   console.log('fetchData called')
    //   try {
    //     const res = await restAPI.getUserDetailDataCount(currentUser.userId)
    //     setTabCounts(res)
    //   } catch (e) {
    //     console.error(e)
    //   }
    // }
    // if (!isCancel) {
    //   fetchData()
    //   tabDataInitialize(selectedTabIndex, true)
    // }
    // return () => {
    //   isCancel = true
    // }
  }, []) // tabDataInitialize, selectedTab, currentUser.userId

  useEffect(() => {
    if (loadingTitle && loadingMessage) {
      onPresentLoadingModal()
    }
  }, [loadingTitle, loadingMessage, onPresentLoadingModal])

  const onInitiateModalState = useCallback(() => {
    onDismissLoadingModal()
    setLoadingTitle('')
    setLoadingMessage('')
  }, [onDismissLoadingModal])

  const handleChange = useCallback(
    async (file: Blob, type: string) => {
      const data = new FormData()
      data.append('file', file)
      data.append('type', type)
      setLoadingTitle(type === 'avatar' ? 'Update avatar' : 'Update cover')
      setLoadingMessage(type === 'avatar' ? 'Sign message to update avatar' : 'Sign message to update cover')
      try {
        const targetName = type === 'avatar' ? 'profile picture' : 'cover picture'
        const cloudinaryMsg = `I would like to update ${targetName}.`
        const signature = await signMessage(library, account, cloudinaryMsg)
        data.append('sig', signature)
        data.append('userId', account.toLowerCase())
        data.append('message', cloudinaryMsg)
        const { user } = await restAPI.updateCloudinaryImage(data)
        console.log('New user: ', user)
        await mutateProfile()
        await delay(2 * 1000)
        if (user) {
          toastSuccess('Success!', 'Your account details have been updated.')
          dispatch(profileFetchSucceeded({ profile: user }))
        }
        onInitiateModalState()
      } catch (error) {
        console.error(error)
        onInitiateModalState()
        toastError('An error occurred.', error.message)
      }
    },
    [account, dispatch, library, onInitiateModalState, mutateProfile, toastError, toastSuccess]
  )

  const handleFollow = async () => {
    if (isOwner) {
      router.push('/profile')
    } else if (account) {
      onHandleFollow(userFromParent, isFollowing ? 0 : 1)
    } else {
      toggleWalletModal()
    }
  }

  const handleEditProfile = async () => {
    if (isOwner) {
      return router.push('/account/settings')
    }
    toastError(
      'Unable to edit profile',
      'You are not allowed to edit this profile. Contact us if you think this is a mistake.'
    )
  }

  const onHandleFollow = async (user: User, mode: number): Promise<string> => {
    return ''
    //   if (!account) {
    //   toggleWalletModal()
    //   return ''
    // } else {
    //   const res = await handleUserFollow(user, mode, account, library)
    //   if (res) {
    //     /* NOTE: graphql subscription doesn't happen even relationed data is changed on DB. */
    //     const temp = currentUser.following
    //     if (mode) {
    //       temp.push({ user: profile })
    //     } else {
    //       temp.filter((follower) => follower.user.userId === account?.toLowerCase())
    //     }
    //     setCurrentUser({ ...currentUser, following: temp })
    //     setTabCounts({ ...tabCounts, followings: mode ? tabCounts.followings + 1 : tabCounts.followings - 1 })
    //     /* NOTE: graphql subscription doesn't happen even relationed data is changed on DB. */
    //     const msg = mode
    //       ? `You followed '${currentUser.name || currentUser.userId}'.`
    //       : `You unfollowed '${currentUser.name || currentUser.userId}'.`
    //     toastSuccess('Success', msg)
    //   } else {
    //     toastError('Error', res)
    //   }
    //   return res
    // }
  }

  const onHandleLike = useCallback(async (likes: number, nft: NFT, mode: number): Promise<string> => {
    return ''
    //   if (!account) {
    //   toggleWalletModal()
    //   return ''
    // } else {
    //   const res = await handleNFTLike(likes, nft, currentUser.userId, mode, account, library)
    //   if (res) {
    //     const msg = mode ? `You saved like for '${nft.name}'NFT.` : `You remove like for the '${nft.name}'NFT.`
    //     toastSuccess('Success', msg)
    //   } else {
    //     toastError('Error', res)
    //   }
    //   return res
    // }
  }, [])

  const handleTabsChange = useCallback(
    (tabIndex: number) => {
      tabDataInitialize(tabIndex, true)
      setSelectedTab(tabIndex)
      const withoutHash = router?.asPath?.split('#')?.[0]
      if (withoutHash && defaultProfileTabs[tabIndex]?.key) {
        router.replace(withoutHash + defaultProfileTabs[tabIndex]?.key)
      }
    },
    [router, tabDataInitialize]
  )

  useEffect(() => {
    defaultProfileTabs.forEach((tabData, index) => {
      if (router.asPath.includes(tabData.key)) {
        setSelectedTab(index)
      }
    })
  }, []) // Only once on load

  const windowLocationHref = typeof window !== 'undefined' ? window.location.href : '#'

  const [onPresentAvatarFileDialog] = useModal(
    <FileUploadModal
      title="Upload avatar"
      description="We recommend an image of at least 400x400. Gifs work too."
      type="avatar"
      handleChange={(file, type) => handleChange(file, type)}
    />
  )
  const [onPresentCoverFileDialog] = useModal(
    <FileUploadModal
      title="Upload cover"
      description="Upload new cover for your profile page. We recommend to upload images in 1440x260 resolution"
      type="cover"
      handleChange={(file, type) => handleChange(file, type)}
    />
  )

  const [onPresentReportModal, onDismissReportModal] = useReportModal()

  return (
    <Fragment>
      <NextSeo {...pageMeta} />
      {/* {tabData && (
        <Banner
          from="user"
          isTabLoading={isTabLoading}
          isUserTab={selectedTabIndex === 3 || selectedTabIndex === 4}
          tabData={tabData ? tabData[selectedTabIndex]?.content?.length || 0 : 0}
        />
      )} */}
      <ChakraLayout display="flex" flexDirection="column" width="100%" zIndex={1} position="relative">
        <Flex
          position="relative"
          height={{ base: 64, xxl: 80, xxxl: 96 }}
          onMouseEnter={() => setIsCoverUpload(true)}
          onMouseLeave={() => setIsCoverUpload(false)}
        >
          <Box
            backgroundImage={
              user.coverImage
                ? `url(${uriToHttps(user.coverImage)})`
                : user.coverImage
                ? `url(${uriToHttps(user.coverImage)})`
                : defaultUserCoverURL
            }
            backgroundSize="cover"
            backgroundPosition="center center"
            borderRadius="lg"
            position="absolute"
            width="100%"
            height="100%"
          />
          {isCoverUpload && isOwner && (
            <UploadButton
              aria-label="upload cover"
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              onClick={onPresentCoverFileDialog}
            />
          )}
        </Flex>
        <Flex direction={{ base: 'column', lg: 'row' }} width="100%" flex={1} paddingTop={8}>
          <VStack px={4} paddingBottom={12} position="relative" spacing={4} width={{ base: 'full', lg: 80 }}>
            <Box
              width={28}
              height={28}
              position="absolute"
              top={-20}
              left={{ base: '50%', lg: 8 }}
              transform={{ base: 'translate(-50%)', lg: 'initial' }}
              onMouseEnter={() => setIsAvatarUpload(true)}
              onMouseLeave={() => setIsAvatarUpload(false)}
            >
              <AvatarIcon user={user} width={112} badgeSize={8} />

              {isAvatarUpload && isOwner && (
                <PencilUploadButton
                  position="absolute"
                  left="50%"
                  top="50%"
                  transform="translate(-50%, -50%)"
                  width="100%"
                  height="100%"
                  background={isMobile ? 'rgba(0, 0, 0, 0.5)' : 'transparent'}
                  borderRadius="full"
                  aria-label="upload avatar"
                  _hover={{ background: 'rgba(0, 0, 0, 0.5)' }}
                  onClick={onPresentAvatarFileDialog}
                />
              )}
            </Box>
            <VStack align="initial" width="100%" paddingTop={12}>
              <ChakraHeading>{user?.name || 'Unnamed'}</ChakraHeading>
              <Box
                w="100%"
                display="flex"
                flexWrap="wrap"
                justifyContent={{ base: 'space-between', lg: 'start' }}
                alignItems="center"
              >
                {user?.username && (
                  <ChakraGradientText fontSize="md" marginRight={4} marginBottom={2}>
                    @{user.username}
                  </ChakraGradientText>
                )}
                <CopyButton toCopy={user.userId} toDisplay={truncateAddress(user.userId)} />
              </Box>
              {user.bio && <ChakraText fontSize="sm">{user.bio}</ChakraText>}
            </VStack>
            {/* <HStack width="100%" spacing={8}>
              <VStack align="inital" spacing={2}>
                <ChakraText fontSize="sm" type="main">
                  Followers
                </ChakraText>
                <ChakraHeading>{followerCount}</ChakraHeading>
              </VStack>
              <VStack align="initial" spacing={2}>
                <ChakraText fontSize="sm" type="main">
                  Following
                </ChakraText>
                <ChakraHeading>{followingCount}</ChakraHeading>
              </VStack>
            </HStack> */}
            <HStack width="100%" justifyContent="space-between">
              {isOwner && (
                // TODO: make this a link
                <PrimaryGradientButton
                  aria-label="follow"
                  fontSize="sm"
                  flex={1}
                  width="max-content"
                  onClick={handleEditProfile}
                >
                  {/* {!isOwner ? (isFollowing ? 'Unfollow' : 'Follow') : 'Edit profile'} */}
                  Edit Profile
                </PrimaryGradientButton>
              )}
              <SharePortalButton href={windowLocationHref} size="md" />
              <MultiPortalButton handleReport={onPresentReportModal} />
            </HStack>
            {socialLinks && hasValues(socialLinks) && (
              <Stack spacing={2} width="100%">
                <ChakraText fontSize="sm" type="main">
                  Links
                </ChakraText>
                <VStack w="100%" alignItems="initial" spacing={{ base: 2, xxxl: 5 }}>
                  {defaultProfileSocialFields.map(
                    (social) =>
                      socialLinks[social.type] && (
                        <ChakraExternalLink
                          key={social.type}
                          border={0}
                          href={uriToSocialLink(socialLinks[social.type], social.type)}
                          fontSize="lg"
                        >
                          <HStack spacing={2}>
                            <Flex justifyContent="center" alignItems="center" minWidth={5} minHeight={5}>
                              {reactIcons[social.type as keyof typeof reactIcons]}
                            </Flex>
                            <ChakraText fontSize="sm" noOfLines={1}>
                              {social.type === 'website'
                                ? socialLinks[social.type]
                                : uriFromLink(socialLinks[social.type])}
                            </ChakraText>
                          </HStack>
                        </ChakraExternalLink>
                      )
                  )}
                </VStack>
              </Stack>
            )}
            <Stack spacing={2} width="100%">
              <ChakraText fontSize="sm" type="main">
                Achievements
              </ChakraText>
              <HStack spacing={4}>
                {reactIcons['react']}
                <ChakraText fontSize="sm">Early Adopter</ChakraText>
              </HStack>
            </Stack>
          </VStack>
          {/* {tabData && ( */}
          <Box width={{ base: 'full', lg: 0 }} marginLeft={{ base: 0, md: 4 }} marginTop={{ base: 3, lg: 0 }} flex={1}>
            <ChakraDataTabs
              targetAccount={userFromParent.userId}
              canLoadMore={canLoadMore[selectedTabIndex]?.value || !isTabLoading}
              collections={collections}
              activeTabIndex={selectedTabIndex}
              data={tabData}
              // rate={rate}
              isLoading={isTabLoading}
              limit={initialLimit}
              loadMore={() => tabDataInitialize(selectedTabIndex)}
              onChange={handleTabsChange}
              onClick={() => router.push('/')}
              handleLike={(likes, nft, mode) => onHandleLike(likes, nft, mode)}
              handleFollow={(user, mode) => onHandleFollow(user, mode)}
              tabCounts={tabCounts}
            />
          </Box>
          {/* )} */}
        </Flex>
      </ChakraLayout>
    </Fragment>
  )
}

export default UserTemplate
