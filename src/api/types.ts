export type ApiResponse<T> = {
  isSuccess: boolean
  code: string
  message: string
  result: T
  timestamp: string
}

export type MissionRecommend = {
  missionId: number
  title: string
  description: string
}

export type InProgressMission = {
  userMissionId: number
  missionId: number
  title: string
  description: string
}

export type BookmarkStatus = 'SAVED' | 'IN_PROGRESS' | 'COMPLETED'

export type BookmarkFilter = 'ALL' | 'REMAINING' | 'COMPLETED'

export type BookmarkItem = {
  bookmarkId: number
  missionId: number
  title: string
  status: BookmarkStatus
  /** M.dd */
  date: string
}

export type BookmarkList = {
  totalCount: number
  bookmarks: BookmarkItem[]
}

export type BookmarkDetail = {
  bookmarkId: number
  missionId: number
  title: string
  description: string
  savedDate: string
  custom: boolean
}

export type EmailCodeSendResponse = {
  email: string
  expiresIn: number
}

export type EmailVerificationResponse = {
  email: string
  verified: boolean
}

export type AuthSession = {
  userId: number
  name: string
  email: string
  provider: 'LOCAL' | 'GOOGLE'
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn: number
}

export type Profile = {
  name: string
  date: number
  record: number
  complete: number
  left: number
}
