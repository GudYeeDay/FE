import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'

import { CheckboxCheckedIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

type CheckboxProps = {
  checked: boolean
  onChange: (next: boolean) => void
  /** 문자열이면 기본 스타일(ko 16), ReactNode 면 그대로 렌더 ([필수] 강조 등) */
  label?: ReactNode
  disabled?: boolean
  className?: string
}

/** Figma: checkbox, checkbox_label */
export function Checkbox({ checked, onChange, label, disabled, className }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      hitSlop={8}
      className={cn('flex-row items-start gap-1', disabled && 'opacity-50', className)}
    >
      <View className="size-6 items-center justify-center">
        {checked ? (
          <CheckboxCheckedIcon width={24} height={24} />
        ) : (
          <View className="size-[18px] rounded-sm border-2 border-ink-soft" />
        )}
      </View>
      {typeof label === 'string' ? (
        <Text className="font-ko text-ko-16 text-ink">{label}</Text>
      ) : (
        label
      )}
    </Pressable>
  )
}
