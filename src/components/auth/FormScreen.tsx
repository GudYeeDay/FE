import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { Header } from '@/components/navigation/Header'

type Props = {
  title: string
  children: ReactNode
  /** 화면 하단에 고정되는 영역 (CTA 버튼 등) */
  footer?: ReactNode
  /** 스크롤 영역 여백을 바꿀 때 지정 (기본값 'px-5 pt-6 pb-8'을 대신한다) */
  contentClassName?: string
}

/**
 * 헤더 + 스크롤되는 입력 폼 + 하단 고정 버튼.
 * Figma 기준: 폼 좌우 20, 첫 입력칸은 헤더 아래 24, 하단 버튼 좌우 30·아래 36.
 */
export function FormScreen({ title, children, footer, contentClassName }: Props) {
  const { bottom } = useSafeAreaInsets()

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <Header title={title} align="center" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName={contentClassName ?? 'px-5 pt-6 pb-8'}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        {footer ? (
          <View className="px-[30px] pt-3" style={{ paddingBottom: Math.max(bottom, 16) + 2 }}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
