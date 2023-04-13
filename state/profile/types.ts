import { User } from "@prisma/client";

export interface ProfileState {
  hasError: boolean
  isInitialized: boolean
  isLoading: boolean
  data: User
}

export interface State {
  profile: ProfileState
}