import { Image, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

import type { DayRecord } from '@/features/home/api'
import { cn } from '@/lib/cn'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const TILE_WIDTH = 94
const TILE_HEIGHT = 120

const formatDay = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`

/** Figma: Component 8. 이번 주 월~일 기록 사진 띠. 기록 없는 날은 빈 칸. */
export function WeekStrip({ week }: { week: DayRecord[] }) {
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
          <View
            key={day.date.toISOString()}
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
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
