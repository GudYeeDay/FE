import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 인증번호 유효시간 타이머. start(180) 으로 시작하고 remaining 이 0 이 되면 멈춘다.
 * 남은 시간은 종료 시각 기준으로 계산해서 앱이 백그라운드에 있다 와도 어긋나지 않는다.
 */
export function useCountdown() {
  const [remaining, setRemaining] = useState(0)
  const endAt = useRef(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
  }, [])

  const start = useCallback(
    (seconds: number) => {
      stop()
      endAt.current = Date.now() + seconds * 1000
      setRemaining(seconds)
      timer.current = setInterval(() => {
        const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000))
        setRemaining(left)
        if (left === 0) stop()
      }, 250)
    },
    [stop],
  )

  useEffect(() => stop, [stop])

  const label = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`
  return { remaining, label, start, stop }
}
