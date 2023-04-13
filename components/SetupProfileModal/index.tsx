import { FormControl, HStack, Modal, ModalBody, ModalCloseButton, ModalOverlay, VStack } from '@chakra-ui/react'
import {
  ChakraFormLabel,
  ChakraInput,
  ChakraModalContent,
  ModalHeading,
  PrimaryGradientButton,
  SecondaryGradientButton,
} from '@nftmall/uikit'
import { useFormik } from 'formik'
import React from 'react'
import * as Yup from 'yup'

import { useModalOpen, useWalletModalToggle } from '../../state/application/hooks'
import { ApplicationModal } from '../../state/application/reducer'

export default function SetupProfileModal() {
  const setupProfileModalOpen = useModalOpen(ApplicationModal.SETUP_PROFILE)
  const toggleSetupProfileModal = useWalletModalToggle()
  const profileFormik = useFormik({
    initialValues: {
      username: '',
      email: '',
    },
    validationSchema: Yup.object().shape({
      username: Yup.string().required('Username is required.'),
      email: Yup.string().email().required('Email is required'),
    }),
    onSubmit: ({ username, email }) => {
      console.log(username, email)
    },
  })
  return (
    <Modal isOpen={setupProfileModalOpen} onClose={toggleSetupProfileModal} isCentered size="lg">
      <ModalOverlay />
      <ChakraModalContent rounded="2xl">
        <ModalHeading mb={4}>Setup Profile</ModalHeading>
        <ModalCloseButton aria-label="close wallet modal" />
        <ModalBody padding={0} zIndex={1}>
          <VStack width="100%" spacing={4}>
            <FormControl>
              <ChakraFormLabel>Username</ChakraFormLabel>
              <ChakraInput
                name="name"
                placeholder="Enter your name..."
                isInvalid={!!profileFormik.errors.username}
                value={profileFormik.values.username}
                onChange={profileFormik.handleChange}
              />
            </FormControl>
            <FormControl>
              <ChakraFormLabel>Email</ChakraFormLabel>
              <ChakraInput
                name="name"
                placeholder="Enter your name..."
                isInvalid={!!profileFormik.errors.email}
                value={profileFormik.values.email}
                onChange={profileFormik.handleChange}
              />
            </FormControl>
            <HStack spacing={4}>
              <SecondaryGradientButton aria-label="skip submit profile" maxW="fit-content" size="lg" px={16}>
                Skip for now
              </SecondaryGradientButton>
              <PrimaryGradientButton aria-label="submit profile" maxW="fit-content" size="lg" px={16} type="submit">
                Save & Finish {'>'}
              </PrimaryGradientButton>
            </HStack>
          </VStack>
        </ModalBody>
      </ChakraModalContent>
    </Modal>
  )
}
