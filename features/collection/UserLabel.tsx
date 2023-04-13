import { Skeleton } from '@chakra-ui/react'
import { compareAddresses, getProfileURI, isAddress, parseUnionId, shortenAddress } from '@nftmall/sdk'
import { ChakraGradientText, NextChakraLink } from '@nftmall/uikit'
import { useActiveWeb3React } from 'app/services/web3'
import { useUserProfile } from 'app/state/profile/hook'
import { FC, useMemo } from 'react'

interface UserLabelProps {
  userId: string // this can be either union id or address
}

/**
 * Render user in text format. i.e username or name or address
 * @param userId: address or union userid
 * @returns Component
 */
const UserLabel: FC<UserLabelProps> = ({ userId }) => {
  const { account } = useActiveWeb3React()
  const lowercaseAddress = useMemo(() => {
    const checkSummedAddress = isAddress(userId)
    if (checkSummedAddress) return checkSummedAddress.toLowerCase()
    const parsed = parseUnionId(userId, true)
    return parsed?.lowercaseAddress
  }, [userId])

  const { data: profile, isLoading } = useUserProfile({
    variables: { id: lowercaseAddress },
    shouldFetch: !!lowercaseAddress,
  })

  const href = profile ? getProfileURI(profile, account) : undefined

  const userName = useMemo(() => {
    if (account && lowercaseAddress && compareAddresses(lowercaseAddress, account)) {
      return 'You'
    }
    if (!profile) return ''

    return profile?.username
      ? `@${profile.username}`
      : profile?.name
      ? profile.name
      : profile.address
      ? shortenAddress(profile.address)
      : ''
  }, [account, lowercaseAddress, profile])

  if (!lowercaseAddress) {
    console.warn('UserLabel: oh empty userId supplied.')
    return null
  }

  if (isLoading) {
    return <Skeleton width="10"></Skeleton>
  }

  return (
    <NextChakraLink href={href} position="relative" _hover={{ textDecoration: 'none' }} aria-hidden="true">
      <ChakraGradientText as="span" fontWeight={'semibold'}>
        {userName}
      </ChakraGradientText>
    </NextChakraLink>
  )
}

export default UserLabel
