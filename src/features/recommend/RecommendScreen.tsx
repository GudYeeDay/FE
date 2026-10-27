import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { RemoteMessage } from '@/api/RemoteMessage'
import { remoteErrorText, useSignedIn } from '@/api/http'
import { Button } from '@/components'
import { ChevronLeftIcon } from '@/components/icons'
import { useBookmarkMission, useRecommendations, useStartRecommendedMission } from '@/features/recommend/api'
import { colors } from '@/theme'

export function RecommendScreen() {
  const router = useRouter()
  const signedIn = useSignedIn()
  const query = useRecommendations()
  const save = useBookmarkMission()
  const start = useStartRecommendedMission()
  const [savedIds, setSavedIds] = useState<number[]>([])
  const [message, setMessage] = useState<string | null>(null)

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="h-14 items-center justify-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={12}
          className="absolute left-4"
          onPress={() => router.back()}
        >
          <ChevronLeftIcon width={24} height={24} color={colors.ink.DEFAULT} />
        </Pressable>
        <Text className="font-ko-medium text-ko-14 text-ink">미션 추천</Text>
      </View>

      {!signedIn ? (
        <RemoteMessage text="로그인 후 볼 수 있어요" login />
      ) : query.isLoading ? (
        <RemoteMessage text="불러오는 중" />
      ) : query.isError ? (
        <RemoteMessage text={remoteErrorText(query.error)} login />
      ) : (
        <ScrollView className="min-h-0 flex-1" contentContainerClassName="px-5 pb-10">
          <Pressable
            accessibilityRole="button"
            className="self-end py-2"
            onPress={() => {
              setMessage(null)
              void query.refetch()
            }}
          >
            <Text className="font-ko-medium text-ko-14 text-main">다시 추천 받기</Text>
          </Pressable>
          {message ? <Text className="mb-3 font-ko text-ko-12 text-main">{message}</Text> : null}
          <View className="gap-3">
            {(query.data ?? []).map((mission) => {
              const saved = savedIds.includes(mission.missionId)
              return (
                <View key={mission.missionId} className="rounded-2xl border border-line px-4 py-4">
                  <Text className="font-ko-bold text-ko-16 text-ink">{mission.title}</Text>
                  {mission.description ? (
                    <Text className="mt-2 font-ko text-ko-14 leading-6 text-ink-soft">{mission.description}</Text>
                  ) : null}
                  <View className="mt-4 gap-2">
                    <Button
                      variant="subtle"
                      disabled={saved || save.isPending}
                      onPress={() => {
                        setMessage(null)
                        save.mutate(mission.missionId, {
                          onSuccess: () => setSavedIds((prev) => [...prev, mission.missionId]),
                          onError: (error) => setMessage(remoteErrorText(error)),
                        })
                      }}
                    >
                      {saved ? '저장됨' : '보관함에 저장'}
                    </Button>
                    <Button
                      disabled={start.isPending}
                      onPress={() => {
                        setMessage(null)
                        start.mutate(mission.missionId, {
                          onSuccess: () => router.replace('/mission/started'),
                          onError: (error) => setMessage(remoteErrorText(error)),
                        })
                      }}
                    >
                      이 미션으로 시작하기
                    </Button>
                  </View>
                </View>
              )
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
