import { useContext } from 'react'
import { TopBarContext } from '../../contexts/TopBarContext'

const useTopBar = () => {
  const topBarContext = useContext(TopBarContext)

  if (topBarContext === undefined) {
    throw new Error('TopBar context undefined')
  }

  return topBarContext
}

export default useTopBar
