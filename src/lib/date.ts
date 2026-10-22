const pad = (n: number) => String(n).padStart(2, '0')

/** 기기 시간대 기준 'YYYY-MM-DD' (toISOString 은 UTC 라 한국 오전 9시 전에는 하루 전 날짜가 된다) */
export function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const todayISO = () => toISODate(new Date())

/** "2026-09-14" → "2026.09.14" (피드·카드의 날짜) */
export function formatDotDate(iso: string) {
  return iso.replaceAll('-', '.')
}

/** "2026-09-14" → "2026. 09. 14" (기록 작성 화면의 날짜) */
export function formatSpacedDate(iso: string) {
  return iso.replaceAll('-', '. ')
}
