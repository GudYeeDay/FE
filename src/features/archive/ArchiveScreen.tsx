import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter, type Href } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { RemoteMessage } from '@/api/RemoteMessage'
import { remoteErrorText, useSignedIn } from '@/api/http'
import type { BookmarkFilter, BookmarkItem } from '@/api/types'
import { ArchiveEmptyIcon, MoreVerticalIcon } from '@/components/feature-icons'
import { useBookmarks, useDeleteBookmark } from '@/features/archive/api'
import { useBookmarkEdits } from '@/features/archive/edits'
import { DeleteMissionDialog, MissionMoreSheet } from '@/features/archive/MissionMoreSheet'
import { cn } from '@/lib/cn'
import { colors } from '@/theme'

const TABS = [
  { key: 'ALL', label: '전체' },
  { key: 'REMAINING', label: '저장 미션' },
  { key: 'COMPLETED', label: '완료 미션' },
] as const satisfies { key: BookmarkFilter; label: string }[]

type TabKey = (typeof TABS)[number]['key']

function statusLabel(status: BookmarkItem['status']) {
  if (status === 'COMPLETED') return '완료'
  if (status === 'IN_PROGRESS') return '진행중'
  return '저장'
}

export function ArchiveScreen() {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>('ALL')
  const [moreMission, setMoreMission] = useState<BookmarkItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BookmarkItem | null>(null)
  const query = useBookmarks(tab)
  const edits = useBookmarkEdits()
  const signedIn = useSignedIn()
  const remove = useDeleteBookmark()

  const visible = query.data?.bookmarks ?? []
  const total = query.data?.totalCount ?? 0

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="px-5 pt-3">
        <Text className="font-ko-bold text-[22px] leading-8 text-ink">보관함</Text>
        <Text className="mt-2 font-ko text-ko-14 text-ink">
          보관한 낭만{' '}
          {query.data ? <Text className="text-main">{total}개</Text> : null}
        </Text>

        <View className="mt-8 flex-row gap-7 border-b border-line">
          {TABS.map((item) => {
            const selected = item.key === tab
            return (
              <Pressable
                key={item.key}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                className="pb-2.5"
                onPress={() => setTab(item.key)}
              >
                <Text
                  className={cn(
                    'text-ko-14',
                    selected ? 'font-ko-medium text-ink' : 'font-ko text-ink-soft',
                  )}
                >
                  {item.label}
                </Text>
                <View
                  className={cn(
                    'absolute bottom-0 h-0.5 w-full',
                    selected ? 'bg-main' : 'bg-transparent',
                  )}
                />
              </Pressable>
            )
          })}
        </View>
      </View>

      {!signedIn ? (
        <RemoteMessage text="로그인 후 볼 수 있어요" login />
      ) : query.isLoading ? (
        <RemoteMessage text="불러오는 중" />
      ) : query.isError ? (
        <RemoteMessage text={remoteErrorText(query.error)} />
      ) : visible.length === 0 ? (
        <View className="min-h-0 flex-1">
          <View className="flex-1 items-center justify-center px-5">
            <ArchiveEmptyIcon width={48} height={48} />
            <Text className="mt-4 font-ko text-ko-14 text-ink-soft">아직 보관한 미션이 없어요</Text>
          </View>
          {tab === 'ALL' ? <AddMissionButton onPress={() => router.push('/mission/custom')} /> : null}
        </View>
      ) : (
        <ScrollView
          className="min-h-0 w-full flex-1"
          contentContainerClassName="w-full px-5 pb-10"
          showsVerticalScrollIndicator={false}
        >
          {visible.map((mission, index) => (
            <ArchiveRow
              key={mission.bookmarkId}
              mission={{ ...mission, title: edits[String(mission.bookmarkId)]?.title ?? mission.title }}
              index={index}
              onPress={() =>
                router.push(`/archive/${mission.bookmarkId}?status=${mission.status}` as Href)
              }
              onMore={() => setMoreMission(mission)}
              showMore
              struck={tab === 'ALL' && mission.status === 'COMPLETED'}
            />
          ))}

          {tab === 'ALL' ? <AddMissionButton onPress={() => router.push('/mission/custom')} padded={false} /> : null}
        </ScrollView>
      )}
      <MissionMoreSheet
        mission={
          moreMission
            ? {
                title: edits[String(moreMission.bookmarkId)]?.title ?? moreMission.title,
                completed: moreMission.status === 'COMPLETED',
              }
            : null
        }
        onClose={() => setMoreMission(null)}
        onEdit={
          moreMission && moreMission.status !== 'COMPLETED'
            ? () => {
                const bookmarkId = moreMission.bookmarkId
                setMoreMission(null)
                router.push(`/mission/edit/${bookmarkId}` as Href)
              }
            : undefined
        }
        onDelete={() => {
          setDeleteTarget(moreMission)
          setMoreMission(null)
        }}
      />
      <DeleteMissionDialog
        visible={deleteTarget != null}
        record={deleteTarget?.status === 'COMPLETED'}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) remove.mutate(deleteTarget.bookmarkId)
          setDeleteTarget(null)
        }}
      />
    </SafeAreaView>
  )
}

function AddMissionButton({ onPress, padded = true }: { onPress: () => void; padded?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="커스텀 미션 추가"
      className={padded ? 'px-5 py-5' : 'py-5'}
      onPress={onPress}
    >
      <Text className="font-ko text-[22px] leading-7 text-ink">+</Text>
    </Pressable>
  )
}

function ArchiveRow({
  mission,
  index,
  onPress,
  onMore,
  showMore,
  struck,
}: {
  mission: BookmarkItem
  index: number
  onPress: () => void
  onMore: () => void
  showMore?: boolean
  /** 전체 탭의 완료 미션은 취소선 */
  struck?: boolean
}) {
  const completed = mission.status === 'COMPLETED'
  const number = String(index + 1).padStart(2, '0')
  const titleClass = struck
    ? 'font-ko-bold text-ink-soft line-through'
    : completed
      ? 'font-ko text-ink-soft'
      : 'font-ko-bold text-ink'

  return (
    <View className="w-full flex-row items-start border-b border-line py-5">
      <Pressable
        accessibilityRole="button"
        className="min-w-0 flex-1 flex-row items-start"
        onPress={onPress}
      >
        <Text className={cn('w-9 self-start text-ko-16', titleClass)}>{number}</Text>
        <View className="min-w-0 flex-1">
          <Text className={cn('text-ko-16', titleClass)}>{mission.title}</Text>
          <Text className="mt-6 font-ko text-ko-14 text-ink-soft">
            {mission.date} {statusLabel(mission.status)}
          </Text>
        </View>
      </Pressable>
      {showMore ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="더보기"
          hitSlop={8}
          className="ml-3 h-6 w-6 items-center justify-center"
          onPress={onMore}
        >
          <MoreVerticalIcon width={16} height={16} color={colors.ink.soft} />
        </Pressable>
      ) : null}
    </View>
  )
}
