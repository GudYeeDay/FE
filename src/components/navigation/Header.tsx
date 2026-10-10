import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

import { ChevronLeftIcon } from '@/components/icons'
import { cn } from '@/lib/cn'
import { colors } from '@/theme'

type HeaderProps = {
  title?: string
  /** 기본값 true. 뒤로가기 버튼 표시 */
  showBack?: boolean
  /** 지정하지 않으면 router.back() */
  onBack?: () => void
  /** 우측 영역 (더보기 버튼 등) */
  right?: ReactNode
  className?: string
}

/** Figma: Header (높이 56, 좌측 chevron + 타이틀) */
export function Header({ title, showBack = true, onBack, right, className }: HeaderProps) {
  const router = useRouter()

  return (
    <View className={cn('h-14 flex-row items-center gap-[18px] bg-white px-4', className)}>
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={12}
          onPress={onBack ?? (() => router.back())}
        >
          <ChevronLeftIcon width={24} height={24} color={colors.ink.DEFAULT} />
        </Pressable>
      ) : null}
      {title ? (
        <Text className="flex-1 font-ko-medium text-ko-14 text-ink" numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View className="flex-1" />
      )}
      {right}
    </View>
  )
}
