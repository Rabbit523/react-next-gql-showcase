import { Fragment, memo, useState } from 'react'
import { HStack, Stack, Icon, Image, Box, ButtonGroup, Button } from '@chakra-ui/react'
import { ChakraLayout, ChakraSelectProps } from '@nftmall/uikit'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import dynamic from 'next/dynamic'
import { NFTTable } from '../components/NFTTable'
import { SelectOption } from '@nftmall/sdk'
import { IoMdLink } from 'react-icons/io'
import { RadioButtonGroup, RadioButton } from '../components/RadioButtonGroup'

const timesArray = [
  { label: 'Last 24 hours', value: 'oneDayVolume' },
  { label: 'Last 7 days', value: 'sevenDayVolume' },
  { label: 'Last 30 days', value: 'thirtyDayVolume' },
  { label: 'All time', value: 'totalVolume' },
]

const typesArray = [
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

function Rankings() {
  const [timeFilter, setTimeFilter] = useState<SelectOption>(timesArray[0])
  const [typeFilter, setTypeFilter] = useState(typesArray[0])

  const ChakraSelect = memo(
    dynamic<ChakraSelectProps>(() => import('@nftmall/uikit').then((module) => module.ChakraSelect))
  )

  const handleInputChange = (type: string, value: any) => {
    if (type === 'times') {
      setTimeFilter(value)
    } else if (type === 'types') {
      setTypeFilter(value)
    }
  }

  return (
    <Fragment>
      <HStack pb={4} display="flex" flexDirection={{ base: 'column', lg: 'row' }} spacing={0} mx={{ base: 1, lg: 4 }}>
        <Stack flex={{ base: 16, lg: 6 }} width={{ base: 'full' }} pb={{ base: 4, lg: 0 }} mr={{ md: 0, lg: 2 }}>
          <ChakraSelect
            options={timesArray}
            placeholder="Times"
            value={timeFilter}
            isSearchable
            height="48px"
            onChange={(value) => handleInputChange('times', value)}
          />
        </Stack>
        <RadioButtonGroup defaultValue={typeFilter.value} size="lg">
          {typesArray.map((type) => (
            <RadioButton
              key={type.value}
              value={type.value}
              img={type.img}
              onClick={() => handleInputChange('types', type)}
            >
              {type.label}
            </RadioButton>
          ))}
        </RadioButtonGroup>
      </HStack>
      {/* FIXME: define prop types to NFTTable */}
      <NFTTable timeFilter={timeFilter} />
      <Box display="flex" justifyContent="center" p={4}>
        <ButtonGroup variant="outline" spacing="6">
          <Button colorScheme="white" leftIcon={<FaAngleLeft />}>
            1 - 100
          </Button>
          <Button rightIcon={<FaAngleRight />}>101 - 200</Button>
        </ButtonGroup>
      </Box>
    </Fragment>
  )
}

export default memo(Rankings)
