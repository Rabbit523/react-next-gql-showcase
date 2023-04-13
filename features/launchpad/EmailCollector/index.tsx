import { Box, FormControl, InputGroup, InputRightElement } from '@chakra-ui/react'
import { ChakraErrorText, ChakraTextInput, SendButton } from '@nftmall/uikit'
import useToast from 'app/hooks/nftmall/useToast'
import { restAPI } from 'app/utils/rest'
import * as EmailValidator from 'email-validator'
import { ChangeEvent, FC, useState } from 'react'

export interface EmailCollectorProps {
  placeholderText?: string
}

const EmailCollector: FC<EmailCollectorProps> = ({ placeholderText = 'Enter your email' }) => {
  const [email, setEmail] = useState('')
  const [hasError, setHasError] = useState(false)
  const { toastError, toastInfo, toastSuccess } = useToast()

  const handleSubmit = (email: string) => {
    restAPI
      .subscribe(email)
      .then((res: any) => {
        if (res.message) {
          toastInfo('Info', res.message)
        } else {
          toastSuccess('Thanks for signing up!')
        }
      })
      .catch((e) => {
        console.error(e)
        toastError('An error occurred.', e.message)
      })
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setHasError(false)
    setEmail(e.currentTarget.value)
  }

  const onHandleSubmit = () => {
    if (EmailValidator.validate(email) && handleSubmit) {
      handleSubmit(email)
    } else {
      setHasError(true)
    }
  }

  return (
    <Box minWidth="320px" py="4">
      <FormControl
        transition="all 0.3s ease"
        height={14}
        display="flex"
        flexWrap="wrap"
        minW={64}
        className="email-collector"
        zIndex={1}
      >
        <InputGroup>
          <ChakraTextInput
            autoFocus
            height="inherit"
            isRequired
            placeholder={placeholderText}
            px={4}
            type="email"
            value={email}
            onChange={handleChange}
          />
          <InputRightElement onClick={onHandleSubmit} display="flex" height="100%" mx={2}>
            <SendButton />
          </InputRightElement>
        </InputGroup>
      </FormControl>
      {hasError && <ChakraErrorText width="100%">Please enter a valid email.</ChakraErrorText>}
    </Box>
  )
}
export default EmailCollector
