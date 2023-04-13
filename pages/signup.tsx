import {
  Avatar,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonProps,
  chakra,
  ContainerProps,
  Flex,
  FormControl,
  HeadingProps,
  HStack,
  Icon,
  Stack,
  TextareaProps,
  TextProps,
  VStack,
} from '@chakra-ui/react'
import { defaultMetaData } from '@nftmall/sdk'
import {
  Banner,
  ChakraCheckbox,
  ChakraInput,
  ChakraTextProps,
  EmailVerificationModalProps,
  NextChakraLinkProps,
  SimpleFileDropzone,
  theme,
} from '@nftmall/uikit'
import { useFormik } from 'formik'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { ChangeEvent, Fragment, memo, useRef, useState } from 'react'
import { DropzoneRef } from 'react-dropzone'
import { AiOutlineArrowRight } from 'react-icons/ai'
import { MdCloudUpload } from 'react-icons/md'
import * as Yup from 'yup'

const ChakraErrorText = memo(
  dynamic<TextProps>(() => import('@nftmall/uikit').then((module) => module.ChakraErrorText))
)
const ChakraFormLabel = memo(
  dynamic<TextProps>(() => import('@nftmall/uikit').then((module) => module.ChakraFormLabel))
)
const ChakraHeading = memo(dynamic<HeadingProps>(() => import('@nftmall/uikit').then((module) => module.ChakraHeading)))
const ChakraLayout = memo(dynamic<ContainerProps>(() => import('@nftmall/uikit').then((module) => module.ChakraLayout)))
const ChakraText = memo(dynamic<ChakraTextProps>(() => import('@nftmall/uikit').then((module) => module.ChakraText)))
const ChakraTextarea = memo(
  dynamic<TextareaProps>(() => import('@nftmall/uikit').then((module) => module.ChakraTextarea))
)
const EmailVerificationModal = memo(
  dynamic<EmailVerificationModalProps>(() => import('@nftmall/uikit').then((module) => module.EmailVerificationModal))
)
const NextChakraLink = memo(
  dynamic<NextChakraLinkProps>(() => import('@nftmall/uikit').then((module) => module.NextChakraLink))
)
const PrimaryGradientButton = memo(
  dynamic<ButtonProps>(() => import('@nftmall/uikit').then((module) => module.PrimaryGradientButton))
)
const SecondaryGradientButton = memo(
  dynamic<ButtonProps>(() => import('@nftmall/uikit').then((module) => module.SecondaryGradientButton))
)

