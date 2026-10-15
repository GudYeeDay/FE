import type { ReactNode } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = {
  visible: boolean
  onClose: () => void
  /** 시트 위쪽 회색 제목 (예: 미션 이름) */
  title?: string
  children: ReactNode
}

/** Figma: 미션 수정/삭제 바텀시트. 바깥을 누르면 닫힌다. */
export function BottomSheet({ visible, onClose, title, children }: Props) {
  const { bottom } = useSafeAreaInsets()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(28, 28, 26, 0.7)' }}>
        <Pressable accessibilityLabel="닫기" className="absolute inset-0" onPress={onClose} />
        <View
          className="rounded-t-2xl bg-white px-[21px] pt-[15px]"
          style={{
            paddingBottom: Math.max(bottom, 16) + 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <View className="h-1 w-[43px] self-center rounded-full bg-line" />
          {title ? (
            <Text className="mt-[26px] font-ko-medium text-ko-14 text-ink-soft" numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          <View className="mt-[22px] gap-[23px]">{children}</View>
        </View>
      </View>
    </Modal>
  )
}

/** 바텀시트 안의 한 줄 (아이콘 + 글자) */
export function BottomSheetItem({
  icon,
  label,
  destructive,
  onPress,
}: {
  icon: ReactNode
  label: string
  destructive?: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-4 active:opacity-60"
    >
      {icon}
      <Text className={`font-en-medium text-en-16 ${destructive ? 'text-brand-80' : 'text-ink'}`}>
        {label}
      </Text>
    </Pressable>
  )
}
