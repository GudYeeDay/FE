import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components'

/** 미션 시작 확인. 홈으로 가기만 제공한다 */
export function StartConfirmScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-white px-8">
      <View className="flex-1 items-center justify-center">
        <Text className="text-center font-ko-bold text-[22px] leading-8 text-ink">미션을 시작했어요</Text>
        <Text className="mt-3 text-center font-ko text-ko-14 leading-6 text-ink-soft">
          진행 중 미션에서 기록을 남길 수 있어요
        </Text>
      </View>
      <View className="pb-8">
        <Button onPress={() => router.dismissTo('/')}>홈으로 가기</Button>
      </View>
    </SafeAreaView>
  )
}
