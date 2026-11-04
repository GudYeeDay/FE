import { useEffect, useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'

import { Dialog } from '@/components/ui/Dialog'

export type AccountAction = 'logout' | 'withdraw'

const COPY: Record<
  AccountAction,
  { title: string; message: string; confirmLabel: string; doneTitle: string; doneMessage: string }
> = {
  logout: {
    title: '로그아웃',
    message: '로그아웃을 진행하시겠어요?',
    confirmLabel: '로그아웃',
    doneTitle: '로그아웃 완료',
    doneMessage: '로그아웃이 완료되었습니다.',
  },
  withdraw: {
    title: '회원탈퇴',
    message: '탈퇴하면 그동안 남긴 기록이 모두 사라져요',
    confirmLabel: '탈퇴하기',
    doneTitle: '회원탈퇴 완료',
    doneMessage: '회원탈퇴가 완료되었습니다.\n그동안 굳이를 이용해주셔서 감사합니다.',
  },
}

const DONE_AUTO_CLOSE_MS = 2000

type Props = {
  action: AccountAction | null
  onCancel: () => void
  /** 완료 안내까지 닫힌 뒤 호출. 여기서 세션을 끝낸다 */
  onDone: () => void
}

/**
 * Figma: 로그아웃/회원탈퇴 확인 → 완료 안내.
 * 모달을 연달아 띄우면 iOS에서 두 번째 모달이 안 뜰 수 있어 한 Modal 안에서 내용만 바꾼다.
 */
export function AccountDialog({ action, onCancel, onDone }: Props) {
  const [confirmed, setConfirmed] = useState<AccountAction | null>(null)
  const done = !!action && confirmed === action

  useEffect(() => {
    if (!done) return
    const timer = setTimeout(onDone, DONE_AUTO_CLOSE_MS)
    return () => clearTimeout(timer)
  }, [done, onDone])

  const copy = action ? COPY[action] : null

  return (
    <Modal
      visible={!!action}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={done ? onDone : onCancel}
    >
      <Pressable
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: 'rgba(28, 28, 26, 0.7)' }}
        disabled={!done}
        onPress={onDone}
      >
        {copy && !done ? (
          <Dialog
            showMark={false}
            title={copy.title}
            message={copy.message}
            cancelLabel="취소"
            confirmLabel={copy.confirmLabel}
            onCancel={onCancel}
            onConfirm={() => {
              // TODO: 로그아웃/회원탈퇴 API 연동
              setConfirmed(action)
            }}
          />
        ) : null}
        {copy && done ? (
          <View
            accessibilityRole="alert"
            className="w-[326px] max-w-full items-center rounded-2xl bg-white px-[18px] pb-[30px] pt-[23px]"
          >
            <Text className="font-ko-bold text-[18px] leading-[34px] text-[#0D0D0D]">
              {copy.doneTitle}
            </Text>
            <Text className="mt-2.5 text-center font-ko text-ko-14 leading-[20px] text-ink-faint">
              {copy.doneMessage}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </Modal>
  )
}
