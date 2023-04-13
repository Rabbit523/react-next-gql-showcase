import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  HStack,
  InputGroup,
  InputLeftAddon,
  Stack,
  VStack,
} from '@chakra-ui/react'
import { defaultMetaData, defaultProfileSocialFields, delay, ProfileSocialKeys } from '@nftmall/sdk'
import {
  Banner,
  ChakraDivider,
  ChakraFormLabel,
  ChakraLayout,
  ChakraText,
  ChakraTextarea,
  ChakraTextInput,
  HeadingGroup,
  NextChakraLink,
  NotConnected,
  PrimaryGradientButton,
  SecondaryGradientButton,
  Spinner,
} from '@nftmall/uikit'
import { User } from '@prisma/client'
import { signMessage } from 'app/hooks/nftmall/useSignMessage'
import useToast from 'app/hooks/nftmall/useToast'
import useYupValidationResolver from 'app/hooks/nftmall/useYupValidationResolver'
import { useActiveWeb3React } from 'app/services/web3'
import { useWalletModalToggle } from 'app/state/application/hooks'
import { useAppDispatch } from 'app/state/hooks'
import { profileFetchSucceeded } from 'app/state/profile'
import { useUserProfile } from 'app/state/profile/hook'
import { restAPI } from 'app/utils/rest'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { FC, Fragment, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

const validationSchema = yup.object({
  username: yup
    .string()
    .nullable()
    .required()
    .max(30, 'Username must be less than 30 characters.')
    .min(3, 'Username must be at least 3 characters.')
    .matches(/^[a-zA-Z0-9]*$/, `Only letters and numbers are allowed.`),
  email: yup.string().nullable().required().email(),
})

interface AccountSettingsProps {
  oldProfile: User
}

const AccountSettings: FC<AccountSettingsProps> = ({ oldProfile }) => {
  const { account, provider } = useActiveWeb3React()
  const dispatch = useAppDispatch()
  const { toastError, toastSuccess } = useToast()
  const { mutate: mutateProfile } = useUserProfile({
    variables: { id: account, skipCache: true },
    shouldFetch: !!account,
  })
  const resolver = useYupValidationResolver(validationSchema)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver,
    // defaultValues: formDefaultValues,
  })

  useEffect(() => {
    if (oldProfile) {
      const links: ProfileSocialKeys = JSON.parse(JSON.stringify(oldProfile.links))
      reset(
        {
          ...oldProfile,
          ...links,
        },
        {
          keepDirtyValues: false,
          keepErrors: false,
          keepDefaultValues: false,
          keepIsSubmitted: false,
          keepDirty: false,
          keepIsValid: false,
          keepSubmitCount: false,
        }
      )
    }
  }, [oldProfile, reset])

  const router = useRouter()
  const successfulRedirectURL = router?.query?.redirect ? (router?.query?.redirect as string) : '/account'

  const onStep1EnterDetails = useCallback(
    async (formValues) => {
      try {
        const links = {}
        defaultProfileSocialFields.forEach((social) => (links[social.type] = formValues[social.type] || ''))
        // asdf
        const userData = {
          name: formValues.name,
          username: formValues.username,
          bio: formValues.bio,
          email: formValues.email || null,
          links,
        }
        console.log({ userData })

        const message = `I would like to update preferences.\n${JSON.stringify(userData, null, 2)}`
        const sig = await signMessage(provider, formValues.userId, message)
        const { user: res } = await restAPI.updateUser(userData, {
          userId: oldProfile.userId,
          sig,
          message,
        })
        if (res) {
          dispatch(profileFetchSucceeded({ profile: res }))
          await mutateProfile()
          await delay(1 * 1000)
          toastSuccess('Success!', 'Your account details have been updated.')
          router.push(successfulRedirectURL)
        }
      } catch (error) {
        console.error(error)
        toastError('Oops', 'Something went wrong. Try again later.')
      }
    },
    [dispatch, mutateProfile, oldProfile.userId, provider, router, successfulRedirectURL, toastError, toastSuccess]
  )

  return (
    <VStack as="section" align="initial" spacing={8} mt={8} zIndex={1}>
      <HeadingGroup
        title="Profile Settings"
        description={
          `Set up your username and email to receive important trading notifications. Such as when your NFT is sold or you receive a bid.`
          // 'You can set preferred display name, create your branded profile URL and manage other personal settings.'
        }
      />
      <form
        onSubmit={handleSubmit(onStep1EnterDetails, () => {
          console.log('Invalid entries')
          console.log(errors)
          // setUserActionError(new Error('Please enter valid information and try again.'))
          toastError('Oops', 'Please fix errors and submit again.')
        })}
      >
        <VStack spacing={8}>
          {/* ======== username */}
          <FormControl isInvalid={!!errors.username} isDisabled={isSubmitting}>
            <Stack width="100%" direction={{ base: 'column', lg: 'row' }}>
              <VStack width="100%" justify="start" alignItems="start">
                <ChakraFormLabel>Username *</ChakraFormLabel>
              </VStack>
              <Box width="100%">
                <InputGroup>
                  <InputLeftAddon children="https://nftmall.io/@" />
                  <ChakraTextInput borderRadius={0} placeholder="username" {...register('username')} />
                </InputGroup>
                {errors.username && (
                  <FormErrorMessage color="orangered">{String(errors.username.message)}</FormErrorMessage>
                )}
              </Box>
            </Stack>
          </FormControl>
          {/* ======== email */}
          {/* <HeadingGroup title="Notifications" description="Never miss an update from NFTmall." /> */}
          <FormControl isInvalid={!!errors.email} isDisabled={isSubmitting}>
            <Stack width="100%" direction={{ base: 'column', lg: 'row' }}>
              <VStack width="100%" justify="start" alignItems="start">
                <ChakraFormLabel>Email *</ChakraFormLabel>
                <ChakraText type="secondary">
                  {/* Add your email address to receive notifications about your activity on NFTmall. This will not be
                      shown on your profile. */}
                  This will not be shown on your profile.
                </ChakraText>
              </VStack>
              <Box width="100%">
                <ChakraTextInput type="email" placeholder="Email" {...register('email')} />
                {errors.email && <FormErrorMessage color="orangered">{String(errors.email.message)}</FormErrorMessage>}
              </Box>
            </Stack>
          </FormControl>
          {/* ======== display name */}
          <FormControl isInvalid={!!errors.name} isDisabled={isSubmitting}>
            <Stack width="100%" direction={{ base: 'column', lg: 'row' }}>
              <Flex width="100%">
                <ChakraFormLabel>Display Name</ChakraFormLabel>
              </Flex>
              <Box width="100%">
                <ChakraTextInput placeholder="John Doe" {...register('name')} />
                {errors.name && <FormErrorMessage color="orangered">{String(errors.name.message)}</FormErrorMessage>}
              </Box>
            </Stack>
          </FormControl>
          {/* ======== bio */}
          <FormControl isInvalid={!!errors.bio} isDisabled={isSubmitting}>
            <Stack width="100%" direction={{ base: 'column', lg: 'row' }}>
              <VStack width="100%" justify="start" alignItems="start">
                <ChakraFormLabel>Add a short bio</ChakraFormLabel>
                <ChakraText type="secondary">Let the world know who you are</ChakraText>
              </VStack>
              <Box width="100%">
                <ChakraTextarea h="auto" rows={5} placeholder="Enter a short bio." {...register('bio')} />
                {errors.bio && <FormErrorMessage color="orangered">{String(errors.bio.message)}</FormErrorMessage>}
              </Box>
            </Stack>
          </FormControl>
        </VStack>

        {/* ======== social links */}
        <HeadingGroup title="Social Media" description="Add links to your social media profiles. (optional)" />
        <VStack spacing={8}>
          {defaultProfileSocialFields.map((social) => (
            <FormControl isInvalid={!!errors[social.label]} isDisabled={isSubmitting}>
              <Stack width="100%" direction={{ base: 'column', lg: 'row' }} key={social.type}>
                <Flex width="100%">
                  <ChakraFormLabel>{social.label}</ChakraFormLabel>
                </Flex>
                <Flex width="100%">
                  <InputGroup>
                    {social.prefix && <InputLeftAddon children={social.prefix} />}
                    <ChakraTextInput borderRadius={0} placeholder={social.placeholder} {...register(social.type)} />
                  </InputGroup>
                  {errors[social.label] && (
                    <FormErrorMessage color="orangered">{String(errors[social.label].message)}</FormErrorMessage>
                  )}
                </Flex>
              </Stack>
            </FormControl>
          ))}
          {/* ======== verify */}
          <Stack width="100%" direction={{ base: 'column', lg: 'row' }}>
            <VStack width="100%" justify="start" alignItems="start">
              <ChakraFormLabel>Verify your profile</ChakraFormLabel>
              <ChakraText type="secondary">
                Show the NFTmall community that your profile is authentic.
                <br />A blue checkmark will be awarded to your profile once verified.
              </ChakraText>
            </VStack>
            <Box width="100%">
              <NextChakraLink href="https://iclja04ur3w.typeform.com/to/iR3XoAx4" isExternal>
                <SecondaryGradientButton aria-label="verify" size="lg" width="max-content">
                  Get Verified
                </SecondaryGradientButton>
              </NextChakraLink>
            </Box>
          </Stack>
          <ChakraDivider flex={1} />
          <Stack width="100%" direction={{ base: 'column', lg: 'row' }}>
            <HStack width="100%" justify="flex-end">
              <PrimaryGradientButton
                aria-label="save change"
                size="lg"
                width="fit-content"
                minWidth="240px"
                rounded="full"
                isDisabled={!isDirty}
                isLoading={isSubmitting}
                type="submit"
              >
                Save Changes
              </PrimaryGradientButton>
            </HStack>
          </Stack>
        </VStack>
      </form>
    </VStack>
  )
}

const AccountSettingsWrapper: FC = () => {
  const { account, provider } = useActiveWeb3React()
  const {
    data: profile,
    mutate: mutateProfile,
    isLoading,
  } = useUserProfile({
    variables: { id: account, skipCache: true },
    shouldFetch: !!account,
  })
  const toggleWalletModal = useWalletModalToggle()

  return (
    <Fragment>
      <NextSeo {...defaultMetaData} title={`Profile Settings | NFTmall`} />
      <Banner from="profile" />
      <ChakraLayout display="flex" alignItems="center" justifyContent="center" position="relative">
        {account && profile ? (
          <AccountSettings oldProfile={profile} />
        ) : !!account && !profile ? (
          <Spinner />
        ) : (
          <NotConnected onClick={toggleWalletModal} />
        )}
      </ChakraLayout>
    </Fragment>
  )
}

export default AccountSettingsWrapper
