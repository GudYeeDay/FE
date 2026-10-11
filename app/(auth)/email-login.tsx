import { useState } from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'

import { Button, TextField } from '@/components'
import { FormScreen } from '@/components/auth/FormScreen'
import { TextLink } from '@/components/auth/TextLink'
import { useSession } from '@/features/auth/session'
import { fieldError, rules } from '@/features/auth/validation'

/** Figma: 로컬 로그인 */
export default function EmailLoginScreen() {
  const router = useRouter()
  const { signIn } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const emailValid = rules.email.test(email)
  const canSubmit = emailValid && password.length > 0

  const submit = () => {
    // TODO: 로그인 API 연동. 실패 시 비밀번호 칸에 에러 문구 표시
    signIn()
  }

  return (
    <FormScreen
      title="이메일로 로그인"
      footer={
        <>
          <View className="mb-[23px] flex-row justify-center gap-[33px]">
            <TextLink onPress={() => router.push('/signup')}>회원가입</TextLink>
            <TextLink onPress={() => router.push('/find-password')}>비밀번호 찾기</TextLink>
          </View>
          <Button disabled={!canSubmit} onPress={submit}>
            로그인
          </Button>
        </>
      }
    >
      <TextField
        label="이메일"
        placeholder={rules.email.placeholder}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        value={email}
        onChangeText={setEmail}
        errorMessage={fieldError(email, emailValid, rules.email.error)}
      />
      <TextField
        className="mt-7"
        label="비밀번호"
        placeholder={rules.password.placeholder}
        secure
        autoComplete="current-password"
        textContentType="password"
        value={password}
        onChangeText={setPassword}
        returnKeyType="done"
        onSubmitEditing={() => canSubmit && submit()}
      />
    </FormScreen>
  )
}
