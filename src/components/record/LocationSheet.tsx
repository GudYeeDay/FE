import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { colors } from '@/theme'

const PLACE_MAX = 30

type Props = {
  visible: boolean
  initialValue: string
  onClose: () => void
  /** 빈 문자열이면 위치 없음 */
  onSubmit: (place: string) => void
}

/**
 * Figma: 위치 추가 (빈 상태 / 입력 중 / 입력 완료)
 * 장소를 직접 적는다. 건너뛰기를 누르면 위치 없이 닫고, 추가는 입력이 있을 때만 누를 수 있다.
 */
export function LocationSheet({ visible, initialValue, onClose, onSubmit }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* 열 때마다 입력값을 초기화하려고 안쪽을 따로 마운트한다 */}
      {visible ? (
        <SheetBody initialValue={initialValue} onClose={onClose} onSubmit={onSubmit} />
      ) : null}
    </Modal>
  )
}

function SheetBody({ initialValue, onClose, onSubmit }: Omit<Props, 'visible'>) {
  const { bottom } = useSafeAreaInsets()
  const [place, setPlace] = useState(initialValue)
  const canSubmit = place.trim().length > 0

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-end"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ backgroundColor: 'rgba(28, 28, 26, 0.7)' }}
    >
      <Pressable accessibilityLabel="닫기" className="absolute inset-0" onPress={onClose} />
      <View
        className="rounded-t-2xl bg-white px-6 pt-[17px]"
        style={{
          paddingBottom: Math.max(bottom, 16) + 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        <View className="h-1 w-[43px] self-center rounded-full bg-line" />
        <Text className="mt-[13px] font-ko-bold text-[18px] leading-[28px] tracking-[0.38px] text-ink">
          위치 추가
        </Text>
        <Text className="mt-2.5 font-en text-en-14 text-[#AFAFAF]">
          이 기록에 남기고 싶은 장소를 직접 입력해요. 비워두면 기록에 위치가 표시되지 않아요.
        </Text>
        <TextInput
          className="mt-4 h-[43px] rounded-lg border border-line px-4 font-en text-en-14 text-ink"
          placeholder="예: 퇴근길 버스 정류장"
          placeholderTextColor={colors.ink.faint}
          maxLength={PLACE_MAX}
          value={place}
          onChangeText={setPlace}
          autoFocus
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => canSubmit && onSubmit(place.trim())}
        />
        <View className="mt-[17px] flex-row gap-6">
          <Pressable
            accessibilityRole="button"
            onPress={() => onSubmit('')}
            className="h-12 flex-1 items-center justify-center rounded-lg border border-line active:opacity-70"
          >
            <Text className="font-ko text-ko-12 text-ink">건너뛰기</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
            disabled={!canSubmit}
            onPress={() => onSubmit(place.trim())}
            className={`h-12 flex-1 items-center justify-center rounded-lg active:opacity-80 ${
              canSubmit ? 'bg-main' : 'bg-ink-faint'
            }`}
          >
            <Text className="font-ko text-ko-12 text-white">추가</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
