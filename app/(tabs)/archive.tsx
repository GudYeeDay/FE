import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { ArchiveRow } from '@/components/archive/ArchiveRow'
import { ArchiveTabs, type ArchiveFilter } from '@/components/archive/ArchiveTabs'
import { PenIcon, PlusLineIcon, TrashIcon } from '@/components/icons'
import { BottomSheet, BottomSheetItem } from '@/components/ui/BottomSheet'
import { DeleteArchiveDialog } from '@/components/archive/DeleteArchiveDialog'
import { useMissionStore } from '@/features/mission/store'
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
  const archive = useMissionStore((s) => s.archive)
  const [filter, setFilter] = useState<ArchiveFilter>('all')
  const [sheetItem, setSheetItem] = useState<ArchiveItem | null>(null)
  const [deleteItem, setDeleteItem] = useState<ArchiveItem | null>(null)

  const items = useMemo(
    () => (filter === 'all' ? archive : archive.filter((a) => a.status === filter)),
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

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center pb-24">
          <Text className="font-en-medium text-en-16 text-ink-soft">{EMPTY_MESSAGE[filter]}</Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-5 pb-28" showsVerticalScrollIndicator={false}>
          {items.map((item, index) => (
            <ArchiveRow
              key={item.mission.id + item.status}
              index={index}
              item={item}
              // TODO: 완료한 미션은 "미션 완료 기록" 화면으로 연결
              onPress={
                item.status === 'saved'
                  ? () => router.push(`/archive/${item.mission.id}`)
                  : undefined
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
        title={sheetItem?.mission.title}
      >
        {/* 완료한 미션은 수정할 수 없고 삭제만 가능 (Figma 2번째 시트) */}
        {sheetItem?.status === 'saved' ? (
          <BottomSheetItem
            icon={<PenIcon width={24} height={24} color={colors.ink.DEFAULT} />}
            label="수정하기"
            onPress={() => {
              const id = sheetItem.mission.id
              setSheetItem(null)
              router.push({ pathname: '/mission/new', params: { id } })
            }}
          />
        ) : null}
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
