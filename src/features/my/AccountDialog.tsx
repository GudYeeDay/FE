import { useEffect, useRef } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'

type ConfirmProps = {
  visible: boolean
  title: string
  body: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}

/** 로그아웃·회원탈퇴 확인 */
export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 items-center justify-center bg-black/40 px-8" onPress={onCancel}>
        <Pressable className="w-full rounded-2xl bg-white px-5 py-6" onPress={() => {}}>
          <Text className="text-center font-ko-bold text-ko-16 text-ink">{title}</Text>
          <Text className="mt-3 text-center font-ko text-ko-14 leading-6 text-ink-soft">{body}</Text>
          <View className="mt-6 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              className="h-12 flex-1 items-center justify-center rounded-lg border border-line"
              onPress={onCancel}
            >
              <Text className="font-ko-medium text-ko-14 text-ink">취소</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="h-12 flex-1 items-center justify-center rounded-lg bg-main"
              onPress={onConfirm}
            >
              <Text className="font-ko-medium text-ko-14 text-white">{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

type NoticeProps = {
  visible: boolean
  title: string
  body: string
  onClose: () => void
}

/** 완료 안내. 바깥을 누르면 닫힌다. */
export function NoticeDialog({ visible, title, body, onClose }: NoticeProps) {
  const openedAt = useRef(0)

  useEffect(() => {
    if (visible) openedAt.current = Date.now()
  }, [visible])

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/40 px-8"
        onPress={() => {
          if (Date.now() - openedAt.current < 400) return
          onClose()
        }}
      >
        <Pressable className="w-full rounded-2xl bg-white px-5 py-8" onPress={() => {}}>
          <Text className="text-center font-ko-bold text-ko-16 text-ink">{title}</Text>
          <Text className="mt-3 text-center font-ko text-ko-14 leading-6 text-ink-soft">{body}</Text>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
