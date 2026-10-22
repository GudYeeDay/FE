import { useMemo, useRef } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { MonthGrid } from '@/components/calendar/MonthGrid'
import { useCalendar } from '@/features/calendar/api'
import { colors } from '@/theme'

/** Figma: 캘린더. 첫 기록이 있는 달부터 이번 달까지 이어서 보여주고, 처음엔 이번 달이 보이게 맨 아래로 내린다. */
export default function CalendarScreen() {
  const router = useRouter()
  const { data, isPending } = useCalendar()
  const scrollRef = useRef<ScrollView>(null)

  const recordsByDate = useMemo(() => new Map(data?.records.map((r) => [r.date, r])), [data])

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="px-[22px] pt-[23px]">
        <Text className="font-ko-bold text-ko-20 text-ink">캘린더</Text>
        <Text className="mt-2 font-en text-en-14 text-ink">
          기록한 낭만 {data?.records.length ?? 0}개
        </Text>
      </View>

      {isPending || !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.ink.faint} />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          className="mt-[29px]"
          contentContainerClassName="gap-14 pb-28"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {data.months.map(({ year, month }, i) => (
            <MonthGrid
              key={`${year}-${month}`}
              year={year}
              month={month}
              showYear={i === 0 || month === 1}
              recordsByDate={recordsByDate}
              onPressDay={(record) => router.push(`/feed/${record.date}`)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
