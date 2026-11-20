import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons'
import type { CalendarDay } from '@/features/calendar/api'
import { cn } from '@/lib/cn'
import { colors } from '@/theme'

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
  /** 'YYYY-MM-DD' → 그날 사진 */
  recordsByDate: Map<string, CalendarDay>
  onPressDay?: (day: CalendarDay) => void
  /** 있으면 달 제목 오른쪽에 이전/다음 화살표를 보여준다 */
  onPrevMonth?: () => void
  onNextMonth?: () => void
  canPrevMonth?: boolean
  canNextMonth?: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Figma: 캘린더의 한 달. 월요일 시작 7칸, 기록이 있는 날은 사진. */
export function MonthGrid({
  year,
  month,
  recordsByDate,
  onPressDay,
  onPrevMonth,
  onNextMonth,
  canPrevMonth = false,
  canNextMonth = false,
}: Props) {
  const { width } = useWindowDimensions()
  const tileWidth = (width - SIDE_PADDING * 2 - COLUMN_GAP * 6) / 7
  const tileHeight = tileWidth * (58.67 / 44)
  const showNav = !!(onPrevMonth || onNextMonth)

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
      <View className="flex-row items-center justify-between">
        <Text className="font-en-medium text-[20px] leading-[24px] text-ink">
          {year} • {MONTH_NAMES[month - 1]}
        </Text>
        {showNav ? (
          <View className="flex-row items-center gap-1">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이전 달"
              disabled={!canPrevMonth}
              hitSlop={8}
              onPress={onPrevMonth}
              className={cn('p-1', !canPrevMonth && 'opacity-30')}
            >
              <ChevronLeftIcon width={24} height={24} color={colors.ink.DEFAULT} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="다음 달"
              disabled={!canNextMonth}
              hitSlop={8}
              onPress={onNextMonth}
              className={cn('p-1', !canNextMonth && 'opacity-30')}
            >
              <ChevronRightIcon width={24} height={24} color={colors.ink.DEFAULT} />
            </Pressable>
          </View>
        ) : null}
      </View>

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
