import { useState } from 'react'
import { Alert } from 'react-native'
import { useRouter } from 'expo-router'

import { Button, TextField } from '@/components'
import { EmailVerificationFields } from '@/components/auth/EmailVerificationFields'
import { FormScreen } from '@/components/auth/FormScreen'
import { useEmailVerification } from '@/features/auth/useEmailVerification'
import { fieldError, rules } from '@/features/auth/validation'

/** Figma: 비밀번호 찾기. 이메일 인증 후 새 비밀번호 설정 */
export default function FindPasswordScreen() {
  const router = useRouter()
  const verification = useEmailVerification()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const passwordValid = rules.password.test(password)
  const confirmValid = passwordConfirm === password
  const canSubmit =
    verification.verified && passwordValid && passwordConfirm.length > 0 && confirmValid

  const submit = () => {
    // TODO: 비밀번호 변경 API 연동
    Alert.alert('비밀번호 변경 완료', '새 비밀번호로 로그인해주세요.', [
      { text: '확인', onPress: () => router.back() },
    ])
  }

  return (
    <FormScreen
      title="비밀번호 찾기"
      footer={
        <Button disabled={!canSubmit} onPress={submit}>
          변경하기
        </Button>
      }
    >
      <EmailVerificationFields verification={verification} gapClassName="mt-4" />

      <TextField
        className="mt-9"
        label="새 비밀번호"
        placeholder={rules.password.placeholder}
        secure
        autoComplete="new-password"
        textContentType="newPassword"
        value={password}
        onChangeText={setPassword}
        errorMessage={fieldError(password, passwordValid, rules.password.error)}
      />
      <TextField
        className="mt-4"
        label="새 비밀번호 확인"
        placeholder={rules.passwordConfirm.placeholder}
        secure
        textContentType="newPassword"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        errorMessage={fieldError(passwordConfirm, confirmValid, rules.passwordConfirm.error)}
      />
    </FormScreen>
  )
}
