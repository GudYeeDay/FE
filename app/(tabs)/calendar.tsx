import { useMemo, useRef } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { MonthGrid } from '@/components/calendar/MonthGrid'
import { monthsSinceSignup, useCalendar } from '@/features/calendar/api'
import { useMyProfile } from '@/features/my/api'
import { colors } from '@/theme'

/**
 * Figma: 캘린더. 가입한 달부터 이번 달까지 이어서 보여주고, 처음엔 이번 달이 보이게 맨 아래로 내린다.
 * 시작 달은 기획 확정 전이라 가입한 달로 둔다 (프로필의 가입 일수로 계산)
 */
export default function CalendarScreen() {
  const router = useRouter()
  const profile = useMyProfile()
  const months = useMemo(() => monthsSinceSignup(profile.data?.date ?? 1), [profile.data?.date])
  const { days, isPending } = useCalendar(profile.data ? months : [])
  const scrollRef = useRef<ScrollView>(null)

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="px-[22px] pt-[23px]">
        <Text className="font-ko-bold text-ko-20 text-ink">캘린더</Text>
        <Text className="mt-2 font-en text-en-14 text-ink">기록한 낭만 {days.size}개</Text>
      </View>

      {profile.isPending || isPending ? (
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
          {months.map(({ year, month }, i) => (
            <MonthGrid
              key={`${year}-${month}`}
              year={year}
              month={month}
              showYear={i === 0 || month === 1}
              recordsByDate={days}
              onPressDay={(day) => router.push(`/feed/${day.date}`)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
