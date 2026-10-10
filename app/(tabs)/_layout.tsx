import { Tabs, useRouter } from 'expo-router'

import { BottomTabBar } from '@/components'

export default function TabsLayout() {
  const router = useRouter()

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <BottomTabBar {...props} onPressCenter={() => router.push('/mission/new')} />
      )}
    >
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="calendar" options={{ title: '캘린더' }} />
      <Tabs.Screen name="archive" options={{ title: '보관함' }} />
      <Tabs.Screen name="my" options={{ title: '마이페이지' }} />
    </Tabs>
  )
}
