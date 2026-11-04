import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

import type { WeekDay } from '@/features/home/api'
import { cn } from '@/lib/cn'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const TILE_WIDTH = 94
const TILE_HEIGHT = 120

/** "2026-11-02" → "Nov 2" */
function formatDay(iso: string) {
  const [, m, d] = iso.split('-').map(Number)
  return `${MONTHS[m - 1]} ${d}`
}

/** Figma: Component 8. 이번 주 월~일 사진 띠. 사진 없는 날은 빈 칸. */
export function WeekStrip({
  week,
  onPressDay,
}: {
  week: WeekDay[]
  /** 사진이 있는 날을 누르면 (그날의 데일리 피드) */
  onPressDay?: (date: string) => void
}) {
  const first = week[0]?.date
  const last = week[week.length - 1]?.date

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
      >
        {week.map((day, i) => (
          <Pressable
            key={day.date}
            accessibilityRole={day.photo ? 'button' : undefined}
            accessibilityLabel={`${DAY_LABELS[i]}${day.photo ? ', 기록 있음' : ''}`}
            disabled={!day.photo || !onPressDay}
            onPress={() => onPressDay?.(day.date)}
            className={cn(
              'overflow-hidden bg-bg',
              i === 0 && 'rounded-l-2xl',
              i === week.length - 1 && 'rounded-r-2xl',
            )}
            style={{ width: TILE_WIDTH, height: TILE_HEIGHT }}
          >
            {day.photo ? (
              <Image
                source={day.photo}
                className="absolute inset-0 h-full w-full"
                resizeMode="cover"
              />
            ) : null}
            <LinearGradient
              colors={['rgba(130,130,121,0)', 'rgba(28,28,26,0.4)']}
              style={{ position: 'absolute', inset: 0 }}
            />
            <Text
              className={cn(
                'absolute bottom-[9px] w-full text-center font-en-medium text-en-14',
                day.photo ? 'text-white' : 'text-ink-faint',
              )}
            >
              {DAY_LABELS[i]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}
