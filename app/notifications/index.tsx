import { useEffect } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { Header } from '@/components'
import { NotificationRow } from '@/components/notification/NotificationRow'
import { notificationActions, useNotifications } from '@/features/notification/store'

/** Figma: 알림함 (목록) */
export default function NotificationsScreen() {
  const router = useRouter()
  const notifications = useNotifications()

  // 화면을 떠날 때 새 알림을 "본 알림"으로 바꾼다. 보는 동안에는 빨간 점을 유지
  useEffect(() => () => notificationActions.markAllSeen(), [])

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <Header title="알림" align="center" />
      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="font-en-medium text-en-16 text-ink-soft">아직 받은 알림이 없어요</Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-5 pb-10">
          {notifications.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onPress={() => {
                notificationActions.markRead(n.id)
                router.push(`/notifications/${n.id}`)
              }}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
