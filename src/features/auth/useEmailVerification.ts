import { useState } from 'react'

import { useCountdown } from '@/hooks/useCountdown'
import { rules } from './validation'

const CODE_TTL_SECONDS = 300

/** 이메일 입력 → 인증요청 → 4자리 인증번호 입력 흐름의 상태 */
export function useEmailVerification() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [requested, setRequested] = useState(false)
  const countdown = useCountdown()

  const emailValid = rules.email.test(email)
  const expired = requested && countdown.remaining === 0
  const codeValid = rules.code.test(code)

  const request = () => {
    // TODO: 인증번호 발송 API 연동
    setRequested(true)
    setCode('')
    countdown.start(CODE_TTL_SECONDS)
  }

  return {
    email,
    setEmail: (v: string) => {
      setEmail(v)
      // 이메일을 바꾸면 이전 인증은 무효
      if (requested) {
        setRequested(false)
        countdown.stop()
      }
    },
    code,
    setCode: (v: string) => setCode(v.replace(/\D/g, '').slice(0, 4)),
    emailValid,
    requested,
    expired,
    timerLabel: countdown.label,
    request,
    /** TODO: 서버 검증으로 교체. 지금은 시간 안에 4자리를 입력하면 통과 */
    verified: requested && !expired && codeValid,
  }
}

export type EmailVerification = ReturnType<typeof useEmailVerification>
