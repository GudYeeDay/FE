import { Text, View } from 'react-native'

import { TextField } from '@/components/ui/TextField'
import type { EmailVerification } from '@/features/auth/useEmailVerification'
import { fieldError, rules } from '@/features/auth/validation'

type Props = {
  verification: EmailVerification
  /** 이메일 칸과 인증번호 칸 사이 간격 (화면마다 Figma 간격이 다름) */
  gapClassName?: string
}

/** Figma: 이메일(인증요청) + 인증번호(3:00 타이머) */
export function EmailVerificationFields({ verification: v, gapClassName = 'mt-7' }: Props) {
  const codeError = v.expired
    ? '인증 시간이 만료되었습니다. 다시 요청해주세요'
    : fieldError(v.code, v.code.length < 4 || v.verified, rules.code.error)

  return (
    <View>
      <TextField
        label="이메일"
        placeholder={rules.email.placeholder}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        value={v.email}
        onChangeText={v.setEmail}
        errorMessage={fieldError(v.email, v.emailValid, rules.email.error)}
        action={{
          label: v.requested ? '재요청' : '인증요청',
          disabled: !v.emailValid,
          onPress: v.request,
        }}
      />
      <TextField
        className={gapClassName}
        label="인증번호"
        placeholder={rules.code.placeholder}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={4}
        disabled={!v.requested}
        value={v.code}
        onChangeText={v.setCode}
        errorMessage={codeError}
        trailing={
          v.requested && !v.expired ? (
            <Text className="font-ko text-ko-12 text-main">{v.timerLabel}</Text>
          ) : null
        }
      />
    </View>
  )
}
