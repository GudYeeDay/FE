import { useState } from 'react'
import { useRouter } from 'expo-router'

import { Button, TextField } from '@/components'
import { EmailVerificationFields } from '@/components/auth/EmailVerificationFields'
import { FormScreen } from '@/components/auth/FormScreen'
import { useEmailVerification } from '@/features/auth/useEmailVerification'
import { fieldError, rules } from '@/features/auth/validation'

/** Figma: 회원가입. 가입하기 → 약관 동의 */
export default function SignupScreen() {
  const router = useRouter()
  const verification = useEmailVerification()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [nickname, setNickname] = useState('')

  const passwordValid = rules.password.test(password)
  const confirmValid = passwordConfirm === password
  const nicknameValid = rules.nickname.test(nickname)

  const canSubmit =
    verification.verified &&
    passwordValid &&
    passwordConfirm.length > 0 &&
    confirmValid &&
    nicknameValid

  return (
    <FormScreen
      title="이메일로 회원가입"
      footer={
        <Button
          disabled={!canSubmit}
          // TODO: 가입 정보는 약관 동의 후 함께 전송 (API 연동 시 상태 전달 방식 결정)
          onPress={() => router.push('/terms')}
        >
          가입하기
        </Button>
      }
    >
      <EmailVerificationFields verification={verification} />

      <TextField
        className="mt-12"
        label="비밀번호"
        placeholder={rules.password.placeholder}
        secure
        autoComplete="new-password"
        textContentType="newPassword"
        value={password}
        onChangeText={setPassword}
        errorMessage={fieldError(password, passwordValid, rules.password.error)}
      />
      <TextField
        className="mt-7"
        label="비밀번호 확인"
        placeholder={rules.passwordConfirm.placeholder}
        secure
        textContentType="newPassword"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        errorMessage={fieldError(passwordConfirm, confirmValid, rules.passwordConfirm.error)}
      />

      <TextField
        className="mt-12"
        label="이름"
        placeholder={rules.nickname.placeholder}
        maxLength={10}
        value={nickname}
        onChangeText={setNickname}
        errorMessage={fieldError(nickname, nicknameValid, rules.nickname.error)}
      />
    </FormScreen>
  )
}
