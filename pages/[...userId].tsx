import { isAddress, validateUsername } from '@nftmall/sdk'
import { Profile } from '@nftmall/uikit'
import { User } from '@prisma/client'
import UserTemplate from 'app/features/user/UserTemplate'
import { PROFILE_BY_ID_QUERY, PROFILE_BY_USERNAME_QUERY, USER_ROUTES_QUERY } from 'app/utils/apollo'
import { NODE_ENV, REVALIDATE_1_DAY, REVALIDATE_6_HOUR, REVALIDATE_12_HOUR } from 'app/utils/constants'
import { initializeApollo } from 'app/utils/useApollo'
import { GetStaticPaths, GetStaticProps } from 'next'
import { FC } from 'react'

interface UserPageProps {
  user: Profile
}

export const UserPage: FC<UserPageProps> = ({ user }) => {
  console.log({ user })
  return <UserTemplate user={user} />
}

export const getStaticProps: GetStaticProps = async (context) => {
  const userId: string = typeof context.params.userId === 'string' ? context.params.userId : context.params.userId?.[0]
  console.log('====================', { userId, context })
  if (userId) {
    const checksumedAddress = isAddress(userId)
    const lowercaseAddress = checksumedAddress ? checksumedAddress.toLowerCase() : undefined
    if (lowercaseAddress || userId.startsWith('@')) {
      try {
        const apolloClient = initializeApollo()
        let query
        if (lowercaseAddress) {
          query = {
            query: PROFILE_BY_ID_QUERY,
            variables: {
              userId: lowercaseAddress,
            },
          }
        } else {
          query = {
            query: PROFILE_BY_USERNAME_QUERY,
            variables: {
              username: userId.slice(1), // remove leading '@'
            },
          }
        }
        const { data } = await apolloClient.query(query)
        if (data.User.length > 0) {
          // user is found!
          // console.log({ query, data: data.User[0] })
          const foundUser = data.User[0]
          if (foundUser.deleted || foundUser.blacklisted) {
            return {
              props: {
                user: null,
              },
              revalidate: REVALIDATE_1_DAY,
              notFound: true,
            }
          }

          return {
            props: {
              user: data.User[0],
            },
            revalidate: REVALIDATE_6_HOUR,
          }
        }
      } catch (e) {
        console.error(e)
      }

      if (lowercaseAddress) {
        // if it's an address, return an empty user instead of 404
        return {
          props: {
            user: {
              userId: lowercaseAddress,
              address: lowercaseAddress,
              // verified: true,
            },
          },
          revalidate: REVALIDATE_12_HOUR,
        }
      }
      console.error('============= Not found username: ' + userId)
      // @username not found
    } else {
      // invalid userid
      console.error('============= Invalid userId ' + userId)
    }

    if (validateUsername(userId)) {
      // this may still be valid username without leading '@'
      // https://github.com/vercel/next.js/discussions/11346#discussioncomment-2702308
      // YAY! nextjs supports redirect in `getStaticProps()` !
      return {
        redirect: {
          destination: `/@${userId}`,
          permanent: false, // what about `true` ?!
        },
      }
    }
    // user really not found.
    // or invalid path. 404!
  }
  return {
    props: {
      user: null,
    },
    revalidate: REVALIDATE_1_DAY,
    notFound: true,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' }
  // TODO: here we need to pregenerate TOP BUYERs and SELLERs.
  if (NODE_ENV !== 'production') return { paths: [], fallback: 'blocking' }
  const apolloClient = initializeApollo()
  const query = {
    query: USER_ROUTES_QUERY,
  }
  const { data } = await apolloClient.query(query)
  // console.log('===========USER PAGE=========', data.User.length)
  const paths = data.User.map((user: User) => ({
    params: {
      address: String(user.username || user.userId),
    },
  }))
  // console.log('=========User Paths=========\n', paths)
  return { paths, fallback: 'blocking' }
}

export default UserPage
