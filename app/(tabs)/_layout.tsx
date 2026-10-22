import { useState } from 'react'
import { Tabs, useRouter } from 'expo-router'

import { BottomTabBar } from '@/components'
import { MissionRecommendModal } from '@/components/mission/MissionRecommendModal'
import { useMissionStore } from '@/features/mission/store'

export default function TabsLayout() {
  const router = useRouter()
  const [recommendOpen, setRecommendOpen] = useState(false)
  const hasActiveMission = useMissionStore((s) => s.active !== null)

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        // 진행중 미션처럼 숨은 탭에서 뒤로 가면 직전 탭으로 돌아가게 한다
        backBehavior="history"
        tabBar={(props) => (
          <BottomTabBar
            {...props}
            // 진행 중인 미션이 있으면 가운데 버튼이 로딩 상태가 되고, 누르면 진행 중 미션으로 간다
            centerState={hasActiveMission ? 'inProgress' : 'add'}
            onPressCenter={() =>
              hasActiveMission ? router.push('/mission/active') : setRecommendOpen(true)
            }
          />
        )}
      >
        <Tabs.Screen name="index" options={{ title: '홈' }} />
        <Tabs.Screen name="calendar" options={{ title: '캘린더' }} />
        <Tabs.Screen name="archive" options={{ title: '보관함' }} />
        <Tabs.Screen name="my" options={{ title: '마이페이지' }} />
        {/* 탭 아이콘은 없지만 탭바는 보이는 화면 */}
        <Tabs.Screen name="mission/active" options={{ href: null }} />
      </Tabs>
      <MissionRecommendModal visible={recommendOpen} onClose={() => setRecommendOpen(false)} />
    </>
  )
}
