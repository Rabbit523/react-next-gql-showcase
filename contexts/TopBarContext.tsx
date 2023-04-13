import { createContext, useState, useEffect, useMemo, useCallback, Dispatch, SetStateAction } from 'react'

const defaultNavBarHeight = 100
const defaultOneTopBarHeight = 48

interface TopBarContextApi {
  isAnnounceBarHidden: boolean
  topBarItemCount: number
  recommendedTopMarginPx: number
  setAnnounceBarHiddenTime: Dispatch<SetStateAction<number>>
  increaseTopBarWarningCount: () => void
  decreaseTopBarWarningCount: () => void
}

const TopBarContext = createContext<TopBarContextApi>({
  isAnnounceBarHidden: false,
  topBarItemCount: 0,
  recommendedTopMarginPx: defaultNavBarHeight,
  setAnnounceBarHiddenTime: () => {},
  increaseTopBarWarningCount: () => {},
  decreaseTopBarWarningCount: () => {},
})

// This context maintain 2 counters that can be used as a dependencies on other hooks to force a periodic refresh
const TopBarContextProvider = ({ children }) => {
  const [announceBarHiddenTime, setAnnounceBarHiddenTime] = useState(0)
  const [topBarWarningCount, setTopBarWarningCount] = useState(0)

  useEffect(() => {
    if (window.localStorage.getItem('announceBarHiddenTime')) {
      setAnnounceBarHiddenTime(Number(window.localStorage.getItem('announceBarHiddenTime')))
    }
  }, [])

  const isAnnounceBarHidden = useMemo(() => {
    const time = new Date().getTime()
    if (announceBarHiddenTime !== 0) {
      window.localStorage.setItem('announceBarHiddenTime', announceBarHiddenTime.toString())
      if (time - announceBarHiddenTime < 3600000) {
        return true
      }
    }
    return false
  }, [announceBarHiddenTime])

  const topBarItemCount = useMemo(() => {
    if (isAnnounceBarHidden) {
      return topBarWarningCount
    }
    return topBarWarningCount + 1
  }, [isAnnounceBarHidden, topBarWarningCount])

  const recommendedTopMarginPx = useMemo(() => {
    // TODO: we can adjust this values based on user's device size. i.e smaller value for mobile
    return defaultNavBarHeight + defaultOneTopBarHeight * topBarItemCount
  }, [topBarItemCount])

  const increaseTopBarWarningCount = useCallback(() => {
    setTopBarWarningCount((prev) => prev + 1)
  }, [])

  const decreaseTopBarWarningCount = useCallback(() => {
    setTopBarWarningCount((prev) => (prev - 1 >= 0 ? prev - 1 : 0))
  }, [])

  return (
    <TopBarContext.Provider
      value={{
        isAnnounceBarHidden,
        topBarItemCount,
        setAnnounceBarHiddenTime,
        increaseTopBarWarningCount,
        decreaseTopBarWarningCount,
        recommendedTopMarginPx,
      }}
    >
      {children}
    </TopBarContext.Provider>
  )
}

export { TopBarContext, TopBarContextProvider }
