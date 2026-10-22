import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter'
import {
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
} from '@expo-google-fonts/noto-sans-kr'
import { QueryClientProvider } from '@tanstack/react-query'

import { SessionProvider, useSession } from '@/features/auth/session'
import { queryClient } from '@/lib/query-client'
import { useAppStateFocus } from '@/hooks/useAppState'
import '../global.css'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useAppStateFocus()

  const [fontsLoaded, fontError] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync()
  }, [fontsLoaded, fontError])

  // 폰트 로드 전에는 스플래시 유지 (폰트 없이 그려진 뒤 깜빡이는 것 방지)
  if (!fontsLoaded && !fontError) return null

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </SessionProvider>
    </QueryClientProvider>
  )
}

/** 로그인 전에는 (auth) 화면만, 로그인 후에는 탭 화면만 접근 가능 */
function RootNavigator() {
  const { isSignedIn } = useSession()

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="mission/new" />
        <Stack.Screen name="mission/active" />
        <Stack.Screen name="archive/[id]" />
        <Stack.Screen name="notifications/index" />
        <Stack.Screen name="notifications/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  )
}
