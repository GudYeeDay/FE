import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

import { PlusIcon } from '@/components/icons'
import type { WeekDay } from '@/features/home/api'
import { cn } from '@/lib/cn'
import { colors } from '@/theme'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const TILE_WIDTH = 90
const TILE_HEIGHT = 120
const TILE_GAP = 4

/** "2026-11-02" → [11, 2] */
function monthDay(iso: string) {
  const [, m, d] = iso.split('-').map(Number)
  return [m, d] as const
}

/** "2026-11-02" → "Nov 2" */
function formatDay(iso: string) {
  const [m, d] = monthDay(iso)
  return `${MONTHS[m - 1]} ${d}`
}

/** 기기 시간 기준 오늘 (YYYY-MM-DD) */
function todayIso() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/**
 * Figma: 홈 이번 주 띠(Field 1·2·3). 월~일 7칸, 칸 90x120 간격 4, 양 끝만 둥글게.
 * - 사진 있는 날: 사진 + 아래로 어두워지는 그라데이션 + 흰 요일
 * - 사진 없는 오늘: 회색 칸 가운데 + (누르면 미션 시작)
 * - 사진 없는 나머지 날: 회색 칸에 월 / 일 / 요일
 */
export function WeekStrip({
  week,
  onPressDay,
  onPressAdd,
}: {
  week: WeekDay[]
  /** 사진이 있는 날을 누르면 (그날의 데일리 피드) */
  onPressDay?: (date: string) => void
  /** 오늘 칸의 + 를 누르면 */
  onPressAdd?: () => void
}) {
  const first = week[0]?.date
  const last = week[week.length - 1]?.date
  const today = todayIso()

  return (
    <View>
      {first && last ? (
        <Text className="px-5 font-en-medium text-en-12 text-ink-soft">
          {formatDay(first)} - {formatDay(last)}
        </Text>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-[13px]"
        contentContainerClassName="px-5"
        contentContainerStyle={{ gap: TILE_GAP }}
      >
        {week.map((day, i) => {
          const label = DAY_LABELS[i]
          const isToday = day.date === today
          const tileClass = cn(
            'overflow-hidden',
            i === 0 && 'rounded-l-2xl',
            i === week.length - 1 && 'rounded-r-2xl',
          )
          const size = { width: TILE_WIDTH, height: TILE_HEIGHT }

          if (day.photo) {
            return (
              <Pressable
                key={day.date}
                accessibilityRole="button"
                accessibilityLabel={`${label}, 기록 보기`}
                disabled={!onPressDay}
                onPress={() => onPressDay?.(day.date)}
                className={tileClass}
                style={size}
              >
                <Image
                  source={day.photo}
                  className="absolute inset-0 h-full w-full"
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['rgba(130,130,121,0)', 'rgba(28,28,26,0.4)']}
                  style={{ position: 'absolute', inset: 0 }}
                />
                <Text className="absolute bottom-[8px] w-full text-center font-en-medium text-en-14 text-white">
                  {label}
                </Text>
              </Pressable>
            )
          }

          if (isToday) {
            return (
              <Pressable
                key={day.date}
                accessibilityRole="button"
                accessibilityLabel={`${label}, 오늘 미션 시작하기`}
                disabled={!onPressAdd}
                onPress={onPressAdd}
                className={cn(tileClass, 'items-center justify-center bg-empty active:opacity-80')}
                style={size}
              >
                <PlusIcon width={24} height={24} color={colors.ink.DEFAULT} />
              </Pressable>
            )
          }

          const [m, d] = monthDay(day.date)
          return (
            <View
              key={day.date}
              accessible
              accessibilityLabel={`${MONTHS[m - 1]} ${d} ${label}, 기록 없음`}
              className={cn(tileClass, 'items-center justify-center bg-empty')}
              style={size}
            >
              <Text className="font-en-medium text-en-14 text-empty-text">{MONTHS[m - 1]}</Text>
              <Text className="mt-0.5 font-en-extrabold text-num-24 text-empty-text">{d}</Text>
              <Text className="mt-0.5 font-en-medium text-en-14 text-empty-text">{label}</Text>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}
