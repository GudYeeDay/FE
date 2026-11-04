/** 미션을 완료하면서 남긴 기록. 데일리 피드의 한 칸 */
export type MissionRecord = {
  /** 서버 completeMissionId */
  id: number
  /** 미션 제목 */
  title: string
  body: string
  /** 비워두면 피드에 위치가 표시되지 않는다 */
  place: string
  /** YYYY-MM-DD */
  date: string
  photo: { uri: string }
}

/** 기록 작성·수정 화면에서 고른 사진. 새로 고른 사진만 업로드한다 */
export type PickedPhoto = { uri: string }

export type RecordInput = {
  body: string
  place: string
  /** 수정할 때 사진을 바꾸지 않았으면 없음 */
  photo?: PickedPhoto
}
