import { FormControl, Modal, ModalBody, ModalOverlay, VStack } from '@chakra-ui/react'
import {
  ChakraErrorText,
  ChakraExternalLink,
  ChakraModalContent,
  ChakraText,
  ChakraTextarea,
  ChakraTextInput,
  ModalHeading,
  PrimaryGradientButton,
  ReportModalProps,
  SecondaryGradientButton,
  theme,
} from '@nftmall/uikit'
import * as EmailValidator from 'email-validator'
import { ChangeEvent, FC, useCallback, useState } from 'react'

const ReportModal: FC<ReportModalProps> = ({ onDismiss = () => null, onSubmit }) => {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [descTouched, setDescTouched] = useState(false)
  const [descError, setDescError] = useState('')

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      if (!emailTouched) setEmailTouched(true)
      setEmail(value)
      if (!value) {
        setEmailError('Email is required.')
      } else if (!EmailValidator.validate(value)) {
        setEmailError('Please enter a valid email.')
      } else {
        setEmailError('')
      }
    },
    [emailTouched]
  )

  const handleDescriptionChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value
      if (!descTouched) setDescTouched(true)
      setDescription(value)
      if (!value) {
        setDescError('Description is required.')
      } else {
        setDescError('')
      }
    },
    [descTouched]
  )

  const onSub = useCallback(() => {
    onSubmit(email, description)
  }, [description, email, onSubmit])

  return (
    <Modal isOpen={true} onClose={onDismiss} isCentered size="md">
      <ModalOverlay />
      <ChakraModalContent rounded="2xl">
        <ModalBody p={0} zIndex={1}>
          <VStack align="initial" spacing={8}>
            <ModalHeading>Submit a report</ModalHeading>
            <ChakraText type="secondary">
              If you believe there's been a violation of NFTmall's{' '}
              <ChakraExternalLink href="/terms" color={theme.colors.yellow}>
                Terms of Service
              </ChakraExternalLink>
              , please complete this report.
            </ChakraText>
            <ChakraText type="secondary">
              For all cases related to potential copyright infringement, please email{' '}
              <ChakraExternalLink href="mailto:support@nftmall.io" color={theme.colors.yellow}>
                support@nftmall.io
              </ChakraExternalLink>{' '}
              directly with a formal DMCA Takedown Request.
            </ChakraText>
            <VStack width="100%" spacing={3}>
              <FormControl id="email">
                <ChakraTextInput
                  borderRadius="md"
                  type="email"
                  value={email}
                  placeholder="Email address"
                  onChange={handleInputChange}
                />
                {emailError && <ChakraErrorText>{emailError}</ChakraErrorText>}
              </FormControl>
              <FormControl id="bio">
                <ChakraTextarea
                  rows={5}
                  value={description}
                  placeholder="Describe why you think this page should be removed from NFTmall."
                  onChange={handleDescriptionChange}
                  isInvalid={!!descError}
                />
                {descError && <ChakraErrorText>{descError}</ChakraErrorText>}
              </FormControl>
              <PrimaryGradientButton
                disabled={!emailTouched || !descTouched || emailError !== '' || descError !== ''}
                onClick={onSub}
              >
                Submit
              </PrimaryGradientButton>
              <SecondaryGradientButton onClick={onDismiss}>Cancel</SecondaryGradientButton>
            </VStack>
          </VStack>
        </ModalBody>
      </ChakraModalContent>
    </Modal>
  )
}

export default ReportModal
