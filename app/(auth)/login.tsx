import { Alert, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { SocialButton } from '@/components/auth/SocialButton'
import { AppleIcon, GoogleIcon, LogoIcon } from '@/components/icons'

/** Figma: 로그인 (로고 + 소개 문구 + Apple / Google / 이메일로 시작하기) */
export default function LoginScreen() {
  const router = useRouter()

  // TODO: 소셜 로그인 연동 (expo-apple-authentication, Google 로그인)
  const notReady = () => Alert.alert('준비 중', '소셜 로그인은 준비 중입니다.')

  return (
    <SafeAreaView className="flex-1 bg-white px-[30px]">
      {/* Figma 기준: 상태바 아래 195 에 로고, 소개 문구 아래 98 에 버튼 */}
      <View className="items-center pt-[195px]">
        <LogoIcon width={91} height={34.46} accessibilityLabel="굳이" />
        <Text className="mt-6 font-ko text-ko-14 text-ink">굳이 한 번 남겨보는 오늘의 낭만</Text>
      </View>

      <View className="mt-[98px]">
        <SocialButton
          variant="primary"
          icon={<AppleIcon width={20} height={20} />}
          onPress={notReady}
        >
          Apple로 시작하기
        </SocialButton>

        <View className="my-6 flex-row items-center gap-2">
          <View className="h-px flex-1 bg-line" />
          <Text className="font-en text-en-14 text-ink-soft">or</Text>
          <View className="h-px flex-1 bg-line" />
        </View>

        <View className="gap-3">
          <SocialButton icon={<GoogleIcon width={16} height={16} />} onPress={notReady}>
            Google로 시작하기
          </SocialButton>
          <SocialButton onPress={() => router.push('/email-login')}>이메일로 시작하기</SocialButton>
        </View>
      </View>
    </SafeAreaView>
  )
}
