import { combineReducers } from '@reduxjs/toolkit'
import multicall from 'app/lib/state/multicall'
import application from './application/reducer'
import lists from './lists/reducer'
import transactions from './transactions/reducer'
import user from './user/reducer'
// @nftmall
import profile from './profile'

const reducer = combineReducers({
  application,
  user,
  lists,
  // multicall,
  multicall: multicall.reducer,
  transactions,
  // @nftmall
  profile,
})

export default reducer
