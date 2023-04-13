import { Box, Flex, HStack, Icon, Image, Skeleton, Stack, Text, VStack } from '@chakra-ui/react'
import {
  formatNumber,
  formatPercent,
  getNextCollectionName,
  getNextCollectionURI,
  HOME_BODY,
  NextCollection,
  SelectOption,
} from '@nftmall/sdk'
import { ChakraDivider, ChakraHeadingEmoji, ChakraSelect, CollectionLogo, NextChakraLink } from '@nftmall/uikit'
import { useTopCollections } from 'app/services/our-api/hooks'
import { FC, useCallback, useMemo, useState } from 'react'
import { IoMdLink } from 'react-icons/io'
import { useSWRConfig } from 'swr'

const initialCollection: NextCollection[] = [
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
]

const INTERVALS = [
  { label: 'Last 30 days', value: 'volume30d' },
  { label: 'Last 7 days', value: 'volume7d' },
  { label: 'Last 24 hours', value: 'volume1d' },
]

const CHAINS = [
  { label: 'All chains', value: 'All chains', img: <Icon as={IoMdLink} w={6} h={6} /> },
  {
    label: 'Ethereum',
    value: 'Ethereum',
    img: (
      <Image borderRadius="full" w={6} h={6} src="https://opensea.io/static/images/logos/ethereum.png" alt="Ethereum" />
    ),
  },
  {
    label: 'Polygon',
    value: 'Polygon',
    img: (
      <Image borderRadius="full" w={6} h={6} src="https://opensea.io/static/images/logos/polygon.svg" alt="Polygon" />
    ),
  },
  {
    label: 'Klaytn',
    value: 'Klaytn',
    img: <Image borderRadius="full" w={6} h={6} src="https://opensea.io/static/images/logos/klaytn.png" alt="Klaytn" />,
  },
  {
    label: 'Solana',
    value: 'Solana',
    img: <Image borderRadius="full" w={6} h={6} src="https://opensea.io/static/images/logos/solana.svg" alt="Solana" />,
  },
]

type PercentRendererProps = {
  currentVol: number | undefined
  prevVol: number | undefined
  // collection?: OurCollectionWithStatAndMetadata
}

const PercentRenderer: FC<PercentRendererProps> = ({ currentVol, prevVol }) => {
  // volume={collection?.stats?.volume7d} prevVolume={collection?.stats?.volume7d}
  // if (currentVol === undefined && prevVol === undefined) {
  //   return <Skeleton height="20px" width="60px" transform="auto | auto-gpu" my={1} float="right" />
  // }
  if (currentVol && prevVol >= 0.0001) {
    const percent = (currentVol / prevVol) * 100
    const percentString = formatPercent(percent, '-')
    if (percent === 0) {
      return <Text color="muted">0%</Text>
    }
    if (percent > 0) {
      return <Text color="lightGreen">{percentString}</Text>
    }
    if (percent < 0) {
      return <Text color="tomato">{percentString}</Text>
    }
  }
  return <Text color="muted">-</Text>
}

interface TopCollectionsProps {
  fallbackCollections?: NextCollection[]
}

// const COLUMNS = [0, 1, 2]
// const SIZE_PER_COLUMN = 4
const COLUMNS = [0]
const SIZE_PER_COLUMN = 6

