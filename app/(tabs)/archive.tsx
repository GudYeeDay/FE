import { useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { ArchiveRow } from '@/components/archive/ArchiveRow'
import { ArchiveTabs, type ArchiveFilter } from '@/components/archive/ArchiveTabs'
import { PlusLineIcon, TrashIcon } from '@/components/icons'
import { BottomSheet, BottomSheetItem } from '@/components/ui/BottomSheet'
import { DeleteArchiveDialog } from '@/components/archive/DeleteArchiveDialog'
import { remoteErrorText } from '@/api/http'
import { useArchive } from '@/features/archive/api'
import type { ArchiveItem } from '@/features/mission/types'
import { colors } from '@/theme'

const EMPTY_MESSAGE: Record<ArchiveFilter, string> = {
  all: '아직 저장한 미션이 없어요',
  saved: '아직 남은 미션이 없어요',
  done: '아직 완료한 미션이 없어요',
}

/** Figma: 보관함 - 리스트 / 남은미션 / 완료미션 / 빈상태 */
export default function ArchiveScreen() {
  const router = useRouter()
  const { data: archive = [], isPending, isError, error, refetch } = useArchive()
  const [filter, setFilter] = useState<ArchiveFilter>('all')
  const [sheetItem, setSheetItem] = useState<ArchiveItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<ArchiveItem | null>(null)

  const items = useMemo(
    () =>
      archive.filter((a) =>
        filter === 'all' ? true : filter === 'done' ? a.status === 'done' : a.status !== 'done',
      ),
    [archive, filter],
  )

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="px-[23px] pt-6">
        <Text className="font-ko-bold text-ko-20 text-ink">보관함</Text>
        <Text className="mt-2 font-en text-en-14 text-ink">저장한 낭만 {archive.length}개</Text>
      </View>

      <View className="mt-[27px] px-5">
        <ArchiveTabs value={filter} onChange={setFilter} />
      </View>

      {isError ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => refetch()}
          className="flex-1 items-center justify-center pb-24"
        >
          <Text className="font-ko text-ko-14 text-ink-soft">{remoteErrorText(error)}</Text>
          <Text className="mt-2 font-ko text-ko-12 text-ink-faint">눌러서 다시 불러오기</Text>
        </Pressable>
      ) : isPending ? (
        <View className="flex-1 items-center justify-center pb-24">
          <ActivityIndicator color={colors.ink.faint} />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-24">
          <Text className="font-en-medium text-en-16 text-ink-soft">{EMPTY_MESSAGE[filter]}</Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-5 pb-28" showsVerticalScrollIndicator={false}>
          {items.map((item, index) => (
            <ArchiveRow
              key={item.bookmarkId}
              index={index}
              item={item}
              onPress={() =>
                router.push({
                  pathname: '/archive/[id]',
                  params: { id: item.bookmarkId, status: item.status, date: item.date },
                })
              }
              onPressMore={() => setSheetItem(item)}
            />
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="커스텀 미션 추가"
            hitSlop={10}
            onPress={() => router.push('/mission/new')}
            className="mt-5 self-start active:opacity-60"
          >
            <PlusLineIcon width={24} height={24} color={colors.ink.soft} />
          </Pressable>
        </ScrollView>
      )}

      <BottomSheet
        visible={!!sheetItem}
        onClose={() => setSheetItem(null)}
        title={sheetItem?.title}
      >
        {/* Figma 에는 저장한 미션 "수정하기" 가 있지만 서버에 수정 API 가 없어 삭제만 둔다 */}
        <BottomSheetItem
          icon={<TrashIcon width={24} height={24} color={colors.brand[80]} />}
          label="삭제하기"
          destructive
          onPress={() => {
            setDeleteItem(sheetItem)
            setSheetItem(null)
          }}
        />
      </BottomSheet>

      <DeleteArchiveDialog item={deleteItem} onClose={() => setDeleteItem(null)} />
    </SafeAreaView>
  )
}
