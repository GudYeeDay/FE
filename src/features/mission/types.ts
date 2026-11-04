export type Mission = {
  /** 서버 missionId */
  id: number
  title: string
  /** 카드에 두 줄로 보이는 설명 */
  description: string
}

/** 진행 중인 미션. 기록을 남길 때 userMissionId 가 필요하다 */
export type ActiveMission = Mission & { userMissionId: number }

/**
 * 보관함 항목.
 * - saved: 저장만 한 미션, inProgress: 지금 진행 중, done: 완료한 미션
 * 남은 미션 탭에는 saved·inProgress 가 함께 보인다 (서버 REMAINING 기준)
 */
export type ArchiveStatus = 'saved' | 'inProgress' | 'done'

export type ArchiveItem = {
  bookmarkId: number
  missionId: number
  title: string
  status: ArchiveStatus
  /** "8.29" 처럼 월.일. 완료한 미션은 완료일, 나머지는 저장일 */
  date: string
}
