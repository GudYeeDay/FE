import type { ImageSourcePropType } from 'react-native'

/** 미션을 완료하면서 남긴 기록. 데일리 피드의 한 칸 */
export type MissionRecord = {
  id: string
  missionId: string
  /** 미션 제목 (기록 당시 값을 그대로 둔다) */
  title: string
  body: string
  /** 비워두면 피드에 위치가 표시되지 않는다 */
  place: string
  /** YYYY-MM-DD */
  date: string
  photo: ImageSourcePropType
  createdAt: number
}

export type RecordInput = Pick<MissionRecord, 'body' | 'place' | 'photo'>
