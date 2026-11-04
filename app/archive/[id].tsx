import { useState } from 'react'
import { ActivityIndicator, Alert, Modal, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { errorText } from '@/api/http'
import { Button, Header } from '@/components'
import { DeleteArchiveDialog } from '@/components/archive/DeleteArchiveDialog'
import { TitleBarIcon } from '@/components/icons'
import { MissionStarted } from '@/components/mission/MissionStarted'
import { Dialog } from '@/components/ui/Dialog'
import { useBookmark, useStartBookmark } from '@/features/archive/api'
import { isAlreadyInProgress, useActiveMission } from '@/features/mission/api'
import type { ArchiveItem, ArchiveStatus } from '@/features/mission/types'
import { formatMonthDay } from '@/lib/date'
import { colors } from '@/theme'

type Params = { id: string; status?: ArchiveStatus; date?: string }

/**
 * Figma: 저장한 미션 상세 / 완료 미션 상세 (?status=done).
 * 목록에서 상태와 날짜(월.일)를 넘겨받는다. 상세 API 에는 저장일만 있어서 완료일은 목록 값을 쓴다
 */
export default function ArchiveMissionScreen() {
  const router = useRouter()
  const { id, status = 'saved', date } = useLocalSearchParams<Params>()
  const bookmarkId = Number(id)
  const { data: detail, isPending, isError } = useBookmark(bookmarkId)
  const activeMission = useActiveMission().data
  const start = useStartBookmark()
  const done = status === 'done'
  const title = done ? '완료 미션' : '저장한 미션'

  const [started, setStarted] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (started && detail) {
    return (
      <MissionStarted
        title={detail.title}
        onGoHome={() => {
          router.dismissAll()
          router.navigate('/')
        }}
      />
    )
  }

  if (!detail) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header title={title} align="center" />
        <View className="flex-1 items-center justify-center">
          {isPending && !isError ? (
            <ActivityIndicator color={colors.ink.faint} />
          ) : (
            <Text className="font-ko text-ko-14 text-ink-soft">미션을 찾을 수 없어요</Text>
          )}
        </View>
      </SafeAreaView>
    )
  }

  const item: ArchiveItem = {
    bookmarkId,
    missionId: detail.missionId,
    title: detail.title,
    status,
    date: date ?? detail.savedDate,
  }
  const isActive = status === 'inProgress' || activeMission?.id === detail.missionId

  const onStart = () => {
    if (start.isPending) return
    if (activeMission) {
      setBlocked(true)
      return
    }
    start.mutate(bookmarkId, {
      onSuccess: () => setStarted(true),
      onError: (error) => {
        if (isAlreadyInProgress(error)) setBlocked(true)
        else Alert.alert('미션을 시작하지 못했어요', errorText(error))
      },
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title={title} align="center" />
      <View className="flex-1 px-5 pt-4">
        <View className="flex-row items-center gap-3 rounded-lg border border-line px-4 py-2.5">
          <TitleBarIcon width={2} height={14} />
          <Text className="font-en text-en-14 text-ink-soft">
            {formatMonthDay(item.date, '. ')}에 {done ? '완료함' : '저장함'}
          </Text>
        </View>
        <Text className="mt-[26px] font-ko-bold text-ko-20 text-ink">{detail.title}</Text>
        <Text className="mt-2 font-en text-en-14 leading-[17px] text-[#AFAFAF]">
          {detail.description}
        </Text>
      </View>

      {/* 완료한 미션은 다시 시작하거나 여기서 지울 수 없다 (Figma 완료 미션 상세에는 버튼이 없음) */}
      {done ? null : (
        <View className="items-center px-[30px] pb-4">
          {isActive ? (
            <Button onPress={() => router.push('/mission/active')}>진행중인 미션 보기</Button>
          ) : (
            <Button disabled={start.isPending} onPress={onStart}>
              이 미션으로 시작하기
            </Button>
          )}
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setConfirmDelete(true)}
            className="mt-[21px]"
          >
            <Text className="font-ko-medium text-ko-14 text-ink-faint">보관함에서 삭제하기</Text>
          </Pressable>
        </View>
      )}

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
