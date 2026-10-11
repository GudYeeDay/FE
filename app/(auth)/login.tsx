import { Alert, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { Button } from '@/components'

/** Figma: 로그인 */
export default function LoginScreen() {
  const router = useRouter()

  // TODO: 소셜 로그인 연동 (expo-apple-authentication, Google 로그인)
  const notReady = () => Alert.alert('준비 중', '소셜 로그인은 준비 중입니다.')

  return (
    <SafeAreaView className="flex-1 bg-white px-[30px]">
      <View className="flex-1 items-center justify-end gap-1 pb-[52px]">
        <Text className="font-ko-bold text-ko-20 text-[#0D0D0D]">굳이</Text>
        <Text className="font-en text-en-14 text-ink-soft">오늘의 낭만을 기록해 보세요</Text>
      </View>

      <View className="flex-1">
        <Button variant="neutral" onPress={notReady}>
          Apple로 시작하기
        </Button>

        <View className="my-[19px] flex-row items-center gap-[18px] px-[18px]">
          <View className="h-px flex-1 bg-line" />
          <Text className="font-en-medium text-en-12 text-ink">or</Text>
          <View className="h-px flex-1 bg-line" />
        </View>

        <View className="gap-[7px]">
          <Button variant="subtle" onPress={notReady}>
            Google로 시작하기
          </Button>
          <Button variant="subtle" onPress={() => router.push('/email-login')}>
            이메일로 시작하기
          </Button>
        </View>
      </View>
    </SafeAreaView>
  )
}
