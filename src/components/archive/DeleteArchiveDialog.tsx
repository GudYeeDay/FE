import { Modal, View } from 'react-native'

import { Dialog } from '@/components/ui/Dialog'
import { missionActions } from '@/features/mission/store'
import type { ArchiveItem } from '@/features/mission/types'

type Props = {
  item: ArchiveItem | null
  onClose: () => void
  onDeleted?: () => void
}

/**
 * Figma: 기록 삭제 확인 모달.
 * 완료한 미션은 기록(사진·글)이 함께 지워지므로 Figma 문구를, 저장만 한 미션은 보관함에서 빠진다는 문구를 쓴다.
 */
export function DeleteArchiveDialog({ item, onClose, onDeleted }: Props) {
  const done = item?.status === 'done'

  return (
    <Modal
      visible={!!item}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: 'rgba(28, 28, 26, 0.7)' }}
      >
        <Dialog
          showMark={false}
          title={done ? '이 기록을 삭제할까요?' : '보관함에서 삭제할까요?'}
          message={
            done
              ? '사진과 글을 포함한 기록이 완전히 삭제되어\n되돌릴 수 없어요'
              : '저장한 미션이 보관함에서 사라져요'
          }
          cancelLabel="취소"
          confirmLabel="삭제하기"
          onCancel={onClose}
          onConfirm={() => {
            // TODO: 삭제 API 연동
            if (item) missionActions.remove(item.mission.id)
            onClose()
            onDeleted?.()
          }}
        />
      </View>
    </Modal>
  )
}
