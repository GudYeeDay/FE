import type { ReactNode } from 'react'
import { Pressable, Text } from 'react-native'

import { cn } from '@/lib/cn'

type Props = {
  children: string
  icon?: ReactNode
  /** primary: Main 배경 흰 글씨 (Apple) / subtle: 연회색 배경 (Google, 이메일) */
  variant?: 'primary' | 'subtle'
  onPress: () => void
}

/** Figma: 로그인 화면의 시작하기 버튼 (아이콘 + Inter Medium 14) */
export function SocialButton({ children, icon, variant = 'subtle', onPress }: Props) {
  const primary = variant === 'primary'
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(
        'h-[54px] w-full flex-row items-center justify-center gap-2 rounded-lg active:opacity-80',
        primary ? 'bg-main' : 'bg-[#F7F7F7]',
      )}
    >
      {icon}
      <Text className={cn('font-en-medium text-en-14', primary ? 'text-white' : 'text-ink')}>
        {children}
      </Text>
    </Pressable>
  )
}
