export type Mission = {
  id: string
  title: string
  /** 카드에 두 줄로 보이는 설명 */
  description: string
}

/** 보관함 항목. 저장만 한 미션(saved)과 완료한 미션(done) */
export type ArchiveItem = {
  mission: Mission
  status: 'saved' | 'done'
  /** ISO 날짜 */
  savedAt: string
  doneAt?: string
}
