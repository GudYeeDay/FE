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
  /**
   * 제목 정렬. 새 시안(로그인·회원가입 흐름)은 가운데 정렬이다.
   * TODO: 다른 화면도 새 시안이 확인되면 기본값을 center 로 바꾼다
   */
  align?: 'left' | 'center'
  className?: string
}

/** Figma: Header (높이 56, 좌측 chevron + 타이틀) */
export function Header({
  title,
  showBack = true,
  onBack,
  right,
  align = 'left',
  className,
}: HeaderProps) {
  const router = useRouter()

  if (align === 'center') {
    // 좌우 24px 자리를 똑같이 잡아서 제목이 화면 정가운데에 오게 한다
    return (
      <View className={cn('h-14 flex-row items-center justify-between bg-white px-4', className)}>
        <View className="w-6">
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
        </View>
        <Text className="flex-1 text-center font-ko-medium text-ko-14 text-ink" numberOfLines={1}>
          {title}
        </Text>
        <View className="w-6 items-end">{right}</View>
      </View>
    )
  }

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
