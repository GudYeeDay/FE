import { useState } from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'

import { Button, TextField } from '@/components'
import { FormScreen } from '@/components/auth/FormScreen'
import { TextLink } from '@/components/auth/TextLink'
import { loginErrorText, useLogin } from '@/features/auth/api'
import { fieldError, rules } from '@/features/auth/validation'

/** Figma: 로컬 로그인 */
export default function EmailLoginScreen() {
  const router = useRouter()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const emailValid = rules.email.test(email)
  const canSubmit = emailValid && password.length > 0 && !login.isPending

  // 성공하면 토큰이 저장되면서 홈으로 바뀐다 (app/_layout.tsx 의 Stack.Protected)
  const submit = () => login.mutate({ email: email.trim(), password })

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
        onChangeText={(v) => {
          setEmail(v)
          login.reset()
        }}
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
        onChangeText={(v) => {
          setPassword(v)
          login.reset()
        }}
        errorMessage={login.isError ? loginErrorText(login.error) : undefined}
        returnKeyType="done"
        onSubmitEditing={() => canSubmit && submit()}
      />
    </FormScreen>
  )
}
