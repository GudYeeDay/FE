import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { ActiveMissionBanner } from '@/components/home/ActiveMissionBanner'
import { PastRecordCard } from '@/components/home/PastRecordCard'
import { WeekStrip } from '@/components/home/WeekStrip'
import { BellIcon } from '@/components/icons'
import { useHomeSummary } from '@/features/home/api'
import { useHasNewNotification } from '@/features/notification/store'
import { useMissionStore } from '@/features/mission/store'
import { colors } from '@/theme'

/** Figma: 홈 */
export default function HomeScreen() {
  const router = useRouter()
  const { data, isPending } = useHomeSummary()
  const activeMission = useMissionStore((s) => s.active)
  const hasNewNotification = useHasNewNotification()

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Figma 주석: "홈화면 스크롤 없음" */}
      <View className="flex-1">
        {/* 인사 + 기록 일수 */}
        <View className="flex-row items-start justify-between px-5 pt-3.5">
          <View>
            <Text className="font-ko text-ko-12 text-ink">
              {data?.nickname ?? ''} 님의 굳이데이
            </Text>
            <Text className="font-ko-bold text-ko-20 text-ink">낭만을 기록해보세요</Text>
          </View>
          <View className="items-end">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={hasNewNotification ? '알림, 새 알림 있음' : '알림'}
              hitSlop={10}
              onPress={() => router.push('/notifications')}
            >
              <BellIcon width={16} height={16} color={colors.ink.DEFAULT} />
              {/* Figma: 새 알림이 있으면 종 오른쪽 위 빨간 점 */}
              {hasNewNotification ? (
                <View className="absolute -right-1 -top-px h-[3px] w-[3px] rounded-full bg-main" />
              ) : null}
            </Pressable>
            <View className="mt-2.5 flex-row gap-1">
              <Text className="font-en-medium text-en-12 leading-[17.6px] text-main">
                {data?.recordDays ?? 0}
              </Text>
              <Text className="font-ko-medium text-ko-12 text-ink">일 기록</Text>
            </View>
          </View>
        </View>

        {isPending || !data ? (
          <View className="h-80 items-center justify-center">
            <ActivityIndicator color={colors.ink.faint} />
          </View>
        ) : (
          <>
            <View className="mt-4">
              {/* Figma 주석: 주별 사진·지난 낭만들 사진을 누르면 그날의 데일리 피드로 이동 */}
              <WeekStrip week={data.week} onPressDay={(r) => router.push(`/feed/${r.date}`)} />
            </View>

            <View className="mt-5 px-5">
              <Text className="font-ko-bold text-[18px] leading-[28px] tracking-[0.38px] text-ink">
                지난 낭만들
              </Text>
              <Text className="mt-0.5 font-en-medium text-en-12 text-ink-soft">
                그동안 쌓아온 기록을 다시 돌아보세요
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-[18px]"
              contentContainerClassName="gap-2 px-5"
            >
              {data.pastRecords.map((record) => (
                <PastRecordCard
                  key={record.id}
                  record={record}
                  onPress={() => router.push(`/feed/${record.date}`)}
                />
              ))}
            </ScrollView>
          </>
        )}
      </View>

      {activeMission ? (
        <View className="absolute bottom-6 w-full items-center px-5" pointerEvents="box-none">
          <ActiveMissionBanner
            mission={activeMission}
            onPress={() => router.push('/mission/active')}
          />
        </View>
      ) : null}
    </SafeAreaView>
  )
}
