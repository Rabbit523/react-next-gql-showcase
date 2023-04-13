import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  BoxProps,
  Button,
  ButtonProps,
  ContainerProps,
  Flex,
  HeadingProps,
  HStack,
  Icon,
  Radio,
  RadioGroup,
  Stack,
  TextProps,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import Commerce from '@chec/commerce.js'
import {
  defaultMetaData,
  defaultPrices,
  defaultProductSizes,
  defaultZones,
  getCloudinaryUrlByNFTWH,
  getViewableNFTURL,
  isNFTId,
  PAYMENT_METHODS,
  SelectOption,
  validateZipcodes,
  zoneFive,
  zoneFivePrices,
  zoneRow,
  zoneRowPrices,
} from '@nftmall/sdk'
import {
  ChakraFloatInputProps,
  ChakraSelectProps,
  ChakraStepsProps,
  ChakraTextProps,
  Image,
  theme,
} from '@nftmall/uikit'
import * as EmailValidator from 'email-validator'
import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { Fragment, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { BiChevronLeft, BiChevronRight, BiErrorCircle, BiLock } from 'react-icons/bi'
import { FaTimes } from 'react-icons/fa'

import { NFT_BY_NFTID_QUERY, NFT_BY_SLUG_QUERY } from '../utils/apollo'
import { restAPI } from '../utils/rest'
import { initializeApollo } from '../utils/useApollo'

const ChakraDivider = memo(dynamic<BoxProps>(() => import('@nftmall/uikit').then((module) => module.ChakraDivider)))
const ChakraErrorText = memo(
  dynamic<TextProps>(() => import('@nftmall/uikit').then((module) => module.ChakraErrorText))
)
const ChakraFloatInput = memo(
  dynamic<ChakraFloatInputProps>(() => import('@nftmall/uikit').then((module) => module.ChakraFloatInput))
)
const ChakraHeading = memo(dynamic<HeadingProps>(() => import('@nftmall/uikit').then((module) => module.ChakraHeading)))
const ChakraLayout = memo(dynamic<ContainerProps>(() => import('@nftmall/uikit').then((module) => module.ChakraLayout)))
const ChakraSelect = memo(
  dynamic<ChakraSelectProps>(() => import('@nftmall/uikit').then((module) => module.ChakraSelect))
)
const ChakraSteps = memo(dynamic<ChakraStepsProps>(() => import('@nftmall/uikit').then((module) => module.ChakraSteps)))
const ChakraText = memo(dynamic<ChakraTextProps>(() => import('@nftmall/uikit').then((module) => module.ChakraText)))

const PrimaryGradientButton = memo(
  dynamic<ButtonProps>(() => import('@nftmall/uikit').then((module) => module.PrimaryGradientButton))
)

const COINBASE_CHECKOUT_URL = process.env.NEXT_PUBLIC_COINBASE_CHECKOUT_URL
const COMMERCE_API_KEY = process.env.NEXT_PUBLIC_COMMERCE_API_KEY

const commerce = new Commerce(COMMERCE_API_KEY)
const STEPS = ['INFORMATION', 'SHIPPING', 'PAYMENT']

function CheckoutPage(props) {
  const router = useRouter()
  const { productType, productSize } = router.query
  const { nft } = props
  let pType = ''
  if (productType === '1') {
    pType = 'one_piece'
  } else if (productType === '2') {
    pType = 'framed_canvas'
  } else {
    pType = 'framed_print'
  }

  const pSize = defaultProductSizes[Number(productSize)].width + '*' + defaultProductSizes[Number(productSize)].height
  const bg = useColorModeValue(theme.colors.light.cardBg, theme.colors.dark.cardBg)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [archivedStep, setArchivedStep] = useState(-1)
  const [isError, setError] = useState({
    customerEmail: false,
    billingLastName: false,
    billingAddress: false,
    billingCity: false,
    billingState: false,
    billingCountry: false,
    billingPostCode: false,
    billingPhone: false,

    shippingLastName: false,
    shippingAddress: false,
    shippingCity: false,
    shippingState: false,
    shippingCountry: false,
    shippingPostCode: false,
    shippingPhone: false,
  })

  const [customerEmail, setCustomerEmail] = useState('')
  const [shippingFirstName, setShippingFirstName] = useState('')
  const [shippingLastName, setShippingLastName] = useState('')
  const [shippingCompany, setShippingCompany] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingAddress2, setShippingAddress2] = useState('')
  const [shippingCity, setShippingCity] = useState('')
  const [shippingCountry, setShippingCountry] = useState<SelectOption>()
  const [shippingState, setShippingState] = useState<SelectOption>()
  const [shippingPostCode, setShippingPostCode] = useState('')
  const [shippingPhone, setShippingPhone] = useState('')

  const [billingFirstName, setBillingFirstName] = useState('')
  const [billingLastName, setBillingLastName] = useState('')
  const [billingCompany, setBillingCompany] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [billingAddress2, setBillingAddress2] = useState('')
  const [billingCity, setBillingCity] = useState('')
  const [billingCountry, setBillingCountry] = useState<SelectOption>()
  const [billingState, setBillingState] = useState<SelectOption>()
  const [billingPostCode, setBillingPostCode] = useState('')
  const [billingPhone, setBillingPhone] = useState('')

  const [allCountries, setAllCountries] = useState<SelectOption[]>([])
  const [allBillingStates, setAllBillingStates] = useState<SelectOption[]>([])
  const [allShippingStates, setAllShippingStates] = useState<SelectOption[]>([])
  const [checkout, setCheckout] = useState<any>()

  const [paymentMethod, setPaymentMethod] = useState('manual')
  const [shippingMethod, setShippingMethod] = useState('Calculated at next step')
  const [isBillingAddressSame, setIsBillingAddressSame] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [price, setPrice] = useState(0)
  const [deliveryBlocked, setDeliveryBlocked] = useState(false)

  const pageMeta = useMemo(() => {
    if (nft) {
      let title = defaultMetaData.title
      const description = nft.description || null
      const ogType = nft.mimeType.includes('video') ? 'video' : 'website'
      const viewableNFTURL = getCloudinaryUrlByNFTWH(nft, 400)
      let ogSource = {}
      if (nft.name) {
        title = nft.name.concat(` | ${title}`)
      }
      if (nft.mimeType.includes('video')) {
        ogSource = {
          images: [
            {
              url: viewableNFTURL.split('.').slice(0, -1).join('.') + '.jpg',
              width: nft.width,
              height: nft.height,
            },
          ],
        }
      } else {
        ogSource = {
          images: [
            {
              url: viewableNFTURL,
              width: nft.width,
              height: nft.height,
            },
          ],
        }
      }
      return {
        ...defaultMetaData,
        title,
        description,
        openGraph: {
          title,
          description,
          // FIXME: this must be canonical url. i.e url of this nft.
          url: viewableNFTURL,
          ...ogSource,
          type: ogType,
        },
      }
    }
    return defaultMetaData
  }, [nft])

  const nftUrl = useMemo(() => {
    return nft.width > 400 ? getCloudinaryUrlByNFTWH(nft, 400) : getViewableNFTURL(nft)
  }, [nft])

  const getLocaleListCountries = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await commerce.services.localeListCountries()
      setIsLoading(false)
      if (response.countries) {
        const countries = response.countries
        const tmp = []
        Object.keys(countries).forEach((key) => {
          tmp.push({
            value: key,
            label: countries[key],
          })
        })
        setAllCountries(tmp)
      } else {
        setAllCountries([])
      }
    } catch (error) {
      setIsLoading(false)
      setAllCountries([])
      setErrorMessage('Can not get available countries from Commerce. Please refresh browser and try again.')
    }
  }, [])

  const getBillingLocaleListSubdivisions = useCallback(async () => {
    try {
      setBillingState(null)
      if (billingCountry && billingCountry.value) {
        setAllBillingStates([])
        setIsLoading(true)
        const response = await commerce.services.localeListSubdivisions(billingCountry.value)
        setIsLoading(false)
        if (response.subdivisions) {
          const subdivisions = response.subdivisions
          const tmp = []
          Object.keys(subdivisions).forEach((key) => {
            tmp.push({
              value: key,
              label: subdivisions[key],
            })
          })
          setAllBillingStates(tmp)
        }
      } else {
        setAllBillingStates([])
      }
    } catch (error) {
      setIsLoading(false)
      setAllBillingStates([])
      setErrorMessage('Can not get sub states of selected country from Commerce. Please refresh browser and try again.')
    }
  }, [billingCountry])

  const getShippingLocaleListSubdivisions = useCallback(async () => {
    try {
      setShippingState(null)
      if (shippingCountry && shippingCountry.value) {
        setAllShippingStates([])
        setIsLoading(true)
        const response = await commerce.services.localeListSubdivisions(shippingCountry.value)
        setIsLoading(false)
        if (response.subdivisions) {
          const subdivisions = response.subdivisions
          const tmp = []
          Object.keys(subdivisions).forEach((key) => {
            tmp.push({
              value: key,
              label: subdivisions[key],
            })
          })
          setAllShippingStates(tmp)
        }
      } else {
        setAllShippingStates([])
      }
    } catch (error) {
      setIsLoading(false)
      setAllShippingStates([])
      setErrorMessage('Can not get sub states of selected country from Commerce. Please refresh browser and try again.')
    }
  }, [shippingCountry])

  useEffect(() => {
    getLocaleListCountries()
  }, [getLocaleListCountries])

  useEffect(() => {
    getBillingLocaleListSubdivisions()
  }, [getBillingLocaleListSubdivisions])

  useEffect(() => {
    getShippingLocaleListSubdivisions()
  }, [getShippingLocaleListSubdivisions])

  useEffect(() => {
    if (Number(productType) <= defaultPrices.length && Number(productSize) < defaultPrices[0].length) {
      setPrice(defaultPrices[Number(productType) - 1][Number(productSize)])
    }
  }, [productSize, productType])

  useEffect(() => {
    if (shippingCountry && shippingCountry.value) {
      setErrorMessage('')
      setDeliveryBlocked(false)
      const shippingCountryValue = shippingCountry.value.toString()
      if (defaultZones.includes(shippingCountryValue)) {
        setPrice(defaultPrices[Number(productType) - 1][Number(productSize)])
      } else if (zoneFive.includes(shippingCountryValue)) {
        setPrice(zoneFivePrices[Number(productType) - 1][Number(productSize)])
      } else if (zoneRow.includes(shippingCountryValue)) {
        setPrice(zoneRowPrices[Number(productType) - 1][Number(productSize)])
      } else {
        setErrorMessage('You select delivery blocked country!!!')
        setDeliveryBlocked(true)
      }
    }
  }, [productSize, productType, shippingCountry])

  const formLabelRenderer = (text: string, style?: HeadingProps): JSX.Element => {
    return (
      <ChakraHeading as="h5" width="100%" fontSize="md" {...style}>
        {text}
      </ChakraHeading>
    )
  }

  const handleInputChange = (isBilling: boolean, type: string, value: any) => {
    const isNewError = { ...isError }
    switch (type) {
      case 'customerEmail':
        isNewError.customerEmail = false
        setCustomerEmail(value)
        break
      case 'firstName':
        if (isBilling) {
          setBillingFirstName(value)
        } else {
          setShippingFirstName(value)
        }
        break
      case 'lastName':
        if (isBilling) {
          isNewError.billingLastName = false
          setBillingLastName(value)
        } else {
          isNewError.shippingLastName = false
          setShippingLastName(value)
        }
        break
      case 'company':
        if (isBilling) {
          setBillingCompany(value)
        } else {
          setShippingCompany(value)
        }
        break
      case 'address':
        if (isBilling) {
          isNewError.billingAddress = false
          setBillingAddress(value)
        } else {
          isNewError.shippingAddress = false
          setShippingAddress(value)
        }
        break
      case 'address2':
        if (isBilling) {
          setBillingAddress2(value)
        } else {
          setShippingAddress2(value)
        }
        break
      case 'city':
        if (isBilling) {
          isNewError.billingCity = false
          setBillingCity(value)
        } else {
          isNewError.shippingCity = false
          setShippingCity(value)
        }
        break
      case 'country':
        if (isBilling) {
          isNewError.billingCountry = false
          setBillingCountry(value)
        } else {
          isNewError.shippingCountry = false
          setShippingCountry(value)
        }
        break
      case 'state':
        if (isBilling) {
          isNewError.billingState = false
          setBillingState(value)
        } else {
          isNewError.shippingState = false
          setShippingState(value)
        }
        break
      case 'postCode':
        if (isBilling) {
          isNewError.billingPostCode = false
          setBillingPostCode(value)
        } else {
          isNewError.shippingPostCode = false
          setShippingPostCode(value)
        }
        break
      case 'phone':
        if (isBilling) {
          isNewError.billingPhone = false
          setBillingPhone(value)
        } else {
          isNewError.shippingPhone = false
          setShippingPhone(value)
        }
        break
    }
    setError(isNewError)
  }

  const renderAddressForm = (isBilling = false) => {
    return (
      <VStack width="100%" spacing={4}>
        <Stack direction={{ base: 'column', sm: 'row' }} width="100%" spacing={4}>
          <ChakraFloatInput
            label="FIRST NAME"
            value={isBilling ? billingFirstName : shippingFirstName}
            onChange={(e) => handleInputChange(isBilling, 'firstName', e.target.value)}
          />
          <VStack width="100%" spacing={1}>
            <ChakraFloatInput
              label="LAST NAME"
              value={isBilling ? billingLastName : shippingLastName}
              isInvalid={isBilling ? isError.billingLastName : isError.shippingLastName}
              onChange={(e) => handleInputChange(isBilling, 'lastName', e.target.value)}
            />
            {(isError.billingLastName || isError.shippingLastName) && (
              <ChakraErrorText width="100%">This field is required.</ChakraErrorText>
            )}
          </VStack>
        </Stack>
        <ChakraFloatInput
          label="COMPANY (OPTIONAL)"
          value={isBilling ? billingCompany : shippingCompany}
          onChange={(e) => handleInputChange(isBilling, 'company', e.target.value)}
        />
        <VStack width="100%" spacing={1}>
          <ChakraFloatInput
            label="ADDRESS"
            value={isBilling ? billingAddress : shippingAddress}
            isInvalid={isBilling ? isError.billingAddress : isError.shippingAddress}
            onChange={(e) => handleInputChange(isBilling, 'address', e.target.value)}
          />
          {(isError.billingAddress || isError.shippingAddress) && (
            <ChakraErrorText width="100%">This field is required.</ChakraErrorText>
          )}
        </VStack>
        <ChakraFloatInput
          label="APARTMENT, ETC (OPTIONAL)"
          value={isBilling ? billingAddress2 : shippingAddress2}
          onChange={(e) => handleInputChange(isBilling, 'address2', e.target.value)}
        />
        <VStack width="100%" spacing={1}>
          <ChakraFloatInput
            label="CITY"
            value={isBilling ? billingCity : shippingCity}
            isInvalid={isBilling ? isError.billingCity : isError.shippingCity}
            onChange={(e) => handleInputChange(isBilling, 'city', e.target.value)}
          />
          {(isError.billingCity || isError.shippingCity) && (
            <ChakraErrorText width="100%">This field is required.</ChakraErrorText>
          )}
        </VStack>
        <VStack width="100%" spacing={1}>
          <ChakraSelect
            options={allCountries}
            placeholder="Select Country"
            value={isBilling ? billingCountry : shippingCountry}
            isInvalid={isBilling ? isError.billingCountry : isError.shippingCountry}
            isSearchable
            height="56px"
            onChange={(value) => handleInputChange(isBilling, 'country', value)}
          />
          {(isError.billingCountry || isError.shippingCountry) && (
            <ChakraErrorText width="100%">This field is required.</ChakraErrorText>
          )}
        </VStack>
        {((isBilling && billingCountry) || (!isBilling && shippingCountry)) && (
          <Fragment>
            <Stack direction={{ base: 'column', sm: 'row' }} width="100%" spacing={4}>
              <VStack width="100%" spacing={1}>
                <ChakraSelect
                  options={isBilling ? allBillingStates : allShippingStates}
                  placeholder="State"
                  value={isBilling ? billingState : shippingState}
                  height="56px"
                  isInvalid={isBilling ? isError.billingState : isError.shippingState}
                  isSearchable
                  onChange={(value) => handleInputChange(isBilling, 'state', value)}
                />
                {(isError.billingState || isError.shippingState) && (
                  <ChakraErrorText width="100%">This field is required.</ChakraErrorText>
                )}
              </VStack>
              <VStack width="100%" spacing={1}>
                <ChakraFloatInput
                  label="POSTAL/ZIP CODE"
                  value={isBilling ? billingPostCode : shippingPostCode}
                  isInvalid={isBilling ? isError.billingPostCode : isError.shippingPostCode}
                  onChange={(e) => handleInputChange(isBilling, 'postCode', e.target.value)}
                />
                {(isError.billingPostCode || isError.shippingPostCode) && (
                  <ChakraErrorText width="100%">
                    {(isBilling ? !billingPostCode : !shippingPostCode)
                      ? 'This field is required.'
                      : 'Invalid postal/zip code.'}
                  </ChakraErrorText>
                )}
              </VStack>
            </Stack>
            <VStack width="100%" spacing={1}>
              <ChakraFloatInput
                label="PHONE"
                value={isBilling ? billingPhone : shippingPhone}
                isInvalid={isBilling ? isError.billingPhone : isError.shippingPhone}
                onChange={(e) => handleInputChange(isBilling, 'phone', e.target.value)}
              />
              {(isError.billingPhone || isError.shippingPhone) && (
                <ChakraErrorText width="100%">This field is required.</ChakraErrorText>
              )}
            </VStack>
          </Fragment>
        )}
      </VStack>
    )
  }

  const renderInformation = () => {
    return (
      <VStack width="100%" margin="30px auto" spacing={8} align="initial">
        <VStack width="100%" spacing={4}>
          {formLabelRenderer('CONTACT INFORMATION')}
          <VStack width="100%" spacing={1}>
            <ChakraFloatInput
              label="EMAIL"
              value={customerEmail}
              isInvalid={isError.customerEmail}
              onChange={(e) => handleInputChange(false, 'customerEmail', e.target.value)}
            />
            {isError.customerEmail && (
              <ChakraErrorText width="100%">
                {!customerEmail ? 'This field is required.' : 'Invalid email.'}
              </ChakraErrorText>
            )}
          </VStack>
        </VStack>
        <ChakraDivider />
        <VStack width="100%" spacing={4}>
          {formLabelRenderer('Shipping Address')}
          {renderAddressForm()}
        </VStack>
        {renderError()}
        <PrimaryGradientButton
          aria-label="continue shipping"
          size="lg"
          maxW="100%"
          borderRadius="lg"
          my={4}
          disabled={isLoading || deliveryBlocked}
          onClick={continueToShipping}
          isLoading={isLoading}
        >
          CONTINUE&nbsp;&nbsp;TO&nbsp;&nbsp;SHIPPING
          <Icon as={BiChevronRight} w={6} h={6} marginLeft={1}></Icon>
        </PrimaryGradientButton>
      </VStack>
    )
  }

  const continueToShipping = async () => {
    const isNewError = { ...isError }
    isNewError.customerEmail = !customerEmail || !EmailValidator.validate(customerEmail)
    isNewError.shippingLastName = !shippingLastName
    isNewError.shippingAddress = !shippingAddress
    isNewError.shippingCity = !shippingCity
    isNewError.shippingState = !shippingState
    isNewError.shippingCountry = !shippingCountry
    isNewError.shippingPostCode = !shippingPostCode || !validateZipcodes(shippingPostCode)
    isNewError.shippingPhone = !shippingPhone
    if (
      !isNewError.customerEmail &&
      !isNewError.shippingLastName &&
      !isNewError.shippingAddress &&
      !isNewError.shippingCity &&
      !isNewError.shippingState &&
      !isNewError.shippingCountry &&
      !isNewError.shippingPostCode &&
      !isNewError.shippingPhone
    ) {
      setIsLoading(true)
      try {
        const checkout = await commerce.checkout.generateToken(`nft-product-${price}`, { type: 'permalink' })
        setCheckout(checkout)
        setShippingMethod('Free')
        setArchivedStep(0)
        setCurrentStep(1)
      } catch (error) {
        setErrorMessage(error.message)
      }
      setIsLoading(false)
    }
    setError(isNewError)
  }

  const renderMethod = () => {
    return (
      <>
        <HStack width="100%" backgroundColor={bg} padding={3} borderRadius="lg" spacing={4}>
          <ChakraText fontSize="lg" fontWeight="bold">
            CONTACT
          </ChakraText>
          <ChakraText fontSize="lg">{customerEmail}</ChakraText>
        </HStack>
        <HStack width="100%" backgroundColor={bg} padding={3} borderRadius="lg" spacing={4}>
          <ChakraText fontSize="lg" fontWeight="bold">
            SHIP&nbsp;&nbsp;TO
          </ChakraText>
          <ChakraText fontSize="lg">
            {shippingAddress} {shippingAddress2}, {shippingCity} {shippingState && shippingState.label}{' '}
            {shippingPostCode}, {shippingCountry && shippingCountry.label}
          </ChakraText>
        </HStack>
      </>
    )
  }

  const renderShipping = () => {
    return (
      <VStack width="100%" margin="30px auto" spacing={8} align="initial">
        <VStack width="100%" spacing={4}>
          {renderMethod()}
        </VStack>
        <VStack width="100%" spacing={4}>
          {formLabelRenderer('SHIPPING METHOD')}
        </VStack>
        <HStack borderColor={theme.colors.dark.primaryStroke} borderWidth={2} borderRadius="lg" padding={3} spacing={4}>
          <RadioGroup defaultValue="1">
            <Stack>
              <Radio value="1" defaultChecked={true}></Radio>
            </Stack>
          </RadioGroup>
          <VStack width="100%" alignItems="flex-start">
            <ChakraText fontSize="lg">STANDARD SHIPPING</ChakraText>
            <ChakraText fontSize="lg" fontWeight="bold">
              Arrives in 3-4 business days
            </ChakraText>
          </VStack>
          <ChakraText height="100%" fontSize="lg">
            Free
          </ChakraText>
        </HStack>
        <VStack width="100%" spacing={1}>
          <PrimaryGradientButton
            aria-label="continue payment"
            size="lg"
            maxW="100%"
            borderRadius="lg"
            disabled={isLoading}
            my={4}
            onClick={continueToPayment}
            isLoading={isLoading}
          >
            CONTINUE TO PAYMENT
            <Icon as={BiChevronRight} w={6} h={6} marginLeft={1}></Icon>
          </PrimaryGradientButton>
          <Button
            aria-label="return to information"
            height="fit-content"
            background="transparent"
            textDecoration="underline"
            onClick={() => setCurrentStep(0)}
            _hover={{
              outline: 'none',
            }}
            _focus={{
              outline: 'none',
            }}
          >
            <Icon as={BiChevronLeft} w={6} h={6} marginLeft={1}></Icon>
            Return to information
          </Button>
        </VStack>
      </VStack>
    )
  }

  const continueToPayment = () => {
    setArchivedStep(1)
    setCurrentStep(2)
  }

  const renderPayment = () => (
    <VStack width="100%" margin="30px auto" spacing={8} align="initial">
      <VStack width="100%" spacing={4}>
        {renderMethod()}
        <HStack width="100%" backgroundColor={bg} padding={3} borderRadius="lg" spacing={4}>
          <ChakraText fontSize="lg" fontWeight="bold">
            METHOD
          </ChakraText>
          <ChakraText fontSize="lg">Standard Shipping Free</ChakraText>
        </HStack>
      </VStack>
      <VStack width="100%" spacing={4}>
        <VStack width="100%" spacing={1}>
          <HStack width="100%">
            <Icon as={BiLock} w={6} h={6} marginLeft={1}></Icon>
            {formLabelRenderer('PAYMENT')}
          </HStack>
          <ChakraText width="100%" fontSize="md">
            All transactions are secure and encrypted.
          </ChakraText>
        </VStack>
        {renderPaymentMethods()}
      </VStack>
      <VStack width="100%" spacing={4}>
        <VStack width="100%" spacing={1}>
          {formLabelRenderer('BILLING ADDRESS')}
          <ChakraText width="100%" fontSize="md">
            Select the address that matches your card or payment method.
          </ChakraText>
        </VStack>
        {renderBillingAddress()}
      </VStack>
      {renderError()}
      <VStack width="100%" spacing={1}>
        <PrimaryGradientButton
          aria-label="pay now"
          size="lg"
          maxW="100%"
          borderRadius="lg"
          my={4}
          disabled={isLoading}
          isLoading={isLoading}
          onClick={payNow}
        >
          PAY NOW
        </PrimaryGradientButton>
        <Button
          aria-label="return to shipping"
          height="fit-content"
          background="transparent"
          textDecoration="underline"
          onClick={() => setCurrentStep(1)}
          _hover={{
            outline: 'none',
          }}
          _focus={{
            outline: 'none',
          }}
        >
          <Icon as={BiChevronLeft} w={6} h={6} marginLeft={1}></Icon>
          Return to shipping
        </Button>
      </VStack>
    </VStack>
  )

  const renderPaymentMethods = () => {
    return (
      <Accordion
        defaultIndex={[0]}
        width="100%"
        border="1px solid"
        borderColor={theme.colors.dark.primaryStroke}
        borderRadius="md"
      >
        {PAYMENT_METHODS.map((item, index) => {
          return (
            <AccordionItem
              key={item.code}
              borderColor={theme.colors.dark.primaryStroke}
              borderTopWidth={index !== 0 ? '1px' : 0}
            >
              <AccordionButton
                aria-label={paymentMethod}
                padding={3}
                borderBottomWidth={item.code === paymentMethod ? '1px' : 0}
                borderStyle="solid"
                borderColor={theme.colors.dark.primaryStroke}
                onClick={() => setPaymentMethod(item.code)}
                _hover={{
                  outline: 'none',
                }}
                _focus={{
                  outline: 'none',
                }}
              >
                <HStack spacing={4}>
                  <Radio
                    size="lg"
                    isChecked={item.code === paymentMethod}
                    pr={4}
                    _hover={{
                      outline: 'none',
                    }}
                    _focus={{
                      outline: 'none',
                    }}
                  />
                  <Image
                    src={item.img}
                    alt={item.alt}
                    width={160}
                    height={41}
                    objectFit="contain"
                    objectPosition="left"
                  />
                </HStack>
              </AccordionButton>
              <AccordionPanel
                display="flex"
                justifyContent="center"
                alignItems="center"
                fontSize="xl"
                fontWeight="bold"
                minHeight="100px"
                textAlign="center"
              >
                {item.code === 'manual' ? 'You will be redirected to Coinbase' : 'COMING SOON'}
              </AccordionPanel>
            </AccordionItem>
          )
        })}
      </Accordion>
    )
  }

  const renderBillingAddress = () => {
    return (
      <Accordion
        defaultIndex={[0]}
        width="100%"
        border="1px solid"
        borderColor={theme.colors.dark.primaryStroke}
        borderRadius="md"
      >
        <AccordionItem borderTopWidth={0} borderBottomWidth={0}>
          <AccordionButton
            aria-label="shipping address"
            padding={3}
            onClick={() => setIsBillingAddressSame(true)}
            _hover={{
              outline: 'none',
            }}
            _focus={{
              outline: 'none',
            }}
          >
            <HStack spacing={4}>
              <Radio
                size="lg"
                isChecked={isBillingAddressSame}
                _hover={{
                  outline: 'none',
                }}
                _focus={{
                  outline: 'none',
                }}
              />
              <ChakraText fontSize="lg">SAME AS SHIPPING ADDRESS</ChakraText>
            </HStack>
          </AccordionButton>
        </AccordionItem>
        <AccordionItem borderColor={theme.colors.dark.primaryStroke} borderBottom={0}>
          <AccordionButton
            aria-label="billing address"
            padding={3}
            onClick={() => setIsBillingAddressSame(false)}
            _hover={{
              outline: 'none',
            }}
            _focus={{
              outline: 'none',
            }}
          >
            <HStack spacing={4}>
              <Radio
                size="lg"
                isChecked={!isBillingAddressSame}
                _hover={{
                  outline: 'none',
                }}
                _focus={{
                  outline: 'none',
                }}
              />
              <ChakraText fontSize="lg" textAlign="left">
                USE A DIFFERENT BILLING ADDRESS
              </ChakraText>
            </HStack>
          </AccordionButton>
          <AccordionPanel padding={2}>{renderAddressForm(true)}</AccordionPanel>
        </AccordionItem>
      </Accordion>
    )
  }

  const payNow = async () => {
    if (!isBillingAddressSame) {
      const isNewError = { ...isError }
      isNewError.billingLastName = !billingLastName
      isNewError.billingAddress = !billingAddress
      isNewError.billingCity = !billingCity
      isNewError.billingState = !billingState
      isNewError.billingCountry = !billingCountry
      isNewError.billingPostCode = !billingPostCode
      isNewError.billingPhone = !billingPhone
      setError(isNewError)
      if (
        isNewError.billingLastName ||
        isNewError.billingAddress ||
        isNewError.billingCity ||
        isNewError.billingState ||
        isNewError.billingCountry ||
        isNewError.billingPostCode ||
        isNewError.billingPhone
      ) {
        return
      }
    }

    let orderDetails: any = {
      customer: { email: customerEmail },
      shipping: {
        name: shippingFirstName + shippingLastName,
        street: shippingAddress + shippingAddress2,
        town_city: shippingCity,
        postal_zip_code: shippingPostCode,
        county_state: shippingState.value,
        country: shippingCountry.value,
      },
    }

    if (isBillingAddressSame) {
      orderDetails = { ...orderDetails, billing: orderDetails.shipping }
    } else {
      orderDetails = {
        ...orderDetails,
        billing: {
          name: billingFirstName + billingLastName,
          street: billingAddress + billingAddress2,
          town_city: billingCity,
          postal_zip_code: billingPostCode,
          county_state: billingState.value,
          country: billingCountry.value,
        },
      }
    }

    if (checkout.products[0].variant_groups.length > 0) {
      const variantGroups = checkout.products[0].variant_groups
      const typeVariant = variantGroups.find((group) => group.name === 'type')
      const sizeVariant = variantGroups.find((group) => group.name === 'size')
      const lineItems = {}

      if (typeVariant && typeVariant.options && typeVariant.options.length > 0) {
        const options = typeVariant.options

        const option = options.find((item) => item.name === pType)
        if (option) {
          lineItems[checkout.live.line_items[0].id] = {
            variants: { [typeVariant.id]: option.id },
          }
        }
      }

      if (sizeVariant && sizeVariant.options && sizeVariant.options.length > 0) {
        const options = sizeVariant.options

        const option = options.find((item) => item.name === pSize)
        if (option) {
          if (lineItems[checkout.live.line_items[0].id]) {
            lineItems[checkout.live.line_items[0].id] = {
              variants: {
                ...lineItems[checkout.live.line_items[0].id].variants,
                [sizeVariant.id]: option.id,
              },
            }
          } else {
            lineItems[checkout.live.line_items[0].id] = {
              variants: { [sizeVariant.id]: option.id },
            }
          }
        }
      }

      if (Object.keys(lineItems).length > 0) {
        orderDetails = { ...orderDetails, line_items: lineItems }
      }
    }

    if (checkout.has.physical_delivery) {
      orderDetails = {
        ...orderDetails,
        fulfillment: {
          shipping_method: checkout.shipping_methods.length > 0 ? checkout.shipping_methods[0].id : undefined,
        },
      }
    }

    const extraFields = checkout.extra_fields

    if (extraFields.length > 0) {
      const nft_id = extraFields.find((extraField) => extraField.name === 'nft_id')
      const product_size = extraFields.find((extraField) => extraField.name === 'product_size')
      const billing_phone = extraFields.find((extraField) => extraField.name === 'billing_phone')
      const shipping_phone = extraFields.find((extraField) => extraField.name === 'shipping_phone')
      const billing_company = extraFields.find((extraField) => extraField.name === 'billing_company')
      const shipping_company = extraFields.find((extraField) => extraField.name === 'shipping_company')

      orderDetails = { ...orderDetails, extra_fields: {} }

      if (nft_id) {
        orderDetails = {
          ...orderDetails,
          extra_fields: {
            ...orderDetails.extra_fields,
            [nft_id.id]: nft.nftId,
          },
        }
      }

      if (product_size) {
        orderDetails = {
          ...orderDetails,
          extra_fields: {
            ...orderDetails.extra_fields,
            [product_size.id]: pSize,
          },
        }
      }

      if (billing_phone) {
        orderDetails = {
          ...orderDetails,
          extra_fields: {
            ...orderDetails.extra_fields,
            [billing_phone.id]: isBillingAddressSame ? shippingPhone : billingPhone,
          },
        }
      }

      if (shipping_phone) {
        orderDetails = {
          ...orderDetails,
          extra_fields: {
            ...orderDetails.extra_fields,
            [shipping_phone.id]: shippingPhone,
          },
        }
      }

      if (billing_company) {
        orderDetails = {
          ...orderDetails,
          extra_fields: {
            ...orderDetails.extra_fields,
            [billing_company.id]: isBillingAddressSame ? shippingCompany : billingCompany,
          },
        }
      }

      if (shipping_company) {
        orderDetails = {
          ...orderDetails,
          extra_fields: {
            ...orderDetails.extra_fields,
            [shipping_company.id]: shippingCompany,
          },
        }
      }
    }

    if (paymentMethod !== 'manual') {
      setErrorMessage('Coinbase is the only available payment method at the moment. Please select Coinbase.')
      return
    }

    const gateway = checkout.gateways.find((gateway) => gateway.code === paymentMethod)

    if (!gateway) {
      setErrorMessage('There is not avaialble method in Commerce. Please contact administrator.')
      return
    }

    orderDetails = {
      ...orderDetails,
      payment: {
        gateway: 'manual',
        manual: {
          id: gateway.id,
        },
      },
    }

    let order = null
    try {
      setIsLoading(true)
      order = await commerce.checkout.capture(checkout.id, orderDetails)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      if (error.data && error.data.error && error.data.error.errors) {
        const keys = Object.keys(error.data.error.errors)
        setErrorMessage(error.data.error.errors[keys[0]][0])
      } else if (error.data && error.data.error && error.data.error.message) {
        setErrorMessage(error.data.error.message)
      } else {
        setErrorMessage(error.message)
      }
      return
    }

    if (!order) {
      setErrorMessage('There is no order made in Commerce. Please try again.')
      return
    }

    try {
      const newCheckout = {
        name: nft.name,
        description: nft.description || nft.name,
        local_price: {
          amount: order.order_value.raw.toFixed(2),
          currency: 'USD',
        },
        logo_url: nftUrl,
        pricing_type: 'fixed_price',
        requested_info: ['email', 'name'],
      }
      setIsLoading(true)
      const cbCheckout = await restAPI.createCBCheckout(newCheckout)
      // NOTE: save order info to DB
      const newOrder = {
        nftId: nft.nftId,
        cProductId: `nft-product-${price}`,
        cbCheckoutId: cbCheckout.data.id,
        orderId: order.id,
        transactionId: order.transactions[0].id,
        status: false,
      }

      try {
        setIsLoading(true)
        await restAPI.registerOrder(newOrder)
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
        setErrorMessage(error.message)
        return
      }
      window.location.href = `${COINBASE_CHECKOUT_URL}/${cbCheckout.data.id}`
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      setErrorMessage(error.message)
      return
    }
  }

  const renderError = () => {
    return (
      errorMessage && (
        <Flex
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          backgroundColor={theme.colors.errorText}
          padding={3}
          borderRadius="lg"
        >
          <HStack width="100%" spacing={1}>
            <Icon as={BiErrorCircle} w={6} h={6} marginLeft={1}></Icon>
            <ChakraText fontSize="md">{errorMessage}</ChakraText>
          </HStack>
          <Icon as={FaTimes} w={6} h={6} marginLeft={1} cursor="pointer" onClick={() => setErrorMessage('')}></Icon>
        </Flex>
      )
    )
  }

  return (
    <Fragment>
      <NextSeo {...pageMeta} />
      <ChakraLayout position="relative" py={{ base: 0, lg: 10 }} zIndex={2}>
        <Stack
          direction={{ base: 'column-reverse', lg: 'row' }}
          width="100%"
          maxWidth="7xl"
          marginX="auto"
          spacing={12}
        >
          <VStack flex={3} spacing={8}>
            <ChakraSteps
              steps={STEPS}
              currentStep={currentStep}
              archivedStep={archivedStep}
              onClick={(index: number) => {
                setErrorMessage('')
                setCurrentStep(index)
              }}
            />
            {renderError()}
            {currentStep === 0 ? renderInformation() : currentStep === 1 ? renderShipping() : renderPayment()}
          </VStack>
          <VStack
            flex={2}
            spacing={8}
            backgroundColor={useColorModeValue(theme.colors.light.cardBg, theme.colors.dark.cardBg)}
            height="fit-content"
            padding={6}
            borderRadius="lg"
          >
            <HStack width="100%" alignItems="flex-start" spacing={4}>
              <Image src={getViewableNFTURL(nft)} alt={nft.title} width={96} height={96} />
              <Box flex={1}>
                <ChakraText fontSize="lg">{nft ? nft.name : ''}</ChakraText>
                <ChakraText type="secondary" fontSize="md">
                  Type: {pType}
                </ChakraText>
                <ChakraText type="secondary" fontSize="md">
                  Size: {pSize}
                </ChakraText>
              </Box>
              <ChakraText fontSize="xl">{'$' + price}</ChakraText>
            </HStack>
            <VStack width="100%" spacing={2}>
              <HStack width="100%" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <ChakraText fontSize="lg">Subtotal</ChakraText>
                <ChakraText fontSize="lg">{'$' + price}</ChakraText>
              </HStack>
              <ChakraDivider />
              <HStack width="100%" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <ChakraText fontSize="lg">Shipping</ChakraText>
                <ChakraText fontSize="lg" textAlign="right">
                  {shippingMethod}
                </ChakraText>
              </HStack>
              <HStack width="100%" justifyContent="space-between" alignItems="flex-start" paddingX={2} spacing={2}>
                <ChakraText fontSize="xl" fontWeight="bold">
                  Total
                </ChakraText>
                <ChakraText fontSize="xl">
                  USD <b>{'$' + price}</b>
                </ChakraText>
              </HStack>
            </VStack>
          </VStack>
        </Stack>
      </ChakraLayout>
    </Fragment>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.query?.productId && typeof context.query?.productId === 'string') {
    const apolloClient = initializeApollo()
    const { data } = await apolloClient.query({
      query: isNFTId(context.query.productId) ? NFT_BY_NFTID_QUERY : NFT_BY_SLUG_QUERY,
      variables: {
        slug: context.query.productId,
        nftId: context.query.productId,
      },
    })
    if (data.nft.length > 0) {
      return {
        props: {
          nft: data.nft[0],
        },
      }
    } else {
      return { props: {} }
    }
  } else {
    return { props: {} }
  }
}
export default memo(CheckoutPage)
