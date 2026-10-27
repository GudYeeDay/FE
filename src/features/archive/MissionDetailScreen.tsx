import { Pressable, ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { RemoteMessage } from '@/api/RemoteMessage'
import { remoteErrorText, useSignedIn } from '@/api/http'
import { Button } from '@/components'
import { ChevronLeftIcon } from '@/components/icons'
import { useBookmark, useStartBookmark } from '@/features/archive/api'
import { useBookmarkEdits } from '@/features/archive/edits'
import { colors } from '@/theme'

/** 8.29 또는 2026-08-29 → 8. 29 */
function formatSpacedDate(key: string) {
  const parts = key.split(/[-.]/).filter(Boolean)
  const day = parts.at(-1)
  const month = parts.at(-2)
  if (!month || !day) return key
  return `${Number(month)}. ${Number(day)}`
}

export function MissionDetailScreen() {
  const router = useRouter()
  const { bottom } = useSafeAreaInsets()
  const { id, status } = useLocalSearchParams<{ id: string; status?: string }>()
  const query = useBookmark(id)
  const edits = useBookmarkEdits()
  const signedIn = useSignedIn()
  const start = useStartBookmark()
  const mission = query.data
    ? {
        ...query.data,
        title: (id && edits[id]?.title) || query.data.title,
        description: (id && edits[id]?.description) || query.data.description,
      }
    : undefined
  const saved = status !== 'COMPLETED'

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
        <Text className="font-ko-medium text-ko-14 text-ink">
          {saved ? '저장 미션' : '완료 미션'}
        </Text>
      </View>

      {mission ? (
        <>
          <ScrollView contentContainerClassName="px-5 pb-8 pt-2">
            <View className="flex-row items-center rounded-lg border border-line px-3 py-3">
              <View className="mr-2 h-4 w-[3px] rounded-full bg-main" />
              <Text className="font-ko text-ko-14 text-ink">
                {formatSpacedDate(mission.savedDate)}에 완료함
              </Text>
            </View>

            <Text className="mt-7 font-ko-bold text-[18px] leading-7 text-ink">{mission.title}</Text>
            {mission.description ? (
              <Text className="mt-3 font-ko text-ko-14 leading-6 text-ink-soft">{mission.description}</Text>
            ) : null}
          </ScrollView>

          {saved ? (
            <View className="px-5 pt-3" style={{ paddingBottom: Math.max(bottom, 16) }}>
              {start.isError ? (
                <Text className="mb-3 text-center font-ko text-ko-12 text-main">
                  {remoteErrorText(start.error)}
                </Text>
              ) : null}
              <Button
                disabled={start.isPending}
                onPress={() => {
                  start.mutate(mission.bookmarkId, { onSuccess: () => router.replace('/mission/started') })
                }}
              >
                이 미션으로 시작하기
              </Button>
            </View>
          ) : null}
        </>
      ) : !signedIn ? (
        <RemoteMessage text="로그인 후 볼 수 있어요" login />
      ) : query.isLoading ? (
        <RemoteMessage text="불러오는 중" />
      ) : (
        <RemoteMessage text={query.isError ? remoteErrorText(query.error) : '미션을 찾을 수 없습니다.'} />
      )}
    </SafeAreaView>
  )
}