const TopCollections: FC<TopCollectionsProps> = ({ fallbackCollections }) => {
  const [timeFilter, setTimeFilter] = useState<SelectOption>(INTERVALS[0])
  const [typeFilter, setTypeFilter] = useState(CHAINS[0])
  const collections = fallbackCollections
  // NOTE: here, we MAY use SWR but it gives server unnecessary load.
  // And this top collecition data is not very frequently updated,
  // so it's better not use SWR to dynamically refresh.
  // const {
  //   data: collections,
  //   isLoading,
  //   error: loadingError,
  // } = useTopCollections({
  //   variables: { sortBy: timeFilter.value },
  //   shouldFetch: !!timeFilter.value,
  //   swrConfig: {
  //     refreshInterval: 5 * 60 * 1000, // once per 5 mins
  //     fallbackData: fallbackCollections,
  //   },
  // })

  const rows = useMemo(() => (collections?.length ? collections : initialCollection), [collections])

  const handleInputChange = useCallback((type: string, value: any) => {
    console.log({ type, value })
    if (type === 'times') {
      setTimeFilter(value)
    } else if (type === 'types') {
      setTypeFilter(value)
    }
  }, [])

  return (
    <Box>
      <HStack
        width="100%"
        mb={4}
        display="flex"
        flexDirection={{ base: 'column', md: 'row' }}
        spacing={0}
        gap={4}
        justifyContent="center"
      >
        <ChakraHeadingEmoji emoji={HOME_BODY.topCollections.emoji} text={HOME_BODY.topCollections.title} zIndex={1} />
        {/* <Stack width={{ base: '180px' }} py="md" mr={{ md: 0, lg: 2 }}>
          <ChakraSelect
            options={INTERVALS}
            placeholder="Times"
            value={timeFilter}
            isSearchable
            height="48px"
            onChange={(value) => handleInputChange('times', value)}
          />
        </Stack> */}
      </HStack>
      <ChakraDivider />
      <Flex justifyContent="center" width="100%" flexWrap="wrap" userSelect="none">
        {COLUMNS.map((column) => (
          <VStack key={column} width={{ base: 'full', xl: '31%' }}>
            {rows.slice(column * SIZE_PER_COLUMN, (column + 1) * SIZE_PER_COLUMN).map((collection, row) => {
              return (
                <NextChakraLink
                  key={collection?.address || row}
                  href={collection ? getNextCollectionURI(collection) : '#'}
                  width="full"
                  maxWidth={500}
                  borderBottom="1px solid #a9a9a930"
                  _hover={{
                    outline: '1px solid rgb(229, 232, 235)',
                    boxShadow: 'rgb(251, 238, 222, 0.25) 1px 0px 10px 3px',
                    borderRadius: 10,
                    cursor: 'pointer',
                  }}
                  px={{ base: 0, md: 4 }}
                  py={3}
                >
                  <HStack spacing="3" display="flex" position="relative">
                    <Flex textAlign="center" minWidth="20px">
                      <Text as="span" fontWeight="medium">
                        {column * SIZE_PER_COLUMN + row + 1}
                      </Text>
                    </Flex>
                    <Flex minWidth="40px">
                      {collection ? (
                        <CollectionLogo collection={collection} width={48} showVerifiedBadge />
                      ) : (
                        <Skeleton borderRadius="100%" minHeight={12} minWidth={12} transform="auto | auto-gpu" />
                      )}
                    </Flex>

                    <Flex
                      flexDirection="column"
                      position="relative"
                      flex="1" // fill entire available space
                    >
                      {collection ? (
                        <Text as="span" textOverflow="ellipsis" noOfLines={1} wordBreak="break-all" fontWeight="bold">
                          {getNextCollectionName(collection, '---')}
                        </Text>
                      ) : (
                        <Skeleton height="20px" width={{ base: '70%', lg: '50%' }} transform="auto | auto-gpu" my={1} />
                      )}
                      {collection ? (
                        <HStack color="gray">
                          <Text as="span" fontWeight="medium" color="gray" fontSize="sm" mr={1}>
                            Floor:
                          </Text>
                          <Text as="span" fontWeight="bold" color="gray" whiteSpace="nowrap">
                            {collection?.stats?.floorPrice > 0 ? formatNumber(collection.stats.floorPrice, true) : '-'}
                          </Text>
                        </HStack>
                      ) : (
                        <Skeleton height="20px" width={{ base: '50%', lg: '30%' }} transform="auto | auto-gpu" />
                      )}
                    </Flex>
                    <Flex flexDirection="column" alignItems="end">
                      {/* TODO: later render percentage here */}
                      {/* <PercentRenderer
                        prevVol={collection?.stats?.prevVolume7d}
                        currentVol={collection?.stats?.volume7d}
                      /> */}
                      {/* TODO: enable volume */}
                      <Text as="span" fontWeight="medium" color="gray" fontSize="sm">
                        Volume:
                      </Text>
                      {collection ? (
                        <HStack>
                          <Text fontWeight="bold" color="gray" whiteSpace="nowrap">
                            {collection?.stats?.[timeFilter.value] > 0
                              ? formatNumber(collection.stats[timeFilter.value], true)
                              : '-'}
                          </Text>
                        </HStack>
                      ) : (
                        <Skeleton height="20px" width="70px" float="right" />
                      )}
                    </Flex>
                  </HStack>
                </NextChakraLink>
              )
            })}
          </VStack>
        ))}
      </Flex>
    </Box>
  )
}

export default TopCollections
