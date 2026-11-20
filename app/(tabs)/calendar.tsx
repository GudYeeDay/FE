import { useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { remoteErrorText } from '@/api/http'
import { MonthGrid } from '@/components/calendar/MonthGrid'
import { monthsSinceSignup, useCalendar } from '@/features/calendar/api'
import { useMyProfile } from '@/features/my/api'
import { colors } from '@/theme'

/**
 * Figma: 캘린더 (화살표 버전).
 * 가입한 달부터 이번 달까지 넘길 수 있고, 처음엔 이번 달을 보여준다.
 * 전체 기록 수 때문에 모든 달을 불러오지만, 화면은 보고 있는 달만 기다린다.
 */
export default function CalendarScreen() {
  const router = useRouter()
  const profile = useMyProfile()
  const months = useMemo(() => monthsSinceSignup(profile.data?.date ?? 1), [profile.data?.date])
  const { days, statuses, isComplete } = useCalendar(profile.data ? months : [])
  /** null 이면 이번 달(목록의 마지막). 화살표를 누르면 숫자로 바뀐다 */
  const [pickedIndex, setPickedIndex] = useState<number | null>(null)

  const lastIndex = months.length - 1
  const index =
    lastIndex < 0 ? -1 : Math.min(pickedIndex === null ? lastIndex : pickedIndex, lastIndex)
  const current = index >= 0 ? months[index] : null
  const currentStatus = index >= 0 ? statuses[index] : undefined

  // 프로필(가입일)이 없으면 어느 달까지 보여줄지 모르므로 프로필 오류를 먼저 본다
  const failed = profile.isError
    ? { error: profile.error, retry: () => profile.refetch() }
    : currentStatus?.isError
      ? { error: currentStatus.error, retry: () => currentStatus.refetch() }
      : null
  // 프로필이 비어 오면 달 데이터를 부르지 않으므로(useCalendar([])) 빈 달을 그대로 보여준다
  const loading =
    profile.isPending || !current || (!!profile.data && (!currentStatus || currentStatus.isPending))

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="px-[22px] pt-[23px]">
        <Text className="font-ko-bold text-ko-20 text-ink">캘린더</Text>
        {/* 일부 달만 받은 상태에서 숫자가 늘어나 보이지 않게, 다 받은 뒤에 보여준다 */}
        <Text className="mt-2 font-en text-en-14 text-ink">
          기록한 낭만 <Text className="text-main">{isComplete ? days.size : ' '}</Text>개
        </Text>
      </View>

      {failed ? (
        <Pressable
          accessibilityRole="button"
          onPress={failed.retry}
          className="flex-1 items-center justify-center"
        >
          <Text className="font-ko text-ko-14 text-ink-soft">{remoteErrorText(failed.error)}</Text>
          <Text className="mt-2 font-ko text-ko-12 text-ink-faint">눌러서 다시 불러오기</Text>
        </Pressable>
      ) : loading || !current ? (
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
