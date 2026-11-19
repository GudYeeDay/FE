import { Alert, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as AppleAuthentication from 'expo-apple-authentication'

import { errorText } from '@/api/http'
import { SocialButton } from '@/components/auth/SocialButton'
import { AppleIcon, GoogleIcon, LogoIcon } from '@/components/icons'
import { useAppleLogin } from '@/features/auth/api'

const HANGUL = /[가-힣]/

/** Apple 은 이름을 처음 로그인할 때만 준다. 한글 이름은 성+이름 붙여서, 그 외는 이름 성 순서 */
function appleName(fullName: AppleAuthentication.AppleAuthenticationFullName | null) {
  const given = fullName?.givenName?.trim() ?? ''
  const family = fullName?.familyName?.trim() ?? ''
  if (!given && !family) return undefined
  if (HANGUL.test(given + family)) return family + given
  return [given, family].filter(Boolean).join(' ')
}

/** Figma: 로그인 (로고 + 소개 문구 + Apple / Google / 이메일로 시작하기) */
export default function LoginScreen() {
  const router = useRouter()
  const appleLogin = useAppleLogin()

  // TODO: Google 로그인 연동 (클라이언트 ID 받으면)
  const notReady = () => Alert.alert('준비 중', 'Google 로그인은 준비 중입니다.')

  // 로그인되면 루트 레이아웃이 홈으로 보낸다
  const signInWithApple = async () => {
    if (appleLogin.isPending) return
    if (!(await AppleAuthentication.isAvailableAsync())) {
      Alert.alert('Apple 로그인을 쓸 수 없어요', 'iPhone에서 Apple로 시작하기를 이용해 주세요.')
      return
    }
    let credential: AppleAuthentication.AppleAuthenticationCredential
    try {
      credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })
    } catch (error) {
      // 사용자가 창을 닫은 경우는 조용히 넘어간다
      if ((error as { code?: string }).code === 'ERR_REQUEST_CANCELED') return
      Alert.alert('Apple 로그인에 실패했어요', '잠시 후 다시 시도해 주세요.')
      return
    }
    if (!credential.identityToken) {
      Alert.alert('Apple 로그인에 실패했어요', '잠시 후 다시 시도해 주세요.')
      return
    }
    appleLogin.mutate(
      { identityToken: credential.identityToken, name: appleName(credential.fullName) },
      { onError: (error) => Alert.alert('Apple 로그인에 실패했어요', errorText(error)) },
    )
  }

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
          onPress={signInWithApple}
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
