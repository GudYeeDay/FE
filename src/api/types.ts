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
  /** 가입한 날을 1일째로 센 날수 */
  date: number
  /** 시작한 미션 수 (진행중 포함) */
  record: number
  complete: number
  /** 시작했지만 아직 완료하지 않은 미션 수 */
  left: number
}

export type WeeklyPhotoDay = {
  /** YYYY-MM-DD */
  date: string
  today: boolean
  weeklyPhotoId: number | null
  imageUrl: string | null
}

export type PastRecord = {
  completeMissionId: number
  imageUrl: string
  title: string
  /** 미션 설명 (기록 본문이 아님) */
  description: string
  date: string
  location: string | null
}

export type HomeResponse = {
  name: string
  hasUnreadNotification: boolean
  monthlyCompletedDays: number
  weeklyPhotos: { startDate: string; endDate: string; days: WeeklyPhotoDay[] }
  pastRecords: PastRecord[]
}

export type CompleteMissionResponse = {
  completeMissionId: number
  imageUrl: string
  location: string | null
  title: string
  /** YYYY-MM-DD */
  completeAt: string
  content: string | null
}

/** 서버 DTO 필드가 대문자로 시작해서 그대로 내려온다. 소문자로 고쳐질 때를 대비해 둘 다 받는다 */
export type CalendarRecordResponse = {
  CompleteMissionId?: number
  CompleteDate?: string
  ImageUrl?: string
  completeMissionId?: number
  completeDate?: string
  imageUrl?: string
}

export type CalendarResponse = {
  counts: number
  calenderRecordResponseList: CalendarRecordResponse[]
}

export type NotificationResponse = {
  notificationId: number
  type: string
  title: string
  content: string
  read: boolean
  /** ISO date-time */
  createdAt: string
}
