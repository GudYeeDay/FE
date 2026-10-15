import { useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { Button, Header } from '@/components'
import { DeleteArchiveDialog } from '@/components/archive/DeleteArchiveDialog'
import { TitleBarIcon } from '@/components/icons'
import { MissionStarted } from '@/components/mission/MissionStarted'
import { Dialog } from '@/components/ui/Dialog'
import { missionActions, useMissionStore } from '@/features/mission/store'

/** Figma: 저장한 미션 상세 */
export default function SavedMissionScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const archive = useMissionStore((s) => s.archive)
  const item = archive.find((a) => a.mission.id === id && a.status === 'saved')

  const [started, setStarted] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (started && item) {
    return (
      <MissionStarted
        title={item.mission.title}
        onGoHome={() => {
          router.dismissAll()
          router.navigate('/')
        }}
      />
    )
  }

  if (!item) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header title="저장한 미션" />
        <View className="flex-1 items-center justify-center">
          <Text className="font-ko text-ko-14 text-ink-soft">미션을 찾을 수 없어요</Text>
        </View>
      </SafeAreaView>
    )
  }

  const [, m, d] = item.savedAt.split('-').map(Number)

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="저장한 미션" />
      <View className="flex-1 px-[21px] pt-4">
        <View className="flex-row items-center gap-3 rounded-lg border border-line px-4 py-2.5">
          <TitleBarIcon width={2} height={14} />
          <Text className="font-en text-en-14 text-ink-soft">
            {m}. {d}에 저장함
          </Text>
        </View>
        <Text className="mt-6 font-ko-bold text-ko-20 text-[#0D0D0D]">{item.mission.title}</Text>
        <Text className="mt-2 font-en text-en-14 leading-[17px] text-[#AFAFAF]">
          {item.mission.description}
        </Text>
      </View>

      <View className="items-center px-[30px] pb-4">
        <Button
          onPress={() => {
            // TODO: 미션 시작 API 연동
            if (missionActions.start(item.mission)) setStarted(true)
            else setBlocked(true)
          }}
        >
          이 미션으로 시작하기
        </Button>
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => setConfirmDelete(true)}
          className="mt-[21px]"
        >
          <Text className="font-ko-medium text-ko-14 text-ink-faint">보관함에서 삭제하기</Text>
        </Pressable>
      </View>

      <Modal
        visible={blocked}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setBlocked(false)}
      >
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(28, 28, 26, 0.7)' }}
        >
          <Dialog
            title="이미 진행중인 미션이 있어요"
            message={
              '한 번에 하나씩만 진행할 수 있어요.\n지금 진행중인 미션을 먼저 완료하거나 그만둔 뒤에\n새로 시작해 주세요.'
            }
            cancelLabel="확인"
            confirmLabel="진행중인 미션 보기"
            onCancel={() => setBlocked(false)}
            onConfirm={() => {
              setBlocked(false)
              router.push('/mission/active')
            }}
          />
        </View>
      </Modal>

      <DeleteArchiveDialog
        item={confirmDelete ? item : null}
        onClose={() => setConfirmDelete(false)}
        onDeleted={() => router.back()}
      />
    </SafeAreaView>
  )
}
