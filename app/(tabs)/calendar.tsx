import { useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { MonthGrid } from '@/components/calendar/MonthGrid'
import { monthsSinceSignup, useCalendar } from '@/features/calendar/api'
import { useMyProfile } from '@/features/my/api'
import { colors } from '@/theme'

/**
 * Figma: 캘린더 (화살표 버전).
 * 가입한 달부터 이번 달까지 넘길 수 있고, 처음엔 이번 달을 보여준다.
 */
export default function CalendarScreen() {
  const router = useRouter()
  const profile = useMyProfile()
  const months = useMemo(() => monthsSinceSignup(profile.data?.date ?? 1), [profile.data?.date])
  const { days, isPending } = useCalendar(profile.data ? months : [])
  /** null 이면 이번 달(목록의 마지막). 화살표를 누르면 숫자로 바뀐다 */
  const [pickedIndex, setPickedIndex] = useState<number | null>(null)

  const lastIndex = months.length - 1
  const index =
    lastIndex < 0 ? -1 : Math.min(pickedIndex === null ? lastIndex : pickedIndex, lastIndex)
  const current = index >= 0 ? months[index] : null

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="px-[22px] pt-[23px]">
        <Text className="font-ko-bold text-ko-20 text-ink">캘린더</Text>
        <Text className="mt-2 font-en text-en-14 text-ink">
          기록한 낭만 <Text className="text-main">{days.size}</Text>개
        </Text>
      </View>

      {profile.isPending || isPending || !current ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.ink.faint} />
        </View>
      ) : (
        // 6주짜리 달은 작은 화면(iPhone SE 등)에서 마지막 줄이 탭바에 가려서 스크롤로 감싼다
        <ScrollView
          className="mt-[29px] flex-1"
          contentContainerClassName="pb-6"
          showsVerticalScrollIndicator={false}
        >
          <MonthGrid
            year={current.year}
            month={current.month}
            recordsByDate={days}
            onPressDay={(day) => router.push(`/feed/${day.date}`)}
            canPrevMonth={index > 0}
            canNextMonth={index < lastIndex}
            onPrevMonth={() => setPickedIndex(Math.max(0, index - 1))}
            onNextMonth={() => setPickedIndex(Math.min(lastIndex, index + 1))}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
