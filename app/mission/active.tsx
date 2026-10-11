import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { Button, Header } from '@/components'
import { missionActions, useMissionStore } from '@/features/mission/store'

// TODO: Figma "진행중 미션 상세" 디자인으로 교체. 지금은 흐름 확인용으로 제목과 그만두기만 둔다.
export default function ActiveMissionScreen() {
  const router = useRouter()
  const active = useMissionStore((s) => s.active)

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="진행중인 미션" />
      <View className="flex-1 items-center justify-center gap-2 px-[30px]">
        <Text className="font-ko-medium text-ko-16 text-ink">
          {active?.title ?? '진행중인 미션이 없어요'}
        </Text>
        <Text className="font-ko text-ko-14 text-ink-soft">상세 화면 준비 중</Text>
      </View>
      {active ? (
        <View className="px-[30px] pb-6">
          <Button
            variant="neutral"
            onPress={() => {
              missionActions.quit()
              router.back()
            }}
          >
            그만두기
          </Button>
        </View>
      ) : null}
    </SafeAreaView>
  )
}
