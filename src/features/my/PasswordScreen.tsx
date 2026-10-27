import { useState } from 'react'
import { useRouter } from 'expo-router'

import { Text } from 'react-native'

import { getAccountEmail, remoteErrorText } from '@/api/http'
import { Button, TextField } from '@/components'
import { FormScreen } from '@/components/auth/FormScreen'
import { fieldError, rules } from '@/features/auth/validation'
import { useChangePassword } from '@/features/my/api'

export function PasswordScreen() {
  const router = useRouter()
  const changePassword = useChangePassword()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  const nextValid = rules.password.test(next)
  const confirmValid = confirm === next
  const canSubmit =
    current.length > 0 && nextValid && confirm.length > 0 && confirmValid && !changePassword.isPending

  return (
    <FormScreen
      title="비밀번호 변경"
      footer={
        <Button
          disabled={!canSubmit}
          onPress={() =>
            changePassword.mutate(
              { currentPassword: current, newPassword: next, newPasswordCheck: confirm },
              { onSuccess: () => router.back() },
            )
          }
        >
          변경하기
        </Button>
      }
    >
      {changePassword.isError ? (
        <Text className="mb-3 font-ko text-ko-12 text-main">{remoteErrorText(changePassword.error)}</Text>
      ) : null}
      <TextField label="이메일" value={getAccountEmail() ?? ''} readOnly />
      <TextField
        className="mt-7"
        label="현재 비밀번호"
        placeholder="현재 비밀번호를 입력해주세요"
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
