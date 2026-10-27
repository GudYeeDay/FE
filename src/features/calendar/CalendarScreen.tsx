import { useMemo } from 'react'
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native'
import { useRouter, type Href } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import RecordThumb from '../../../assets/images/record-thumb.svg'
import { toDateKey } from '@/features/mission/date'
import { useMissions, type FeedPost } from '@/features/mission/local'
import { useMyProfile } from '@/features/my/api'

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']
const WEEK_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** 날짜 칸 비율. 참고 셀 88×118 */
const CELL_W = 88
const CELL_H = 118
const COL_GAP = 5
const ROW_GAP = 13
const H_PAD = 20
const EMPTY_BG = '#F1F1F1'
const EMPTY_TEXT = '#A2A2A2'

export function CalendarScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const { feeds } = useMissions()
  const profile = useMyProfile()
  const cellW = Math.floor((width - H_PAD * 2 - COL_GAP * 6) / 7)
  const cellH = Math.round((cellW * CELL_H) / CELL_W)
  const start = useMemo(() => signupMonth(profile.data?.date), [profile.data?.date])
  const startKey = toDateKey(start)

  const visibleFeeds = useMemo(
    () => feeds.filter((feed) => feed.date >= startKey),
    [feeds, startKey],
  )

  const byDate = useMemo(() => {
    const map = new Map<string, FeedPost>()
    for (const feed of visibleFeeds) {
      if (!map.has(feed.date)) map.set(feed.date, feed)
    }
    return map
  }, [visibleFeeds])

  const months = useMemo(() => monthsFrom(start), [start])

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScrollView
        className="min-h-0 flex-1"
        contentContainerClassName="px-5 pb-10 pt-3"
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-ko-bold text-[22px] leading-8 text-ink">캘린더</Text>
        <Text className="mt-2 font-ko text-ko-14 text-ink">
          기록한 낭만 <Text className="text-main">{visibleFeeds.length}개</Text>
        </Text>

        {months.map((month) => (
          <MonthBlock
            key={`${month.year}-${month.month}`}
            year={month.year}
            month={month.month}
            cellW={cellW}
            cellH={cellH}
            byDate={byDate}
            onOpen={(date) => router.push(`/feed/day/${date}` as Href)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

function MonthBlock({
  year,
  month,
  cellW,
  cellH,
  byDate,
  onOpen,
}: {
  year: number
  month: number
  cellW: number
  cellH: number
  byDate: Map<string, FeedPost>
  onOpen: (date: string) => void
}) {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7
  const count = new Date(year, month + 1, 0).getDate()

  return (
    <View className="mt-8">
      <Text className="font-ko-bold text-[22px] leading-8 text-ink">{monthTitle(year, month)}</Text>
      <View className="mt-4 flex-row" style={{ columnGap: COL_GAP }}>
        {WEEKDAYS.map((label) => (
          <Text
            key={label}
            className="text-center font-ko text-ko-12 text-ink-soft"
            style={{ width: cellW }}
          >
            {label}
          </Text>
        ))}
      </View>
      <View className="mt-2 flex-row flex-wrap" style={{ columnGap: COL_GAP, rowGap: ROW_GAP }}>
        {Array.from({ length: lead }, (_, index) => (
          <View key={`lead-${index}`} style={{ width: cellW, height: cellH }} />
        ))}
        {Array.from({ length: count }, (_, index) => {
          const day = index + 1
          const key = dateKey(year, month, day)
          const feed = byDate.get(key)
          return (
            <DayCell
              key={key}
              year={year}
              month={month}
              day={day}
              cellW={cellW}
              cellH={cellH}
              feed={feed}
              onOpen={feed ? () => onOpen(key) : undefined}
            />
          )
        })}
      </View>
    </View>
  )
}

function DayCell({
  year,
  month,
  day,
  cellW,
  cellH,
  feed,
  onOpen,
}: {
  year: number
  month: number
  day: number
  cellW: number
  cellH: number
  feed?: FeedPost
  onOpen?: () => void
}) {
  const radius = Math.round((cellW * 10) / CELL_W)
  const frame = { width: cellW, height: cellH, borderRadius: radius }

  if (!feed) {
    const labelSize = Math.max(8, Math.round(cellH * 0.15))
    const daySize = Math.max(12, Math.round(cellH * 0.24))
    const week = WEEK_SHORT[new Date(year, month, day).getDay()]

    return (
      <View className="items-center justify-center" style={{ ...frame, backgroundColor: EMPTY_BG }}>
        <Text className="font-en" style={{ color: EMPTY_TEXT, fontSize: labelSize, lineHeight: labelSize + 2 }}>
          {MONTHS[month].slice(0, 3)}
        </Text>
        <Text
          className="font-en-medium"
          style={{ color: EMPTY_TEXT, fontSize: daySize, lineHeight: daySize + 2 }}
        >
          {day}
        </Text>
        <Text className="font-en" style={{ color: EMPTY_TEXT, fontSize: labelSize, lineHeight: labelSize + 2 }}>
          {week}
        </Text>
      </View>
    )
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${day}일 ${feed.title}`}
      className="overflow-hidden"
      style={frame}
      onPress={onOpen}
    >
      {feed.photoUri ? (
        <Image source={{ uri: feed.photoUri }} style={{ width: cellW, height: cellH }} resizeMode="cover" />
      ) : (
        <RecordThumb width={cellW} height={cellH} preserveAspectRatio="xMidYMid slice" />
      )}
      <Text
        className="absolute bottom-1 right-1.5 font-en-medium text-[11px] text-white"
        style={{ textShadowColor: 'rgba(0,0,0,0.45)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}
      >
        {day}
      </Text>
    </Pressable>
  )
}

/** 모든 달에 년도를 붙인다. 예: 2026 • October */
function monthTitle(year: number, month: number) {
  return `${year} • ${MONTHS[month]}`
}

function dateKey(year: number, month: number, day: number) {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

/** 프로필 date 는 가입 후 며칠째. 그 달이 캘린더의 시작이다. */
function signupMonth(memberDays: number | undefined) {
  const today = new Date()
  const current = new Date(today.getFullYear(), today.getMonth(), 1)
  if (!memberDays || memberDays <= 0 || memberDays >= 20000) return current
  const joined = new Date(today)
  joined.setDate(today.getDate() - (memberDays - 1))
  const start = new Date(joined.getFullYear(), joined.getMonth(), 1)
  return start > current ? current : start
}

/** 가입한 달부터 이번 달까지 */
function monthsFrom(start: Date) {
  const months: { year: number; month: number }[] = []
  const end = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cursor <= end) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return months
}
