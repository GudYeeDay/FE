import { forwardRef, useState } from 'react'
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native'

import { EyeClosedIcon, EyeIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { colors } from '@/theme'

type TextFieldProps = Omit<TextInputProps, 'editable' | 'secureTextEntry'> & {
  label?: string
  /** 입력칸 아래 안내 문구 (예: 한글/영문 2~10자, 특수문자 사용 불가) */
  helperText?: string
  /** 값이 있으면 에러 상태: 밑줄과 하단 문구가 빨간색이 된다. helperText 보다 우선 */
  errorMessage?: string
  /** 비밀번호 입력: 우측 eye 토글 */
  secure?: boolean
  /** 읽기 전용 (Figma Readonly) */
  readOnly?: boolean
  /** 우측 액션 버튼 (Figma 인증요청) */
  action?: { label: string; onPress: () => void; disabled?: boolean }
  className?: string
}

/**
 * Figma: Component 25
 * 상태: Default(placeholder) / Focus / Filled / Readonly / Error
 * 변형: 기본, 비밀번호(-c, eye 토글), 이메일(-인증요청, 우측 버튼)
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    helperText,
    errorMessage,
    secure,
    readOnly,
    action,
    className,
    onFocus,
    onBlur,
    ...inputProps
  },
  ref,
) {
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(true)

  const hasError = !!errorMessage
  const bottomText = errorMessage ?? helperText

  const borderColor = hasError
    ? 'border-main-soft'
    : readOnly
      ? 'border-ink-faint'
      : focused
        ? 'border-ink'
        : 'border-line'

  return (
    <View className={cn('w-full', className)}>
      {label ? <Text className="mb-3 pl-1 font-ko-medium text-ko-14 text-ink">{label}</Text> : null}

      <View className="flex-row items-center gap-[11px]">
        <View
          className={cn(
            'h-[43px] flex-1 flex-row items-center border-b pl-1',
            secure ? 'pr-1' : 'pr-4',
            borderColor,
          )}
        >
          <TextInput
            ref={ref}
            editable={!readOnly}
            secureTextEntry={secure && hidden}
            placeholderTextColor={colors.ink.faint}
            onFocus={(e) => {
              setFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              onBlur?.(e)
            }}
            className={cn(
              'h-full flex-1 p-0 font-en text-en-14',
              readOnly ? 'text-ink-soft' : 'text-ink',
            )}
            {...inputProps}
          />
          {secure ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={hidden ? '비밀번호 보기' : '비밀번호 숨기기'}
              onPress={() => setHidden((v) => !v)}
              hitSlop={8}
            >
              {hidden ? (
                <EyeClosedIcon width={24} height={24} color={colors.ink.DEFAULT} />
              ) : (
                <EyeIcon width={24} height={24} color={colors.ink.DEFAULT} />
              )}
            </Pressable>
          ) : null}
        </View>

        {action ? (
          <Button
            size="sm"
            className="w-[86px]"
            disabled={action.disabled}
            onPress={action.onPress}
          >
            {action.label}
          </Button>
        ) : null}
      </View>

      {bottomText ? (
        <Text
          className={cn(
            'mt-1 px-1 font-en text-en-14',
            hasError ? 'text-main-soft' : 'text-ink-faint',
          )}
        >
          {bottomText}
        </Text>
      ) : null}
    </View>
  )
})