function SignUp() {
  const dropzoneRef = useRef<DropzoneRef>(null)
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isChecked, setIsChecked] = useState(false)
  const [isError, setError] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File>()
  const accountFormik = useFormik({
    initialValues: {
      username: '',
      email: '',
    },
    validationSchema: Yup.object().shape({
      username: Yup.string().required('Username is required.'),
      email: Yup.string().email('Must be a valid email.').required('Email is required.'),
    }),
    onSubmit: ({ username, email }) => {
      console.log(username, email)
      setCurrentStep(2)
      setIsOpen(true)
    },
  })
  const profileFormik = useFormik({
    initialValues: {
      name: '',
      bio: '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required('Name is required.'),
      bio: Yup.string(),
    }),
    onSubmit: ({ name, bio }) => {
      console.log(name, bio)
      router.push(router.query.redirect as string)
    },
  })

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked)
  }

  const triggerDropzone = () => {
    if (dropzoneRef) {
      dropzoneRef.current?.open()
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onDrop = (acceptedFiles: any) => {
    acceptedFiles.forEach((file: File) => {
      const reader = new FileReader()
      reader.onload = async function () {
        setFile(file)
        setError(false)
      }
      reader.readAsDataURL(file)
    })
  }

  const onResend = () => {
    console.log('resend verification email')
  }

  return (
    <Fragment>
      <NextSeo {...defaultMetaData} title={`Signup | NFTmall`} />
      <Banner from="mint" />
      <ChakraLayout display="flex" py={{ base: 0, lg: 10 }}>
        <VStack align="flex-start" spacing={12} width="100%" zIndex={1}>
          <Breadcrumb spacing={2} separator={<AiOutlineArrowRight />}>
            <BreadcrumbItem cursor="pointer">
              <ChakraText
                textTransform="uppercase"
                type={currentStep === 1 ? 'primary' : 'secondary'}
                fontWeight={currentStep === 1 ? 700 : 400}
              >
                Account Details
              </ChakraText>
            </BreadcrumbItem>
            <BreadcrumbItem cursor="pointer">
              <ChakraText
                textTransform="uppercase"
                type={currentStep === 2 ? 'primary' : 'secondary'}
                fontWeight={currentStep === 1 ? 700 : 400}
              >
                Personalize your account
              </ChakraText>
            </BreadcrumbItem>
          </Breadcrumb>
          {currentStep === 1 && (
            <VStack align="flex-start" spacing={12} width="100%" maxW="xl">
              <ChakraHeading as="h1" fontSize="6xl" maxW={96}>
                Let's pick a username
              </ChakraHeading>
              <chakra.form onSubmit={accountFormik.handleSubmit} width="full">
                <Stack spacing={6}>
                  <FormControl>
                    <ChakraFormLabel>
                      Username<chakra.span color={theme.colors.errorText}>*</chakra.span>
                    </ChakraFormLabel>
                    <ChakraInput
                      name="username"
                      placeholder="Enter your username..."
                      isInvalid={!!accountFormik.errors.username}
                      value={accountFormik.values.username}
                      onChange={accountFormik.handleChange}
                    />
                    <ChakraText type="secondary">Your NFTmall profile URL: https://nftmall.io/@username</ChakraText>
                    {accountFormik.errors.username && (
                      <ChakraErrorText>{accountFormik.errors.username}</ChakraErrorText>
                    )}
                  </FormControl>
                  <FormControl>
                    <ChakraFormLabel>
                      Email<chakra.span color={theme.colors.errorText}>*</chakra.span>
                    </ChakraFormLabel>
                    <ChakraInput
                      name="email"
                      type="email"
                      placeholder="Enter your email..."
                      isInvalid={!!accountFormik.errors.email}
                      value={accountFormik.values.email}
                      onChange={accountFormik.handleChange}
                    />
                    <ChakraText type="secondary">We'll send you updates and other cool stuff</ChakraText>
                    {accountFormik.errors.email && <ChakraErrorText>{accountFormik.errors.email}</ChakraErrorText>}
                  </FormControl>
                  <ChakraCheckbox
                    aria-labelledby="check policy"
                    isChecked={isChecked}
                    size="lg"
                    onChange={(e) => onChange(e)}
                  >
                    <ChakraText>
                      By checking this box, you confirm that you have read and agree to the NFTmall{' '}
                      <NextChakraLink
                        color={theme.colors.primaryPurple}
                        href="/terms"
                        _hover={{ textDecoration: 'underline' }}
                      >
                        Terms of Use
                      </NextChakraLink>{' '}
                      and{' '}
                      <NextChakraLink
                        color={theme.colors.primaryPurple}
                        href="/privacy"
                        _hover={{ textDecoration: 'underline' }}
                      >
                        Privacy Policy
                      </NextChakraLink>{' '}
                      and confirm that you are at least 18 years old.
                    </ChakraText>
                  </ChakraCheckbox>
                  <PrimaryGradientButton
                    aria-label="submit account"
                    disabled={!isChecked}
                    maxW="fit-content"
                    size="lg"
                    px={16}
                    type="submit"
                  >
                    Continue
                  </PrimaryGradientButton>
                </Stack>
              </chakra.form>
            </VStack>
          )}
          {currentStep === 2 && (
            <VStack align="flex-start" spacing={12} width="100%" maxW="xl">
              <ChakraHeading as="h1" fontSize="6xl">
                Tell us more about yourself
              </ChakraHeading>
              <HStack spacing={3} align="center">
                <Flex
                  align="center"
                  justify="center"
                  borderRadius="full"
                  outline="2px dashed"
                  outlineOffset={6}
                  width={24}
                  height={24}
                >
                  <Avatar size="xl" src={file ? URL.createObjectURL(file) : ''} background="transparent" />
                </Flex>
                <Button variant="ghost" onClick={() => triggerDropzone()}>
                  <Icon fontSize={24} as={MdCloudUpload} />
                  &nbsp; Upload profile image
                </Button>
                <Box position="relative" opacity={0}>
                  <SimpleFileDropzone onDrop={onDrop} isError={isError} isDialog ref={dropzoneRef} />
                </Box>
              </HStack>
              <chakra.form onSubmit={profileFormik.handleSubmit} width="full">
                <Stack spacing={6}>
                  <FormControl>
                    <ChakraFormLabel>
                      Name<chakra.span color={theme.colors.errorText}>*</chakra.span>
                    </ChakraFormLabel>
                    <ChakraInput
                      name="name"
                      placeholder="Enter your name..."
                      isInvalid={!!profileFormik.errors.name}
                      value={profileFormik.values.name}
                      onChange={profileFormik.handleChange}
                    />
                  </FormControl>
                  <FormControl>
                    <ChakraFormLabel>Bio</ChakraFormLabel>
                    <ChakraTextarea
                      name="bio"
                      h="auto"
                      rows={5}
                      placeholder="Enter a short bio."
                      value={profileFormik.values.bio}
                      onChange={profileFormik.handleChange}
                    />
                  </FormControl>
                  <HStack spacing={4}>
                    <PrimaryGradientButton
                      aria-label="submit profile"
                      maxW="fit-content"
                      size="lg"
                      px={16}
                      type="submit"
                    >
                      Continue
                    </PrimaryGradientButton>
                    <SecondaryGradientButton aria-label="skip submit profile" maxW="fit-content" size="lg" px={16}>
                      Skip for now
                    </SecondaryGradientButton>
                  </HStack>
                </Stack>
              </chakra.form>
            </VStack>
          )}
          <EmailVerificationModal
            isOpen={isOpen}
            email={accountFormik.values.email}
            resend={onResend}
            onDismiss={() => setIsOpen(false)}
          />
        </VStack>
      </ChakraLayout>
    </Fragment>
  )
}

export default memo(SignUp)
