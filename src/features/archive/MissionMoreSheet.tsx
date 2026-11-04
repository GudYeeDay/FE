import { Modal, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { PencilIcon, TrashIcon } from '@/components/feature-icons'
import { colors } from '@/theme'

type SheetMission = {
  title: string
  /** 완료 기록이 아니면 수정하기를 연다. 수정 API가 없으면 onEdit 을 넘기지 않는다 */
  completed?: boolean
}

type SheetProps = {
  mission: SheetMission | null
  onClose: () => void
  onEdit?: () => void
  onDelete: () => void
}

/** 더보기: 미션 이름, 수정하기, 삭제하기 */
export function MissionMoreSheet({ mission, onClose, onEdit, onDelete }: SheetProps) {
  const { bottom } = useSafeAreaInsets()

  return (
    <Modal visible={mission != null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="rounded-t-2xl bg-white px-5 pt-3"
          style={{ paddingBottom: Math.max(bottom, 20) }}
          onPress={() => {}}
        >
          <View className="mb-6 h-1 w-10 self-center rounded-full bg-line" />
          <Text className="font-ko text-ko-14 text-ink-soft">{mission?.title}</Text>

          {onEdit && !mission?.completed ? (
            <Pressable
              accessibilityRole="button"
              className="mt-6 flex-row items-center gap-3 py-2"
              onPress={onEdit}
            >
              <PencilIcon width={22} height={22} color={colors.ink.DEFAULT} />
              <Text className="font-ko text-ko-16 text-ink">수정하기</Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            className="mt-6 flex-row items-center gap-3 py-2"
            onPress={onDelete}
          >
            <TrashIcon width={22} height={22} color={colors.main.DEFAULT} />
            <Text className="font-ko text-ko-16 text-main">삭제하기</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

type DialogProps = {
  visible: boolean
  /** 완료 기록 삭제. 저장 미션 삭제와 문구가 다르다 */
  record?: boolean
  onCancel: () => void
  onConfirm: () => void
}

/** 삭제 확인 */
export function DeleteMissionDialog({ visible, record, onCancel, onConfirm }: DialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable className="flex-1 items-center justify-center bg-black/40 px-8" onPress={onCancel}>
        <Pressable className="w-full rounded-2xl bg-white px-5 py-6" onPress={() => {}}>
          <Text className="text-center font-ko-bold text-ko-16 text-ink">
            {record ? '이 기록을 삭제할까요?' : '이 미션을 삭제할까요?'}
          </Text>
          <Text className="mt-3 text-center font-ko text-ko-14 leading-6 text-ink-soft">
            {record
              ? '사진과 글을 포함한 기록이 완전히 삭제되어\n되돌릴 수 없어요'
              : '삭제한 미션은 저장 목록에서 사라져요\n같은 미션을 다시 만나지 못 할 수도 있어요'}
          </Text>
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
              <Text className="font-ko-medium text-ko-14 text-white">삭제하기</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
