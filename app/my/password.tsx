import { useState } from 'react'
import { Text, View } from 'react-native'
import { useRouter } from 'expo-router'

import { Button, TextField } from '@/components'
import { FormScreen } from '@/components/auth/FormScreen'
import { fieldError, rules } from '@/features/auth/validation'
import { useMyProfile, type LoginProvider } from '@/features/my/store'

const PROVIDER_LABEL: Record<Exclude<LoginProvider, 'email'>, string> = {
  apple: '애플',
  google: '구글',
}

/** Figma: 비밀번호 변경. 소셜 계정은 안내만 보여준다 */
export default function PasswordSettingScreen() {
  const { email, provider } = useMyProfile()

  if (provider !== 'email') {
    return (
      <FormScreen title="비밀번호 변경">
        <TextField label="이메일" value={email} readOnly />
        <Text className="mt-8 font-ko-medium text-ko-14 text-ink">비밀번호 변경</Text>
        <View className="mt-3 flex-row items-center rounded-xl border border-line px-4 py-4">
          <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-ink-faint">
            <Text className="font-ko-bold text-ko-12 text-white">!</Text>
          </View>
          <Text className="flex-1 font-ko text-ko-12 leading-5 text-ink-soft">
            {PROVIDER_LABEL[provider]} 계정으로 로그인하고 있어{'\n'}비밀번호를 설정할 수 없어요
          </Text>
        </View>
      </FormScreen>
    )
  }

  return <EmailPasswordForm email={email} />
}

function EmailPasswordForm({ email }: { email: string }) {
  const router = useRouter()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  const nextValid = rules.password.test(next)
  const confirmValid = confirm === next
  const canSubmit = current.length > 0 && nextValid && confirm.length > 0 && confirmValid

  return (
    <FormScreen
      title="비밀번호 변경"
      footer={
        <Button
          disabled={!canSubmit}
          onPress={() => {
            // TODO: 비밀번호 변경 API 연동 (현재 비밀번호 불일치 에러 처리 포함)
            router.back()
          }}
        >
          변경하기
        </Button>
      }
    >
      <TextField label="이메일" value={email} readOnly />
      <TextField
        className="mt-7"
        label="현재 비밀번호"
        placeholder="현재 비밀번호 입력"
        secure
        value={current}
        onChangeText={setCurrent}
      />
      <TextField
        className="mt-7"
        label="새 비밀번호"
        placeholder={rules.password.placeholder}
        secure
        value={next}
        onChangeText={setNext}
        errorMessage={fieldError(next, nextValid, rules.password.error)}
      />
      <TextField
        className="mt-7"
        label="새 비밀번호 확인"
        placeholder={rules.passwordConfirm.placeholder}
        secure
        value={confirm}
        onChangeText={setConfirm}
        errorMessage={fieldError(confirm, confirmValid, rules.passwordConfirm.error)}
      />
    </FormScreen>
  )
}
