import { Flex, Text } from '@chakra-ui/react'
import { Spinner } from '@nftmall/uikit'
import UserTemplate from 'app/features/user/UserTemplate'
import { useActiveWeb3React } from 'app/services/web3'
import { useUserProfile } from 'app/state/profile/hook'
import { FC } from 'react'

const AccountPage: FC = () => {
  const { account } = useActiveWeb3React()
  const {
    data: myProfile,
    isLoading,
    error,
  } = useUserProfile({
    variables: {
      id: account,
      skipCache: true,
    },
    shouldFetch: !!account,
    swrConfig: {
      refreshInterval: 120 * 1000,
    },
  })

  if (myProfile) {
    return <UserTemplate user={myProfile} />
  }

  return (
    <Flex width="100%" height="360px" justifyContent="center" alignItems={'center'}>
      {account ? (
        <Spinner size="lg" />
      ) : (
        <Text textAlign="center" fontWeight="bold" fontSize="xl">
          Please Sign In to view this page.
        </Text>
      )}
    </Flex>
  )
}

export default AccountPage
