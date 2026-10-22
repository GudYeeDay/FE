import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { Button, Checkbox } from '@/components'
import { FormScreen } from '@/components/auth/FormScreen'
import { ChevronRightIcon } from '@/components/icons'
import { useSession } from '@/features/auth/session'
import { colors } from '@/theme'

const TERMS = [
  { key: 'service', label: '서비스 이용약관', required: true },
  { key: 'privacy', label: '개인정보 수집·이용 동의', required: true },
  { key: 'marketing', label: '마케팅 정보 수신 동의', required: false },
] as const

type TermKey = (typeof TERMS)[number]['key']

/** Figma: 약관 동의. 필수 약관에 모두 동의해야 시작하기 활성 */
export default function TermsScreen() {
  const { signIn } = useSession()
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
          disabled={!requiredAgreed}
          // TODO: 회원가입 API 호출 (가입 정보 + 마케팅 동의 여부) 후 로그인 처리
          onPress={signIn}
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
