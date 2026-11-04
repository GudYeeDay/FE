import { useState } from 'react'
import { ActivityIndicator, Alert, Modal, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { errorText, remoteErrorText } from '@/api/http'
import { Header } from '@/components'
import { FeedItem, type AnchorRect } from '@/components/record/FeedItem'
import { FeedMenu } from '@/components/record/FeedMenu'
import { Dialog } from '@/components/ui/Dialog'
import { useMyProfile } from '@/features/my/api'
import { useDailyFeed, useDeleteRecord } from '@/features/record/api'
import type { MissionRecord } from '@/features/record/types'
import { colors } from '@/theme'

/**
 * Figma: 데일리 피드 / 피드 여러개인 경우 / 데일리 피드 - 캘린더.
 * 그날 남긴 기록을 위아래로 이어서 보여준다. 최근 기록이 위.
 * 대표 사진은 가장 최근 기록 (직접 지정하는 API 가 아직 없다)
 * 닫기: 기록 저장 직후에 열렸으면 홈으로, 그 밖에는 이전 화면(홈·캘린더)으로.
 */
export default function DailyFeedScreen() {
  const router = useRouter()
  const { date, from } = useLocalSearchParams<{ date: string; from?: 'record' }>()
  const { data: dayRecords = [], isPending, isError, error } = useDailyFeed(date)
  const nickname = useMyProfile().data?.name ?? ''
  const deleteRecord = useDeleteRecord()

  const [menu, setMenu] = useState<{ record: MissionRecord; anchor: AnchorRect } | null>(null)
  const [deleting, setDeleting] = useState<MissionRecord | null>(null)

  const close = () => {
    if (from === 'record' || !router.canGoBack()) {
      router.dismissAll()
      router.navigate('/')
    } else {
      router.back()
    }
  }

  if (dayRecords.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header title="" onBack={close} />
        <View className="flex-1 items-center justify-center">
          {isPending ? (
            <ActivityIndicator color={colors.ink.faint} />
          ) : (
            <Text className="font-ko text-ko-14 text-ink-soft">
              {isError ? remoteErrorText(error) : '이날 남긴 기록이 없어요'}
            </Text>
          )}
        </View>
      </SafeAreaView>
    )
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView
          contentContainerClassName="gap-10 pt-4 pb-12"
          showsVerticalScrollIndicator={false}
        >
          {dayRecords.map((record, i) => (
            <FeedItem
              key={record.id}
              record={record}
              nickname={nickname}
              isCover={i === 0}
              onPressMore={(anchor) => setMenu({ record, anchor })}
              onClose={i === 0 ? close : undefined}
            />
          ))}
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={!!deleting}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setDeleting(null)}
      >
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(28, 28, 26, 0.7)' }}
        >
          <Dialog
            showMark={false}
            title="이 기록을 삭제할까요?"
            message={'사진과 글을 포함한 기록이 완전히 삭제되어\n되돌릴 수 없어요'}
            cancelLabel="취소"
            confirmLabel="삭제하기"
            onCancel={() => setDeleting(null)}
            onConfirm={() => {
              if (!deleting || deleteRecord.isPending) return
              const wasLast = dayRecords.length === 1
              deleteRecord.mutate(deleting.id, {
                onSuccess: () => {
                  setDeleting(null)
                  if (wasLast) close()
                },
                onError: (e) => {
                  setDeleting(null)
                  Alert.alert('기록을 삭제하지 못했어요', errorText(e))
                },
              })
            }}
          />
        </View>
      </Modal>

      <FeedMenu
        anchor={menu?.anchor ?? null}
        onClose={() => setMenu(null)}
        onSaveImage={() => {
          const id = menu!.record.id
          setMenu(null)
          router.push({ pathname: '/record/share', params: { id, date } })
        }}
        onEdit={() => {
          const id = menu!.record.id
          setMenu(null)
          router.push({ pathname: '/record/new', params: { id, date } })
        }}
        onDelete={() => {
          setDeleting(menu!.record)
          setMenu(null)
        }}
      />
    </View>
  )
}
