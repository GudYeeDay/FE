import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

/** 화면 구현 전 임시 자리. 실제 화면 작업 시 교체 */
export function ScreenPlaceholder({ title }: { title: string }) {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="font-ko text-ko-14 text-ink-soft">{title} 화면 준비 중</Text>
      </View>
    </SafeAreaView>
  )
}
