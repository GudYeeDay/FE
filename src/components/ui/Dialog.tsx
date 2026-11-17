import { Pressable, Text, View } from 'react-native'

import { DialogMarkIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

type DialogProps = {
  title: string
  message: string
  cancelLabel: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
  /** 위쪽 원형 마크 표시 (Figma: 시작 불가 모달에는 있고 삭제 확인에는 없음) */
  showMark?: boolean
}

/**
 * Figma: 모달 (시작 불가 / 기록 삭제 확인 등)
 * 흰 카드에 제목·설명·버튼 두 개. 화면을 어둡게 덮는 처리는 부르는 쪽에서 한다.
 */
export function Dialog({
  title,
  message,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  showMark = true,
}: DialogProps) {
  return (
    <View
      accessibilityRole="alert"
      className="w-[326px] max-w-full items-center rounded-2xl bg-white px-[18px] pb-[21px] pt-[23px]"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      {showMark ? <DialogMarkIcon width={36} height={36} /> : null}
      {/* Figma ko header 2 (Bold 18, Ink). 마크가 있는 모달(시작 불가)만 행간 34, 없는 모달(로그아웃)은 28 */}
      <Text
        className={cn(
          'font-ko-bold text-ko-18 text-ink',
          showMark ? 'mt-[11px] leading-[34px]' : null,
        )}
      >
        {title}
      </Text>
      <Text className="mt-2.5 text-center font-en text-en-14 leading-[17.6px] tracking-[-0.344px] text-ink-faint">
        {message}
      </Text>
      <View className="mt-[21px] w-full flex-row gap-[15px]">
        <Pressable
          accessibilityRole="button"
          onPress={onCancel}
          className="h-12 flex-1 items-center justify-center rounded-lg border border-line active:opacity-70"
        >
          <Text className="font-ko text-ko-12 text-ink">{cancelLabel}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onConfirm}
          className="h-12 flex-1 items-center justify-center rounded-lg bg-main active:opacity-80"
        >
          <Text className="font-ko text-ko-12 text-white">{confirmLabel}</Text>
        </Pressable>
      </View>
    </View>
  )
}
