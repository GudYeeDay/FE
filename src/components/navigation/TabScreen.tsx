import type { ReactNode } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Header } from '@/components/navigation/Header'

type TabScreenProps = {
  title: string
  children: ReactNode
}

/** 하단 탭 화면: 뒤로가기 없는 헤더 + 본문 */
export function TabScreen({ title, children }: TabScreenProps) {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <Header title={title} showBack={false} />
      {children}
    </SafeAreaView>
  )
}
