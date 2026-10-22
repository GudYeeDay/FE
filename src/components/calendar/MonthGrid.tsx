import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

import type { MissionRecord } from '@/features/record/types'
import { cn } from '@/lib/cn'

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']
const MONTH_NAMES = [
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
const SIDE_PADDING = 20
const COLUMN_GAP = 4.4
const ROW_GAP = 15.3

type Props = {
  year: number
  /** 1~12 */
  month: number
  /** 해의 첫 달이거나 목록의 첫 달이면 "2026 • September" 처럼 연도를 붙인다 */
  showYear: boolean
  /** 'YYYY-MM-DD' → 기록 */
  recordsByDate: Map<string, MissionRecord>
  onPressDay?: (record: MissionRecord) => void
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Figma: 캘린더의 한 달. 월요일 시작 7칸, 기록이 있는 날은 사진. */
export function MonthGrid({ year, month, showYear, recordsByDate, onPressDay }: Props) {
  const { width } = useWindowDimensions()
  const tileWidth = (width - SIDE_PADDING * 2 - COLUMN_GAP * 6) / 7
  const tileHeight = tileWidth * (58.67 / 44)

  const daysInMonth = new Date(year, month, 0).getDate()
  const leadingBlanks = (new Date(year, month - 1, 1).getDay() + 6) % 7 // 월=0
  const cells: (number | null)[] = [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))

  return (
    <View className="px-5">
      <Text className="font-en-medium text-[20px] leading-[24px] text-ink">
        {showYear ? `${year} • ${MONTH_NAMES[month - 1]}` : MONTH_NAMES[month - 1]}
      </Text>

      <View className="mt-[30px] flex-row" style={{ gap: COLUMN_GAP }}>
        {WEEKDAYS.map((d) => (
          <Text
            key={d}
            className="text-center font-en-medium text-[10px] text-ink-soft"
            style={{ width: tileWidth }}
          >
            {d}
          </Text>
        ))}
      </View>

      <View className="mt-3" style={{ gap: ROW_GAP }}>
        {weeks.map((week, wi) => (
          <View key={wi} className="flex-row" style={{ gap: COLUMN_GAP }}>
            {week.map((day, di) => {
              if (day === null)
                return <View key={di} style={{ width: tileWidth, height: tileHeight }} />
              const record = recordsByDate.get(`${year}-${pad(month)}-${pad(day)}`)
              return (
                <Pressable
                  key={di}
                  accessibilityRole={record ? 'button' : undefined}
                  accessibilityLabel={`${month}월 ${day}일${record ? ', 기록 있음' : ''}`}
                  disabled={!record || !onPressDay}
                  onPress={() => record && onPressDay?.(record)}
                  className={cn('overflow-hidden rounded-lg', !record && 'border border-line')}
                  style={{ width: tileWidth, height: tileHeight }}
                >
                  {record ? (
                    <>
                      <Image
                        source={record.photo}
                        className="absolute inset-0 h-full w-full"
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={['rgba(130,130,121,0)', 'rgba(28,28,26,0.4)']}
                        style={{ position: 'absolute', inset: 0 }}
                      />
                    </>
                  ) : null}
                  <Text
                    className={cn(
                      'absolute bottom-1 w-full text-center font-en-medium text-[8px]',
                      record ? 'text-white' : 'text-ink-faint',
                    )}
                  >
                    {day}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        ))}
      </View>
    </View>
  )
}
