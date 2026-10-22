import { Pressable, Text, View } from 'react-native'

import { NotificationMarkIcon } from '@/components/icons'
import type { AppNotification } from '@/features/notification/store'
import { cn } from '@/lib/cn'

type Props = {
  notification: AppNotification
  onPress?: () => void
  /** 상세 화면 상단에서 쓸 때: 본문 없이 제목·시간만 */
  compact?: boolean
}

/** Figma: List (알림함 한 줄). 아이콘 + 제목 + 본문 + 시간, 새 알림은 오른쪽 빨간 점 */
export function NotificationRow({ notification: n, onPress, compact }: Props) {
  const read = n.status === 'read' && !compact

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${n.status === 'new' ? '새 알림, ' : ''}${n.title}`}
      disabled={!onPress}
      onPress={onPress}
      className={cn(
        'flex-row gap-4 border-b border-line active:bg-bg',
        n.status === 'new' || compact ? 'pb-4 pt-6' : 'py-6',
      )}
    >
      <NotificationMarkIcon width={24} height={24} />
      <View className="flex-1">
        <View className="flex-row items-start justify-between">
          <Text
            className={cn(
              'flex-1 pr-3 font-ko-medium text-ko-14',
              read ? 'text-ink-soft' : 'text-ink',
            )}
            numberOfLines={2}
          >
            {n.title}
          </Text>
          {n.status === 'new' && !compact ? (
            <View className="mt-1 h-2 w-2 rounded-full bg-main" />
          ) : null}
        </View>
        {!compact ? (
          <Text
            className={cn('mt-1 font-ko text-ko-12', read ? 'text-ink-faint' : 'text-ink-soft')}
            numberOfLines={2}
          >
            {n.body}
          </Text>
        ) : null}
        <Text
          className={cn(
            'font-ko text-[10px] leading-[17.6px] text-ink-faint',
            compact ? 'mt-3' : 'mt-6',
          )}
        >
          {n.timeLabel}
        </Text>
      </View>
    </Pressable>
  )
}
