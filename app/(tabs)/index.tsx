import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { ActiveMissionBanner } from '@/components/home/ActiveMissionBanner'
import { PastRecordCard } from '@/components/home/PastRecordCard'
import { WeekStrip } from '@/components/home/WeekStrip'
import { BellIcon } from '@/components/icons'
import { useHomeSummary } from '@/features/home/api'
import { useMissionStore } from '@/features/mission/store'
import { colors } from '@/theme'

/** Figma: 홈 */
export default function HomeScreen() {
  const router = useRouter()
  const { data, isPending } = useHomeSummary()
  const activeMission = useMissionStore((s) => s.active)

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScrollView contentContainerClassName="pb-28" showsVerticalScrollIndicator={false}>
        {/* 인사 + 기록 일수 */}
        <View className="flex-row items-start justify-between px-5 pt-3.5">
          <View>
            <Text className="font-ko text-[10px] leading-[17.6px] tracking-[-0.344px] text-ink">
              {data?.nickname ?? ''} 님의 굳이데이
            </Text>
            <Text className="font-ko-bold text-ko-20 text-[#0D0D0D]">낭만을 기록해보세요</Text>
          </View>
          <View className="items-end">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="알림"
              hitSlop={10}
              // TODO: 알림함 화면 연결
              onPress={() => {}}
            >
              <BellIcon width={16} height={16} color={colors.ink.DEFAULT} />
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
              <WeekStrip week={data.week} />
            </View>

            <View className="mt-5 px-5">
              <Text className="font-ko-bold text-[18px] leading-[28px] tracking-[0.38px] text-[#0D0D0D]">
                지난 낭만들
              </Text>
              <Text className="mt-0.5 font-en-medium text-en-12 text-[#A4A4A4]">
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
                <PastRecordCard key={record.id} record={record} />
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>

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
