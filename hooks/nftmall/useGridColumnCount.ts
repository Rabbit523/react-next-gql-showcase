import { useEffect, useState } from 'react'
import { useWindowSize } from '../useWindowSize'

export default function useGridColumnCount(isOpen = false) {
  const [count, setCount] = useState(0)
  const size = useWindowSize()

  useEffect(() => {
    let columns = 0
    if (size.width) {
      if (size.width >= 3400) {
        columns = isOpen ? 10 : 11
      } else if (size.width >= 2560) {
        columns = isOpen ? 7 : 8
      } else if (size.width >= 1920) {
        columns = isOpen ? 5 : 6
      } else if (size.width >= 1440) {
        columns = isOpen ? 4 : 5
      } else if (size.width >= 1280) {
        columns = isOpen ? 3 : 4
      } else if (size.width >= 1024) {
        columns = isOpen ? 2 : 3
      } else if (size.width >= 768) {
        columns = isOpen ? 1 : 2
      } else {
        columns = 1
      }
    }
    setCount(columns)
  }, [isOpen, size.width])

  return count
}
