/** YYYY-MM-DD. 타임존 보정 없이 로컬 날짜만 쓴다. */
export function toDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey() {
  return toDateKey(new Date())
}

export function shiftDateKey(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

/** 2026-10-13 → 2026.10.13 */
export function formatDotDate(key: string) {
  return key.replace(/-/g, '.')
}

/** 월요일부터 일요일까지 YYYY-MM-DD */
export function weekDates(anchor = new Date()) {
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() - ((anchor.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return toDateKey(date)
  })
}
