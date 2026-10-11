import { useState } from 'react'
import { Tabs } from 'expo-router'

import { BottomTabBar } from '@/components'
import { MissionRecommendModal } from '@/components/mission/MissionRecommendModal'

export default function TabsLayout() {
  const [recommendOpen, setRecommendOpen] = useState(false)

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <BottomTabBar {...props} onPressCenter={() => setRecommendOpen(true)} />}
      >
        <Tabs.Screen name="index" options={{ title: '홈' }} />
        <Tabs.Screen name="calendar" options={{ title: '캘린더' }} />
        <Tabs.Screen name="archive" options={{ title: '보관함' }} />
        <Tabs.Screen name="my" options={{ title: '마이페이지' }} />
      </Tabs>
      <MissionRecommendModal visible={recommendOpen} onClose={() => setRecommendOpen(false)} />
    </>
  )
}
