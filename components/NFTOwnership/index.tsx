import { Flex } from '@chakra-ui/react'
import { compareAddresses } from '@nftmall/sdk'
import { NFTOwnershipProps, NFTUserCard } from '@nftmall/uikit'
import useAmICreator from 'app/hooks/nftmall/useAmICreator'
import useAmIOwner from 'app/hooks/nftmall/useAmIOwner'
import { useActiveWeb3React } from 'app/services/web3'
import { useUserProfile } from 'app/state/profile/hook'
import { FC, useMemo } from 'react'

export const NFTOwnership: FC<NFTOwnershipProps> = ({ item, isOwnerVisible, isCreatorVisible, handleFollow }) => {
  const { account } = useActiveWeb3React()
  const { firstCreator: creatorId } = useAmICreator(item)
  const { firstOwner: ownerId } = useAmIOwner(item)
  const { data: creator } = useUserProfile({
    variables: { id: creatorId },
    shouldFetch: !!creatorId,
  })
  const { data: owner } = useUserProfile({
    variables: { id: ownerId },
    shouldFetch: !!ownerId,
  })
  const isOwnerCreator = useMemo(
    () => !!creatorId && !!ownerId && compareAddresses(creatorId, ownerId),
    [creatorId, ownerId]
  )
  const amIOwner = useMemo(() => !!account && !!ownerId && compareAddresses(ownerId, account), [ownerId, account])

  // console.error({ creator, owner })

  if (!creator && !owner) return null

  return isOwnerCreator ? (
    creator || owner ? (
      <NFTUserCard
        account={account}
        user={creator || owner}
        description="Creator & Owner"
        isOwner={amIOwner}
        handleFollow={handleFollow}
        width={10}
      />
    ) : null
  ) : (
    <Flex gridColumnGap={4}>
      {isCreatorVisible && creator && (
        <NFTUserCard
          account={account}
          user={creator}
          description="Creator"
          isOwner={amIOwner}
          handleFollow={handleFollow}
          width={10}
        />
      )}
      {isOwnerVisible && owner && (
        <NFTUserCard
          account={account}
          user={owner}
          description="Owner"
          isOwner={amIOwner}
          handleFollow={handleFollow}
          width={10}
        />
      )}
    </Flex>
  )
}
