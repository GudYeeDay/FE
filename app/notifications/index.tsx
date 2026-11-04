import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { remoteErrorText } from '@/api/http'
import { Header } from '@/components'
import { NotificationRow } from '@/components/notification/NotificationRow'
import { useNotifications } from '@/features/notification/api'
import { colors } from '@/theme'

/** Figma: 알림함 (목록) */
export default function NotificationsScreen() {
  const router = useRouter()
  const { data: notifications = [], isPending, isError, error } = useNotifications()

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <Header title="알림" align="center" />
      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          {isPending ? (
            <ActivityIndicator color={colors.ink.faint} />
          ) : (
            <Text className="font-en-medium text-en-16 text-ink-soft">
              {isError ? remoteErrorText(error) : '아직 받은 알림이 없어요'}
            </Text>
          )}
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-5 pb-10">
          {notifications.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onPress={() => router.push(`/notifications/${n.id}`)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
