import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { RemoteMessage } from '@/api/RemoteMessage'
import { remoteErrorText, useSignedIn } from '@/api/http'
import { Button } from '@/components'
import { ChevronLeftIcon } from '@/components/icons'
import { ConfirmDialog } from '@/features/my/AccountDialog'
import { useInProgressMission, useQuitMission } from '@/features/mission/remote'
import { colors } from '@/theme'

export function ActiveMissionScreen() {
  const router = useRouter()
  const { bottom } = useSafeAreaInsets()
  const signedIn = useSignedIn()
  const query = useInProgressMission()
  const quit = useQuitMission()
  const [ask, setAsk] = useState(false)
  const mission = query.data

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
        <Text className="font-ko-medium text-ko-14 text-ink">진행 중 미션</Text>
      </View>

      {!signedIn ? (
        <RemoteMessage text="로그인 후 볼 수 있어요" login />
      ) : query.isLoading ? (
        <RemoteMessage text="불러오는 중" />
      ) : query.isError ? (
        <RemoteMessage text={remoteErrorText(query.error)} />
      ) : !mission ? (
        <RemoteMessage text="진행 중인 미션이 없습니다." />
      ) : (
        <>
          <ScrollView contentContainerClassName="px-5 pb-8 pt-2">
            <Text className="font-ko-bold text-[18px] leading-7 text-ink">{mission.title}</Text>
            {mission.description ? (
              <Text className="mt-3 font-ko text-ko-14 leading-6 text-ink-soft">{mission.description}</Text>
            ) : null}
          </ScrollView>
          <View className="gap-2 px-5 pt-3" style={{ paddingBottom: Math.max(bottom, 16) }}>
            {quit.isError ? (
              <Text className="mb-1 text-center font-ko text-ko-12 text-main">{remoteErrorText(quit.error)}</Text>
            ) : null}
            <Button onPress={() => router.push('/record/write')}>기록하러 가기</Button>
            <Button variant="subtle" onPress={() => setAsk(true)}>
              그만두기
            </Button>
          </View>
        </>
      )}

      {ask ? (
        <ConfirmDialog
          visible
          title="미션 그만두기"
          body="진행 중인 기록이 사라지고 홈으로 돌아가요"
          confirmLabel="그만두기"
          onCancel={() => setAsk(false)}
          onConfirm={() => {
            quit.mutate(undefined, {
              onSuccess: () => {
                setAsk(false)
                router.dismissTo('/')
              },
              onError: () => setAsk(false),
            })
          }}
        />
      ) : null}
    </SafeAreaView>
  )
}
