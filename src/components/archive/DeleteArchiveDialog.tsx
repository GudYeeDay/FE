import { Alert, Modal, View } from 'react-native'

import { errorText } from '@/api/http'
import { Dialog } from '@/components/ui/Dialog'
import { useDeleteBookmark } from '@/features/archive/api'
import type { ArchiveItem } from '@/features/mission/types'

type Props = {
  item: ArchiveItem | null
  onClose: () => void
  onDeleted?: () => void
}

/**
 * Figma: 삭제 확인 모달.
 * 서버는 보관함 항목만 지우고 완료 기록(사진·글)은 남긴다. 그래서 완료한 미션도 기록이 남는다고 안내한다
 */
export function DeleteArchiveDialog({ item, onClose, onDeleted }: Props) {
  const done = item?.status === 'done'
  const remove = useDeleteBookmark()

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
          title="보관함에서 삭제할까요?"
          message={
            done
              ? '완료한 미션이 보관함에서 사라져요\n남긴 기록은 캘린더에 그대로 있어요'
              : '저장한 미션이 보관함에서 사라져요'
          }
          cancelLabel="취소"
          confirmLabel="삭제하기"
          onCancel={onClose}
          onConfirm={() => {
            if (!item || remove.isPending) return
            remove.mutate(item.bookmarkId, {
              onSuccess: () => {
                onClose()
                onDeleted?.()
              },
              onError: (error) => {
                onClose()
                Alert.alert('삭제하지 못했어요', errorText(error))
              },
            })
          }}
        />
      </View>
    </Modal>
  )
}
