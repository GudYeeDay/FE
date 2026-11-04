import { useRef, useState } from 'react'

import { useCountdown } from '@/hooks/useCountdown'
import { loginErrorText, sendEmailCode, verifyEmailCode } from './api'
import { CODE_LENGTH, rules } from './validation'

/** 서버가 응답에 유효시간을 주지 않을 때 쓰는 기본값 (서버 설정 5분) */
const CODE_TTL_SECONDS = 300

type CheckState = 'idle' | 'checking' | 'ok' | 'fail'

/**
 * 이메일 입력 → 인증요청(메일 발송) → 인증번호 6자리 입력(서버 확인) 흐름의 상태.
 * 인증번호를 다 입력하면 바로 서버에 확인한다.
 */
export function useEmailVerification() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [requested, setRequested] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [requestError, setRequestError] = useState<string | undefined>()
  const [check, setCheck] = useState<CheckState>('idle')
  const [checkError, setCheckError] = useState<string | undefined>()
  const countdown = useCountdown()
  // 입력이 바뀐 뒤 늦게 도착한 확인 결과는 버린다
  const attempt = useRef(0)

  const emailValid = rules.email.test(email)
  const expired = requested && countdown.remaining === 0

  const reset = () => {
    attempt.current += 1
    setCheck('idle')
    setCheckError(undefined)
  }

  const request = async () => {
    setRequesting(true)
    setRequestError(undefined)
    try {
      const res = await sendEmailCode(email.trim())
      reset()
      setRequested(true)
      setCode('')
      countdown.start(res?.expiresIn ?? CODE_TTL_SECONDS)
    } catch (error) {
      setRequestError(loginErrorText(error, '인증번호를 보내지 못했어요. 잠시 후 다시 시도해주세요'))
    } finally {
      setRequesting(false)
    }
  }

  const changeCode = (v: string) => {
    const next = v
      .replace(/[^0-9a-z]/gi, '')
      .toUpperCase()
      .slice(0, CODE_LENGTH)
    setCode(next)
    reset()
    if (next.length < CODE_LENGTH || !requested || expired) return

    const current = attempt.current
    setCheck('checking')
    verifyEmailCode(email.trim(), next)
      .then((res) => {
        if (current !== attempt.current) return
        setCheck(res?.verified ? 'ok' : 'fail')
        if (!res?.verified) setCheckError(rules.code.error)
      })
      .catch((error: unknown) => {
        if (current !== attempt.current) return
        setCheck('fail')
        setCheckError(loginErrorText(error, rules.code.error))
      })
  }

  return {
    email,
    setEmail: (v: string) => {
      setEmail(v)
      setRequestError(undefined)
      // 이메일을 바꾸면 이전 인증은 무효
      if (requested) {
        setRequested(false)
        setCode('')
        reset()
        countdown.stop()
      }
    },
    code,
    setCode: changeCode,
    emailValid,
    requested,
    requesting,
    requestError,
    expired,
    checking: check === 'checking',
    checkError,
    timerLabel: countdown.label,
    request,
    verified: check === 'ok' && !expired,
  }
}

export type EmailVerification = ReturnType<typeof useEmailVerification>
