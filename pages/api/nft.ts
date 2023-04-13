// import { unionApiClient } from '@nftmall/sdk'
// import { updateNodeGlobalVars } from '@rarible/sdk'
import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
// NOTE: this is nodejs env, so don't include any frontend specific libs or react files here
// https://github.com/NFTmall/NFTmall/issues/969
// Calling union api in this Nextjs's api context is very unstable.
// It's throwing error like
// `error - unhandledRejection: TypeError: Cannot destructure property 'protocol' of 'window.location' as it is undefined.`

// updateNodeGlobalVars()

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const item = {}
  // item = await unionApiClient.item.getItemById({
  //   itemId: 'ETHEREUM:0x5387e668bf36a119e98c19779b0b002f495bb52f:99061405030637849892516838894891786238267708184482378217572376173274975961089',
  // })

  res.status(200).json(item)
}

export default withSentry(handler)
