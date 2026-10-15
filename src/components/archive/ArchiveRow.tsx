import { Pressable, Text, View } from 'react-native'

import { MoreVerticalIcon } from '@/components/icons'
import { formatMonthDay } from '@/features/mission/store'
import type { ArchiveItem } from '@/features/mission/types'
import { cn } from '@/lib/cn'
import { colors } from '@/theme'

type Props = {
  index: number
  item: ArchiveItem
  onPress?: () => void
  onPressMore: () => void
}

/** Figma: 미션 리스트 한 줄. 완료한 미션은 흐리게 + 빨간 취소선. */
export function ArchiveRow({ index, item, onPress, onPressMore }: Props) {
  const done = item.status === 'done'
  const dateLabel = done
    ? `${formatMonthDay(item.doneAt ?? item.savedAt)} 완료`
    : `${formatMonthDay(item.savedAt)} 저장`

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      className="flex-row items-start gap-[14px] border-b border-line py-4 active:bg-bg"
    >
      <Text
        className={cn(
          'w-[22px] font-ko-bold text-[16px] tracking-[0.38px]',
          done ? 'text-ink-faint' : 'text-ink',
        )}
      >
        {String(index + 1).padStart(2, '0')}
      </Text>
      <View className="flex-1">
        <Text
          numberOfLines={1}
          className={cn(
            'font-ko-bold text-[16px] leading-[24px] tracking-[0.38px]',
            done ? 'text-ink-faint' : 'text-ink',
          )}
          style={
            done
              ? { textDecorationLine: 'line-through', textDecorationColor: colors.main.soft }
              : undefined
          }
        >
          {item.mission.title}
        </Text>
        <Text className="mt-[25px] font-ko text-[14px] leading-[17.6px] tracking-[-0.344px] text-ink-soft">
          {dateLabel}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="더보기"
        hitSlop={10}
        onPress={onPressMore}
        className="h-6 w-6 items-center justify-center"
      >
        <MoreVerticalIcon width={4} height={20} color={colors.ink.faint} />
      </Pressable>
    </Pressable>
  )
}
