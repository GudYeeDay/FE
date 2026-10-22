import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'

import { Header } from '@/components'
import { NotificationRow } from '@/components/notification/NotificationRow'
import { useNotifications } from '@/features/notification/store'

/** Figma: 알림함 (상세). 제목·시간 아래 본문 */
export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const notification = useNotifications().find((n) => n.id === id)

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <Header title="알림" align="center" />
      {notification ? (
        <ScrollView contentContainerClassName="px-5 pb-10">
          <NotificationRow notification={notification} compact />
          {/* TODO: 알림 상세 본문은 API 응답의 본문으로 교체 */}
          <Text className="mt-[22px] font-ko text-ko-12 text-ink">{notification.body}</Text>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="font-ko text-ko-14 text-ink-soft">알림을 찾을 수 없어요</Text>
        </View>
      )}
    </SafeAreaView>
  )
}
