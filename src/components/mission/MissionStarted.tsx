import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { CheckCircleIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'

/** Figma: 시작 확인 */
export function MissionStarted({ title, onGoHome }: { title: string; onGoHome: () => void }) {
  return (
    <SafeAreaView className="flex-1 bg-white px-[30px]">
      <View className="flex-1 items-center justify-center pb-[90px]">
        <View className="h-[98px] w-[98px] items-center justify-center">
          <CheckCircleIcon width={83.67} height={83.67} />
        </View>
        <Text className="mt-6 font-ko-bold text-ko-20 text-[#0D0D0D]">미션을 시작했어요</Text>
        <Text className="mt-2.5 font-en text-[12px] leading-[22px] tracking-[-0.43px] text-ink-soft">
          {title}
        </Text>
      </View>
      <Button className="mb-[38px]" onPress={onGoHome}>
        홈으로 가기
      </Button>
    </SafeAreaView>
  )
}
