import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { secret, uri } = req.query
  // Check for secret to confirm this is a valid request
  if (secret !== process.env.NEXT_PUBLIC_PAGE_REVALIDATION_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' })
  }
  if (!uri) {
    return res.status(401).json({ message: '`uri` is missing' })
  }

  try {
    await res.revalidate(uri as string)
    return res.json({ revalidated: true })
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).send('Error revalidating')
  }
}
