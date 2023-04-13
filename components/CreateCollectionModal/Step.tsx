import { Box, Divider, Stack, StackProps, Text, useColorModeValue } from '@chakra-ui/react'
import { ChakraDivider, theme } from '@nftmall/uikit'
import { FC } from 'react'

import { StepCircle } from './StepCircle'

interface StepProps extends StackProps {
  title: string
  description: string
  isCompleted: boolean
  isActive: boolean
  isLastStep: boolean
}

export const Step: FC<StepProps> = ({
  isActive,
  isCompleted,
  isLastStep,
  title,
  description,
  children,
  ...stackProps
}) => {
  const btnTextColor = useColorModeValue(theme.colors.light.primaryText, theme.colors.dark.primaryText)

  return (
    <Stack spacing="4" direction="row" {...stackProps}>
      <Stack spacing="0" align="center">
        <StepCircle isActive={isActive} isCompleted={isCompleted} />
        <Divider
          orientation="vertical"
          borderWidth="1px"
          borderColor={isCompleted ? 'accent' : isLastStep ? 'transparent' : 'inherit'}
        />
      </Stack>
      <Stack spacing="0.5" pb={isLastStep ? '0' : '8'} flex={1} position="relative" maxW={'90%'}>
        <Text fontWeight="bold">{title}</Text>
        {description && <Text color="whiteAlpha.700">{description}</Text>}
        {!isLastStep && <ChakraDivider pt={2} />}

        {isActive && (
          <>
            <Box maxWidth="100%">{children}</Box>
            {/* <HStack spacing={2}>
              <SecondaryGradientButton
                size="sm"
                color={btnTextColor}
                maxW="fit-content"
                px={8}
                // isDisabled={isVerifying}
                // onClick={prevStep}
              >
                Back
              </SecondaryGradientButton>
              <PrimaryGradientButton
                size="sm"
                color={btnTextColor}
                maxW="fit-content"
                px={8}
                isLoading
                // isLoading={isVerifying}
                // onClick={onVerifyHandler}
              >
                Sign Message
              </PrimaryGradientButton>
            </HStack> */}
          </>
        )}
      </Stack>
    </Stack>
  )
}
