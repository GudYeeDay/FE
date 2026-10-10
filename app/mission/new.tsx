import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Header } from '@/components'

export default function NewMissionScreen() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <Header title="커스텀 미션 추가" />
      <View className="flex-1 items-center justify-center">
        <Text className="font-ko text-ko-14 text-ink-soft">미션 추가 화면 준비 중</Text>
      </View>
    </SafeAreaView>
  )
}
