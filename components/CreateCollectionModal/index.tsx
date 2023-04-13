import {
  Box,
  Center,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalOverlay,
  Stack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { MessageTypes, recoverTypedSignature, SignTypedDataVersion, TypedMessage } from '@metamask/eth-sig-util'
import { CfUploadImageRes, CHAINID_TO_BLOCKCHAIN, dummyAction, nextApiFetchers, parseUnionId } from '@nftmall/sdk'
import {
  ActionButton,
  ChakraInput,
  ChakraModalContent,
  Image,
  ModalHeading,
  NoticeContainer,
  PrimaryGradientButton,
  useContainerDimensions,
} from '@nftmall/uikit'
import { CollectionType } from '@rarible/api-client'
import { CreateCollectionResponse } from '@rarible/sdk'
import { getSigner } from '@sushiswap/core-sdk'
import { retry, RetryableError } from 'app/functions/retry'
import useYupValidationResolver from 'app/hooks/nftmall/useYupValidationResolver'
import useUnionSDK from 'app/services/union-api/hooks/useUnionSDK'
import { useActiveWeb3React } from 'app/services/web3'
import { restAPI } from 'app/utils/rest'
import axios from 'axios'
import { recoverTypedSignature_v4 } from 'eth-sig-util'
import { useRouter } from 'next/router'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import ReactConfetti from 'react-confetti'
import { useForm } from 'react-hook-form'
import { FiUploadCloud } from 'react-icons/fi'
import * as yup from 'yup'

// import { steps } from './data'
import { Step } from './Step'
import { useStep } from './useStep'

const IS_TESTING = false

const validationSchema = yup.object({
  logo: yup.mixed().test('fileSize', 'Logo is required.', (value) => {
    if (!value.length) return false
    return value[0].size > 0
  }),
  name: yup.string().required('Required'),
  symbol: yup
    .string()
    .required('Required')
    .matches(/^[A-Z0-9]*$/, `Only uppercase letters and numbers are allowed.`)
    .max(20, 'Symbol must be less than 20 characters.')
    .min(2, 'Symbol must be at least 2 characters.'),
  description: yup.string().required('Required'),
  slug: yup
    .string()
    .required('Required')
    .matches(/^[a-z0-9](-?[a-z0-9])*$/, `Only lowercase letters, numbers and '-' are allowed.`)
    .max(60, 'Short URL must be less than 60 characters.')
    .min(6, 'Short URL must be at least 6 characters.'),
})

interface FormValues {
  name: string
  symbol: string
  description: string
  slug: string
}

export interface CollectionModalProps {
  nextCallback: (newColUnionId: string) => void
  onDismiss?: () => null
  collectionType: CollectionType.ERC721 | CollectionType.ERC1155
}

const CreateCollectionModal: FC<CollectionModalProps> = ({ nextCallback, onDismiss, collectionType }) => {
  const router = useRouter()
  const { chainId, account, library } = useActiveWeb3React()
  const { unionSDK } = useUnionSDK()
  const [createColRes, setCreateColRes] = useState<CreateCollectionResponse>()
  const [userActionError, setUserActionError] = useState<Error>()
  // const [isDeploying, setIsDeploying] = useBoolean(false) // step 2
  // const [isSigning, setIsSigning] = useBoolean(false) // step 3
  const [formValues, setFormValues] = useState<FormValues>()
  const resolver = useYupValidationResolver(validationSchema)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver })

  // https://stackoverflow.com/questions/38049966/get-image-preview-before-uploading-in-react
  const [selectedFile, setSelectedFile] = useState<File>()
  const [preview, setPreview] = useState<string>()
  const [cfUploadRes, setCFUploadRes] = useState<CfUploadImageRes>()
  const [cfImageURL, setCFImageURL] = useState<string>()

  const [currentStep, { goToNextStep, goToPrevStep, canGoToNextStep, canGoToPrevStep, setStep, reset }] = useStep({
    maxStep: 3,
    initialStep: 0,
  })

  const goNext = useCallback(() => {
    if (canGoToNextStep) {
      goToNextStep()
      return
    }
    console.log('Unable to go to next step')
  }, [canGoToNextStep, goToNextStep])

  // create a preview as a side effect, whenever selected file is changed
  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined)
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreview(objectUrl)

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  const onSelectFile = useCallback((e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined)
      return
    }
    setSelectedFile(e.target.files[0])
  }, [])

  const uploadToCF = useCallback(
    (url) => {
      const formData = new FormData()
      formData.append('file', selectedFile)
      return axios.post<CfUploadImageRes>(url, formData)
    },
    [selectedFile]
  )

  const onStep1EnterDetails = useCallback(
    async (values) => {
      setUserActionError(undefined)
      setFormValues(values)
      console.log('Form values: ', values)
      try {
        // 1. First get image upload url from backend and set as form's target
        const dto = {
          ...values, // `values` is from form after validating in frontend so should contain slug, name, description etc.
        }
        console.log('Dto to backend: ', dto)
        const { data: validationRes } = await nextApiFetchers.collection.validateCreatingCollection(dto)

        console.log('Validation res: ', validationRes)

        if (validationRes?.success) {
          // 2. all's ok, upload logo to cloudflare
          const { data: uploadedRes } = await uploadToCF(validationRes.result.uploadURL)
          console.log(uploadedRes)
          if (uploadedRes.success) {
            setCFUploadRes(uploadedRes)
            setCFImageURL(uploadedRes.result.variants[0])
          } else {
            throw new Error('Failed to upload logo. Please try again later.')
          }
        } else {
          // not ok
          console.warn(validationRes)
          throw new Error(validationRes?.error || 'Invalid input. Please enter valid values.')
        }

        goNext()
      } catch (e) {
        console.error(e)
        setUserActionError(e)
        return
      }
    },
    [goNext, uploadToCF]
  )

  const onStep2DeployContract = useCallback(async () => {
    // setUserActionError(undefined)
    console.log({ formValues })
    if (!(formValues && formValues.name && formValues.symbol && cfImageURL)) {
      throw new Error('Complete previous steps first.')
    }

    const blockchain = CHAINID_TO_BLOCKCHAIN[chainId]
    if (!blockchain) {
      alert('Connect your wallet first.')
      return
    }

    // 1. request mint using sdk
    const res = await unionSDK.nft.createCollection({
      blockchain, // FIXME: need to reflect user's connected blockchain.
      asset: {
        assetType: collectionType, // TODO: should reflect user's choice
        arguments: {
          name: formValues.name,
          symbol: formValues.symbol,
          baseURI: '', // this is empty because we will give full url including ipfs gateway.
          // FIXME: must be different based on testnet/mainnet environment.
          contractURI: `${process.env.NEXT_PUBLIC_API_NEXT}/next/contract-metadata/{address}`,
          isUserToken: true,
          operators: [],
        },
      },
    })
    console.log(res)
    const { address, tx } = res
    if (!address || !tx) {
      throw new Error('Invalid response. Please try again.')
    }
    setCreateColRes(res)

    // 2.
    await tx.wait()

    const { promise, cancel } = retry(
      async () => {
        try {
          const collection = await unionSDK.apis.collection.getCollectionById({
            collection: address,
          })
          return collection
        } catch (e) {
          console.log('Collection not created.', e)
        }
        throw new RetryableError()
      },
      { n: 10, minWait: 2000, maxWait: 5000 }
    )
    return await promise
  }, [cfImageURL, collectionType, formValues, unionSDK?.apis.collection, unionSDK?.nft])

  const tmpVerifySignature = (typedData, signature) => {
    const signer = recoverTypedSignature({
      data: typedData,
      signature,
      version: SignTypedDataVersion.V4,
    })
    console.log('signer: ', signer)

    const v4 = recoverTypedSignature_v4({
      data: typedData,
      sig: signature,
    })
    console.log('v4: ', v4)

    return signer
  }

  const onStep3SaveConfig = useCallback(async () => {
    console.log('createColRes', createColRes)
    const parsed = parseUnionId(createColRes.address, true)
    // [Step 3: Save Config]
    // Submit address, metadata to backend and save in DB.
    const message = {
      name: formValues.name,
      slug: formValues.slug,
      description: formValues.description,
      image: cfUploadRes.result.variants[0],
      address: parsed.lowercaseAddress,
    }
    const typedData = {
      types: {
        SaveCollection: [
          { name: 'name', type: 'string' },
          { name: 'slug', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'image', type: 'string' },
          { name: 'address', type: 'address' },
        ],
      },
      primaryType: 'SaveCollection',
      domain: {
        name: 'NFTmall',
        version: '1',
        chainId: chainId, // TODO: what if user changes network?
        verifyingContract: parsed.lowercaseAddress,
      },
      message: message,
    }
    console.log('Typed data: ', typedData)
    const signer = await getSigner(library, account)
    console.log('Signer: ', signer)
    const signature = await signer._signTypedData(typedData.domain, typedData.types, typedData.message)
    console.log('Profile update sig: ', signature)

    // now we must include EIP712Domain due to bug of ethers
    // https://github.com/ethers-io/ethers.js/issues/687
    const typedDataForRecovery: TypedMessage<MessageTypes> = {
      ...typedData,
      types: {
        ...typedData.types,
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
      },
    }

    // call api to save collection info.
    const dto = {
      typedData: typedDataForRecovery,
      signature,
    }
    console.log('collection saving dto: ', dto)
    const { data: customized } = await nextApiFetchers.collection.customize(createColRes.address, dto)
    if (!customized?.success) {
      // fail loudly.
      throw new Error(customized.error || 'Could not save data. Please try again later.')
    }
    // Now mutate user's collection in the minting screen.
    nextCallback(createColRes.address)
    // ok. now revalidate collection pages.
    const colURI = `/collection/${parsed.blockchainSlug}/${parsed.lowercaseAddress}`
    const colSlugURI = `/collection/${formValues.slug}`
    console.log({
      colURI,
      colSlugURI,
    })
    await Promise.all([restAPI.revalidateURI(colURI), restAPI.revalidateURI(colSlugURI)])
    return 0
  }, [
    account,
    cfUploadRes?.result.variants,
    chainId,
    createColRes,
    formValues?.description,
    formValues?.name,
    formValues?.slug,
    library,
    nextCallback,
  ])

  const toStep4 = useCallback(async () => {
    goNext()
    setIsConfetti(true)
  }, [goNext])

  const onStep4ViewCollection = useCallback(async () => {
    try {
      await router.push(`/collection/${formValues.slug}`)
      onDismiss()
    } catch (e) {
      console.error(e)
    }
    return 0
  }, [formValues?.slug, onDismiss, router])

  const onStep4ContinueMinting = useCallback(async () => {
    // - Simply close modal because newly minted collection should've already
    // been selected in the behind modal.
    // nextCallback(createColRes.address)
    nextCallback(parseUnionId(createColRes.address).unionCollectionId) // must return properly formated union id.
    onDismiss()
  }, [createColRes?.address, nextCallback, onDismiss])

  // function onSubmit(values) {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       alert(JSON.stringify(values, null, 2))
  //       if ((Math.random() * 100) % 2 === 1) {
  //         throw new Error('Oh shit!')
  //       }
  //       resolve('1')
  //     }, 2000)
  //   })
  // }

  const errorRenderer = (
    <NoticeContainer
      type="error"
      message={userActionError?.message || (userActionError as any)?.error || userActionError?.name}
    ></NoticeContainer>
  )

  const steps = [
    {
      title: '1. Enter details',
      description: 'Fill in the form below.',
      child: (
        <form
          onSubmit={handleSubmit(onStep1EnterDetails, () => {
            setUserActionError(new Error('Please enter valid information and try again.'))
          })}
          // action=""
          // method="post"
          // encType="multipart/form-data"
        >
          <VStack spacing={4} py={4}>
            {/* ======================== Logo */}
            <FormControl isInvalid={!!errors.logo}>
              <FormLabel htmlFor="logo" fontSize={'lg'} fontWeight={'bold'}>
                Logo
              </FormLabel>
              <Stack alignItems={'center'} direction={{ base: 'column', sm: 'row' }} spacing={4}>
                {/* <SimpleFileDropzone onDrop={onDrop} isError={isError} isDialog ref={dropzoneRef} /> */}
                <Box pos="relative">
                  {preview ? (
                    <Image className="border-radius-md" width={150} height={150} src={preview} alt="network" />
                  ) : (
                    <Center
                      w="150px"
                      h="150px"
                      border="gray"
                      borderWidth="medium"
                      borderStyle="dotted"
                      borderColor={'purple.600'}
                      rounded="md"
                      justifyItems={'center'}
                    >
                      <FiUploadCloud />
                    </Center>
                  )}
                </Box>
                <VStack spacing={2}>
                  <Text size="sm">We recommend an image of at least 500x500. Gifs work too.</Text>
                  <Input
                    accept="image/png,image/jpeg,image/jpg,image/gif"
                    background="transparent !important"
                    border="none"
                    className="file-upload-input"
                    color="transparent !important"
                    cursor="pointer"
                    p="0 !important"
                    _focus={{ border: 'none' }}
                    {...register('logo')}
                    onChange={onSelectFile}
                    type="file"
                    name="logo"
                  />
                </VStack>
              </Stack>
              {errors.logo ? (
                <FormErrorMessage color="orangered">{String(errors.logo.message)}</FormErrorMessage>
              ) : (
                <FormHelperText></FormHelperText>
              )}
            </FormControl>
            {/* ======================== Name */}
            <FormControl isInvalid={!!errors.name}>
              <FormLabel htmlFor="name" fontSize={'lg'} fontWeight={'bold'}>
                Name
              </FormLabel>
              <ChakraInput id="name" placeholder="E.g Bored Ape Yacht Club" {...register('name')} />
              {errors.name ? (
                <FormErrorMessage color="orangered">{String(errors.name.message)}</FormErrorMessage>
              ) : (
                <FormHelperText></FormHelperText>
              )}
            </FormControl>
            {/* ======================== Symbol */}
            <FormControl isInvalid={!!errors.symbol}>
              <FormLabel htmlFor="symbol" fontSize={'lg'} fontWeight={'bold'}>
                Symbol
              </FormLabel>
              <ChakraInput id="symbol" placeholder="E.g BAYC" {...register('symbol')} />
              {errors.symbol ? (
                <FormErrorMessage color="orangered">{String(errors.symbol.message)}</FormErrorMessage>
              ) : (
                <FormHelperText></FormHelperText>
              )}
            </FormControl>
            {/* ======================== Description */}
            <FormControl isInvalid={!!errors.description}>
              <FormLabel htmlFor="description" fontSize={'lg'} fontWeight={'bold'}>
                Description
              </FormLabel>
              <Textarea
                id="description"
                placeholder="Spread some words about your NFT collection!"
                {...register('description')}
                // ref={register}
              />
              {errors.description ? (
                <FormErrorMessage color="orangered">{String(errors.description.message)}</FormErrorMessage>
              ) : (
                <FormHelperText></FormHelperText>
              )}
            </FormControl>
            {/* ======================== Short URL */}
            <FormControl isInvalid={!!errors.slug}>
              <FormLabel htmlFor="slug" fontSize={'lg'} fontWeight={'bold'}>
                Short URL
              </FormLabel>
              <InputGroup>
                <InputLeftAddon fontSize={{ base: 'xs', sm: 'sm' }} children="nftmall.io/collection/" />
                <ChakraInput id="slug" placeholder="Enter short url" {...register('slug')} />
              </InputGroup>
              {errors.slug ? (
                <FormErrorMessage color="orangered">{String(errors.slug.message)}</FormErrorMessage>
              ) : (
                <FormHelperText fontSize="md"></FormHelperText>
              )}
            </FormControl>
            {errorRenderer}
            <PrimaryGradientButton type="submit" isLoading={isSubmitting}>
              {'Continue >'}
            </PrimaryGradientButton>
          </VStack>
        </form>
      ),
    },
    {
      title: '2. Confirm a transaction',
      description: 'Deploy a smart contract to blockchain.',
      child: (
        <ActionButton isPrimary showError showSpinner onAction={onStep2DeployContract} onSuccess={goNext}>
          {`Confirm >`}
        </ActionButton>
      ),
    },
    {
      title: '3. Save settings',
      description: 'Sign a message to save settings of your collection.',
      child: (
        <ActionButton isPrimary showError showSpinner onAction={onStep3SaveConfig} onSuccess={toStep4}>
          {`Save >`}
        </ActionButton>
      ),
    },
    {
      title: '4. Finish',
      description: '',
      child: (
        <VStack spacing={4}>
          <Text fontSize="lg">
            {`Congratulations! 🎉 Your collection has been minted. 🥳
            You can continue minting or view your new collection.`}
          </Text>
          <ActionButton isPrimary showSpinner onAction={IS_TESTING ? dummyAction : onStep4ContinueMinting}>
            Continue to Minting NFT
          </ActionButton>
          <ActionButton showSpinner onAction={IS_TESTING ? dummyAction : onStep4ViewCollection}>
            View Collection
          </ActionButton>
        </VStack>
      ),
    },
  ]

  // const btnTextColor = useColorModeValue(theme.colors.light.primaryText, theme.colors.dark.primaryText)

  const closeHandlerWithConfirmation = useCallback(() => {
    if (window.confirm('Do you want to stop creating collection?')) {
      onDismiss()
    }
  }, [onDismiss])

  const [isConfettiCompleted, setIsConfettiCompleted] = useState(false)
  const [isConfetti, setIsConfetti] = useState(IS_TESTING)
  const handleConfetti = useCallback(() => setIsConfettiCompleted(true), [])
  const boxRef = useRef()
  const { width: confettiWidth, height: confettiHeight } = useContainerDimensions(boxRef)
  console.log({ confettiWidth, confettiHeight })

  return (
    <Modal isOpen={true} onClose={closeHandlerWithConfirmation} isCentered size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ChakraModalContent paddingLeft={4} rounded="2xl">
        <ModalCloseButton />
        <ModalBody p={0} zIndex={1} ref={boxRef}>
          <ModalHeading textAlign="center" mb={4}>
            Create your {collectionType} collection
          </ModalHeading>
          {isConfetti && (
            <Box position="absolute" width="100%">
              <ReactConfetti
                recycle={false}
                width={confettiWidth}
                height={confettiHeight}
                onConfettiComplete={handleConfetti}
              />
            </Box>
          )}
          <Stack spacing="0">
            {steps.map((step, id) => (
              <Step
                key={id}
                // cursor="pointer"
                onClick={() => IS_TESTING && setStep(id)}
                title={step.title}
                description={step.description}
                isActive={currentStep === id}
                isCompleted={currentStep > id}
                isLastStep={steps.length === id + 1}
              >
                {step.child}
              </Step>
            ))}
          </Stack>
        </ModalBody>
      </ChakraModalContent>
    </Modal>
  )
}

export default CreateCollectionModal
