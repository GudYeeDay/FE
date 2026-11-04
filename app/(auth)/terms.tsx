import { useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

import { Button, Checkbox } from '@/components'
import { FormScreen } from '@/components/auth/FormScreen'
import { ChevronRightIcon } from '@/components/icons'
import { getPendingSignup, loginErrorText, useSignup } from '@/features/auth/api'
import { colors } from '@/theme'

const TERMS = [
  { key: 'service', label: '서비스 이용약관', required: true },
  { key: 'privacy', label: '개인정보 수집·이용 동의', required: true },
  { key: 'marketing', label: '마케팅 정보 수신 동의', required: false },
] as const

type TermKey = (typeof TERMS)[number]['key']

/** Figma: 약관 동의. 필수 약관에 모두 동의해야 시작하기 활성 */
export default function TermsScreen() {
  const router = useRouter()
  const signup = useSignup()
  const [agreed, setAgreed] = useState<Record<TermKey, boolean>>({
    service: false,
    privacy: false,
    marketing: false,
  })

  const allAgreed = TERMS.every((t) => agreed[t.key])
  const requiredAgreed = TERMS.filter((t) => t.required).every((t) => agreed[t.key])

  const setAll = (value: boolean) => setAgreed({ service: value, privacy: value, marketing: value })

  return (
    <FormScreen
      title="약관 동의"
      footer={
        <Button
          disabled={!requiredAgreed || signup.isPending}
          // TODO: 마케팅 수신 동의 여부를 받는 API 가 없어 아직 보내지 않는다
          onPress={() => {
            const pending = getPendingSignup()
            // 가입 정보 없이 이 화면에 왔으면(앱 재시작 등) 회원가입부터 다시
            if (!pending) return router.replace('/signup')
            // 성공하면 토큰이 저장되면서 홈으로 바뀐다
            signup.mutate(pending, {
              onError: (error) =>
                Alert.alert('회원가입 실패', loginErrorText(error, '잠시 후 다시 시도해주세요')),
            })
          }}
        >
          시작하기
        </Button>
      }
    >
      <View className="-mt-2">
        <Text className="font-en-medium text-en-16 text-ink">
          서비스 이용을 위해 약관에 동의해주세요.
        </Text>

        <Checkbox className="mt-6" checked={allAgreed} onChange={setAll} label="전체 동의합니다." />
        <Text className="mt-2 font-ko text-ko-12 text-ink-soft">
          서비스 이용약관, 개인정보 수집·이용, 선택적 마케팅 정보 수신에 모두 동의합니다.
        </Text>

        <View className="mt-10 gap-6">
          {TERMS.map((term) => (
            <View
              key={term.key}
              className={
                term.required
                  ? 'flex-row items-center justify-between'
                  : 'mt-6 flex-row items-center justify-between'
              }
            >
              <Checkbox
                checked={agreed[term.key]}
                onChange={(v) => setAgreed((prev) => ({ ...prev, [term.key]: v }))}
                label={
                  <Text className="font-ko text-ko-16 text-ink">
                    <Text className={term.required ? 'text-main' : 'text-ink-soft'}>
                      {term.required ? '[필수]' : '[선택]'}
                    </Text>{' '}
                    {term.label}
                  </Text>
                }
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${term.label} 보기`}
                hitSlop={10}
                // TODO: 약관 상세 화면 (디자인 나오면 연결)
                onPress={() => {}}
              >
                <ChevronRightIcon width={24} height={24} color={colors.ink.faint} />
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </FormScreen>
  )
}
