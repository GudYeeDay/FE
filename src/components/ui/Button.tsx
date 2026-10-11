import { Pressable, Text, type PressableProps } from 'react-native'

import { cn } from '@/lib/cn'

type ButtonProps = Omit<PressableProps, 'children'> & {
  children: string
  /** lg: 하단 CTA(높이 54) / sm: 인풋 옆 인증요청(높이 43) */
  size?: 'lg' | 'sm'
  /**
   * primary: Main 배경 + 흰 글씨 (비활성 시 Ink-faint)
   * neutral: Line 배경 + Ink 글씨 (Apple로 시작하기)
   * subtle: bg 배경 + Ink 글씨 (Google/이메일로 시작하기)
   */
  variant?: 'primary' | 'neutral' | 'subtle'
  className?: string
}

const variantBg = {
  primary: 'bg-main',
  neutral: 'bg-line',
  subtle: 'bg-bg',
} as const

/** Figma: Component 18/19/20(하단 CTA), 인증요청 버튼 */
export function Button({
  children,
  size = 'lg',
  variant = 'primary',
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const isPrimary = variant === 'primary'

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      className={cn(
        'items-center justify-center rounded-lg px-4 active:opacity-80',
        size === 'lg' ? 'h-[54px] w-full' : 'h-[43px]',
        disabled ? 'bg-ink-faint' : variantBg[variant],
        className,
      )}
      {...rest}
    >
      <Text
        className={cn(
          isPrimary ? 'text-white' : 'text-ink',
          !isPrimary
            ? 'font-en-medium text-en-14'
            : size === 'lg'
              ? 'font-ko-medium text-ko-14'
              : 'font-ko text-ko-12',
        )}
      >
        {children}
      </Text>
    </Pressable>
  )
}
