import { Pressable, Text, type PressableProps } from 'react-native'

import { cn } from '@/lib/cn'

type ButtonProps = Omit<PressableProps, 'children'> & {
  children: string
  /** lg: 하단 CTA(높이 54) / sm: 인풋 옆 인증요청(높이 43) */
  size?: 'lg' | 'sm'
  className?: string
}

/**
 * Figma: Component 18(시작하기), 인증요청 버튼.
 * 비활성은 Ink-faint, 활성은 Main.
 */
export function Button({ children, size = 'lg', disabled, className, ...rest }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      className={cn(
        'items-center justify-center rounded-lg px-4 active:opacity-80',
        size === 'lg' ? 'h-[54px] w-full' : 'h-[43px]',
        disabled ? 'bg-ink-faint' : 'bg-main',
        className,
      )}
      {...rest}
    >
      <Text
        className={cn(
          'text-white',
          size === 'lg' ? 'font-ko-medium text-ko-14' : 'font-ko text-ko-12',
        )}
      >
        {children}
      </Text>
    </Pressable>
  )
}
