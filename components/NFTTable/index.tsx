import {
  Avatar,
  Box,
  Center,
  HStack,
  Icon,
  Skeleton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useMediaQuery,
  VStack,
} from '@chakra-ui/react'
import { CLOUDNIARY_THEME_URL, CURRENCY_ICON } from '@nftmall/sdk'
import { BadgeSVG, Image } from '@nftmall/uikit'
import { floatStyling, intToString } from 'apps/frontend/utils/floatStyling'
import { MOCK_DATA } from 'apps/frontend/utils/temp'
import { useEffect, useState } from 'react'
import { IoArrowDown, IoArrowUp } from 'react-icons/io5'

const initialCollection = [
  { id: 1, oneDayChange: undefined },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
  { id: 7 },
  { id: 8 },
  { id: 9 },
  { id: 10 },
  { id: 11 },
  { id: 12 },
  { id: 13 },
  { id: 14 },
  { id: 15 },
]

export const NFTTable = (props: any) => {
  const { timeFilter } = props
  const [rows, setRows] = useState<any[]>(initialCollection)
  const [expanded, setExpanded] = useState<number[]>([])
  const [sort, setSort] = useState('Volume')
  const [order, setOrder] = useState('asc')
  const [isLessThan768] = useMediaQuery('(max-width: 768px)')

  const getPercent = (value: number) => {
    if (value === 0) {
      return (
        <Text color="muted" fontWeight="bold">
          0.0%
        </Text>
      )
    } else if (value === null) {
      return (
        <Text color="muted" fontWeight="bold">
          ---
        </Text>
      )
    } else if (value === undefined) {
      return <Skeleton height="20px" width="60px" transform="auto | auto-gpu" my={1} />
    }
    const val = floatStyling(value * 100)
    if (parseFloat(val) > 0) {
      return <Text color="lightGreen" fontWeight="bold">{`+${val}%`}</Text>
    } else if (parseFloat(val) < 0) {
      return <Text color="tomato" fontWeight="bold">{`${val}%`}</Text>
    }
    return (
      <Text color="muted" fontWeight="bold">
        ---
      </Text>
    )
  }

  const getFloorValue = (value: number) => {
    return value ? value.toFixed(2) : '---'
  }

  const getValue = (data: any, type: string) => {
    if (type === 'Volume') return data[timeFilter.value].unit
    else if (type === '24h') return data.oneDayChange
    else if (type === '7d') return data.sevenDayChange
    else if (type === 'Floor Price') return data.floorPrice?.unit
    else if (type === 'Owners') return data.numOwners
    else if (type === 'Items') return data.totalSupply
  }

  const handleSort = (value: string) => {
    if (value === 'Collection') {
      return
    }
    if (value === sort) {
      const tempAsc = order === 'asc' ? 'desc' : 'asc'
      setOrder(tempAsc)
      return
    }
    setSort(value)
    setOrder('asc')
  }

  const handleExpand = (id: number) => {
    let temp: any[] = []
    if (expanded.includes(id)) {
      temp = expanded.filter((el: number) => el !== id)
    } else {
      temp = [...expanded]
      temp.push(id)
    }
    setExpanded(temp)
  }

  const headers = ['Collection', 'Volume', '24h', '7d', 'Floor Price', 'Owners', 'Items']

  useEffect(() => {
    setTimeout(() => {
      const tempRows = MOCK_DATA.map((el, index) => ({ ...el, id: index + 1 })).sort(function (a, b) {
        if (order === 'asc') {
          return getValue(b, sort) - getValue(a, sort)
        }
        return getValue(a, sort) - getValue(b, sort)
      })
      setRows(tempRows)
    }, 1000)
  }, [sort, order, timeFilter])

  return (
    <Table {...props}>
      <Thead display={{ base: 'none', lg: 'table-header-group' }} width="full">
        <Tr>
          {headers.map((header) => (
            <Th key={header} onClick={() => handleSort(header)}>
              <HStack spacing="1" style={{ cursor: 'pointer' }}>
                <Text>{header}</Text>
                {sort === header && <Icon as={order === 'asc' ? IoArrowDown : IoArrowUp} color="muted" boxSize="4" />}
              </HStack>
            </Th>
          ))}
        </Tr>
      </Thead>
      {isLessThan768 ? (
        <Tbody>
          {rows.map((member) => (
            <Tr key={member.id} _hover={{ cursor: 'pointer' }} userSelect="none">
              <Td display="flex" flexDirection="column" maxWidth="100vw">
                <VStack display="flex" flexDirection="row" justifyContent="space-between">
                  <HStack spacing="3">
                    <Text fontWeight="medium" width={5} textAlign="right">
                      {member.id}
                    </Text>
                    {member.logo ? (
                      <Box position="relative">
                        <Avatar name={member.name} src={member.logo} boxSize="10" />
                        {member.isVerified && (
                          <Center w={4} h={4} mt={1.5} ml={5} position="absolute" bottom={0} right="-5px">
                            <BadgeSVG />
                          </Center>
                        )}
                      </Box>
                    ) : (
                      <Skeleton borderRadius="100%" minHeight={12} minWidth={12} transform="auto | auto-gpu" />
                    )}
                    <Box position="relative" maxWidth="35vw ">
                      {member.name ? (
                        <Text
                          fontWeight="bold"
                          textOverflow="ellipsis"
                          overflowWrap="normal"
                          overflow="hidden"
                          whiteSpace="nowrap"
                        >
                          {member.name}
                        </Text>
                      ) : (
                        <Skeleton height="20px" width="120px" transform="auto | auto-gpu" mb={2} />
                      )}
                      <Text fontWeight="medium" my={1} color="gray" onClick={() => handleExpand(member.id)}>
                        {expanded.includes(member.id) ? '- Less' : '+ More'}
                      </Text>
                    </Box>
                  </HStack>
                  <Box
                    position="relative"
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-end"
                    justifyContent="space-evenly"
                    mt={0}
                  >
                    {member[timeFilter.value]?.unit ? (
                      <HStack>
                        <Image
                          src={CLOUDNIARY_THEME_URL + CURRENCY_ICON['ETH']}
                          alt="ETH"
                          width={16}
                          height={16}
                          className="border-radius-full"
                          priority
                        />
                        <Text fontWeight="bold">{floatStyling(member[timeFilter.value]?.unit)}</Text>
                      </HStack>
                    ) : (
                      <Skeleton height="20px" width="70px" float="right" mb={1} />
                    )}
                    {getPercent(member.oneDayChange)}
                  </Box>
                </VStack>
                {expanded.includes(member.id) && (
                  <VStack
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    borderTop="1px solid"
                    borderColor="gray.700"
                    mt={2}
                    px={4}
                  >
                    <Box position="relative" display="flex" flexDirection="column" alignItems="center" mt={2}>
                      <Text fontWeight="medium" color="gray">
                        7d %
                      </Text>
                      {getPercent(member.sevenDayChange)}
                    </Box>
                    <Box position="relative" display="flex" flexDirection="column" alignItems="center">
                      <Text fontWeight="medium" color="gray">
                        Floor price
                      </Text>
                      {member.floorPrice?.unit ? (
                        <HStack>
                          <Image
                            src={CLOUDNIARY_THEME_URL + CURRENCY_ICON['ETH']}
                            alt="ETH"
                            width={16}
                            height={16}
                            className="border-radius-full"
                            priority
                          />
                          <Text color="muted">{getFloorValue(member.floorPrice?.unit)}</Text>
                        </HStack>
                      ) : (
                        <Skeleton height="20px" width="70px" transform="auto | auto-gpu" my={1} />
                      )}
                    </Box>
                    <Box position="relative" display="flex" flexDirection="column" alignItems="center">
                      <Text fontWeight="medium" color="gray">
                        Owners
                      </Text>
                      {member.numOwners ? (
                        <Text color="muted">{intToString(member.numOwners)}</Text>
                      ) : (
                        <Skeleton height="20px" width="70px" transform="auto | auto-gpu" my={1} />
                      )}
                    </Box>
                    <Box position="relative" display="flex" flexDirection="column" alignItems="center">
                      <Text fontWeight="medium" color="gray">
                        Items
                      </Text>
                      {member.totalSupply ? (
                        <Text color="muted">{intToString(member.totalSupply)}</Text>
                      ) : (
                        <Skeleton height="20px" width="70px" transform="auto | auto-gpu" my={1} />
                      )}
                    </Box>
                  </VStack>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      ) : (
        <Tbody>
          {rows.map((member) => (
            <Tr key={member.id} _hover={{ cursor: 'pointer' }} userSelect="none">
              <Td>
                <HStack spacing="3">
                  <Text fontWeight="medium" width={5} textAlign="right">
                    {member.id}
                  </Text>
                  {member.logo ? (
                    <Box position="relative">
                      <Avatar name={member.name} src={member.logo} boxSize="10" />
                      {member.isVerified && (
                        <Center w={4} h={4} mt={1.5} ml={5} position="absolute" bottom={0} right="-5px">
                          <BadgeSVG />
                        </Center>
                      )}
                    </Box>
                  ) : (
                    <Skeleton borderRadius="100%" minHeight={12} minWidth={12} transform="auto | auto-gpu" />
                  )}
                  {member.name ? (
                    <Text fontWeight="bold">{member.name}</Text>
                  ) : (
                    <Skeleton height="20px" width="200px" transform="auto | auto-gpu" my={1} />
                  )}
                </HStack>
              </Td>
              <Td>
                {member[timeFilter.value]?.unit ? (
                  <HStack>
                    <Image
                      src={CLOUDNIARY_THEME_URL + CURRENCY_ICON['ETH']}
                      alt="ETH"
                      width={16}
                      height={16}
                      className="border-radius-full"
                      priority
                    />
                    <Text fontWeight="bold">{floatStyling(member[timeFilter.value]?.unit)}</Text>
                  </HStack>
                ) : (
                  <Skeleton height="20px" width="70px" />
                )}
              </Td>
              <Td>{getPercent(member.oneDayChange)}</Td>
              <Td>{getPercent(member.sevenDayChange)}</Td>
              <Td>
                {member.floorPrice?.unit ? (
                  <HStack>
                    <Image
                      src={CLOUDNIARY_THEME_URL + CURRENCY_ICON['ETH']}
                      alt="ETH"
                      width={16}
                      height={16}
                      className="border-radius-full"
                      priority
                    />
                    <Text color="muted">{getFloorValue(member.floorPrice?.unit)}</Text>
                  </HStack>
                ) : (
                  <Skeleton height="20px" width="70px" transform="auto | auto-gpu" />
                )}
              </Td>
              <Td>
                {member.numOwners ? (
                  <Text color="muted">{intToString(member.numOwners)}</Text>
                ) : (
                  <Skeleton height="20px" width="70px" transform="auto | auto-gpu" />
                )}
              </Td>
              <Td>
                {member.totalSupply ? (
                  <Text color="muted">{intToString(member.totalSupply)}</Text>
                ) : (
                  <Skeleton height="20px" width="70px" transform="auto | auto-gpu" />
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      )}
    </Table>
  )
}
