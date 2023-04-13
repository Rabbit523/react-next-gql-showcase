import { SimpleGrid, SimpleGridProps } from '@chakra-ui/react'
import { FC } from 'react'

interface GridProps extends SimpleGridProps {
  isOptimized?: boolean
}

export const ChakraGrid: FC<GridProps> = ({ isOptimized, children }) => {
  return (
    <SimpleGrid
      columns={{
        base: 1,
        md: isOptimized ? 2 : 3,
        lg: isOptimized ? 3 : 4,
        xl: isOptimized ? 3 : 4,
        xxl: isOptimized ? 4 : 5,
        xxxl: isOptimized ? 6 : 7,
        el: isOptimized ? 7 : 8,
        exl: isOptimized ? 12 : 14,
      }}
      // spacing={{ base: 4, md: 6 }}
      spacingX={4}
      spacingY={6}
      width="100%"
    >
      {children}
    </SimpleGrid>
  )
}
