import { useState } from 'react'
import { Alert, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

import { Button, TextField } from '@/components'
import { FormScreen } from '@/components/auth/FormScreen'
import { fieldError, rules } from '@/features/auth/validation'
import { ApiError, errorText } from '@/api/http'
import { useChangePassword } from '@/features/my/api'
import { useMyInfo, type LoginProvider } from '@/features/my/store'

/** 입력칸 아래에 보여주는 서버 오류 */
const FIELD_ERRORS = ['AUTH4010', 'AUTH4016']

const PROVIDER_LABEL: Record<Exclude<LoginProvider, 'email'>, string> = {
  apple: '애플',
  google: '구글',
}

/** Figma: 비밀번호 변경. 소셜 계정은 안내만 보여준다 */
export default function PasswordSettingScreen() {
  const { email, provider } = useMyInfo()

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
  const change = useChangePassword()

  const nextValid = rules.password.test(next)
  const confirmValid = confirm === next
  const canSubmit =
    current.length > 0 && nextValid && confirm.length > 0 && confirmValid && !change.isPending
  // 현재 비밀번호가 틀리거나(AUTH4010) 새 비밀번호가 같으면(AUTH4016) 해당 칸에 서버 문구를 보여준다
  const code = change.error instanceof ApiError ? change.error.code : undefined
  const currentError = code === 'AUTH4010' ? '현재 비밀번호가 일치하지 않아요' : undefined
  const nextError = code === 'AUTH4016' ? errorText(change.error) : undefined

  return (
    <FormScreen
      title="비밀번호 변경"
      footer={
        <Button
          disabled={!canSubmit}
          onPress={() =>
            change.mutate(
              { currentPassword: current, newPassword: next, newPasswordCheck: confirm },
              {
                onSuccess: () => {
                  Alert.alert('비밀번호를 변경했어요')
                  router.back()
                },
                onError: (error) => {
                  const shown = error instanceof ApiError && FIELD_ERRORS.includes(error.code ?? '')
                  if (!shown) Alert.alert('비밀번호를 변경하지 못했어요', errorText(error))
                },
              },
            )
          }
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
        onChangeText={(v) => {
          setCurrent(v)
          change.reset()
        }}
        errorMessage={currentError}
      />
      <TextField
        className="mt-7"
        label="새 비밀번호"
        placeholder={rules.password.placeholder}
        secure
        value={next}
        onChangeText={(v) => {
          setNext(v)
          change.reset()
        }}
        errorMessage={nextError ?? fieldError(next, nextValid, rules.password.error)}
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
