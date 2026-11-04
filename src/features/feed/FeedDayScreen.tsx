import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter, type Href } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import RecordThumb from '../../../assets/images/record-thumb.svg'
import { ChevronLeftIcon } from '@/components/icons'
import { formatDotDate } from '@/features/mission/date'
import { useMissions } from '@/features/mission/local'
import { colors } from '@/theme'

/** 캘린더에서 연 날짜의 완료 기록 */
export function FeedDayScreen() {
  const router = useRouter()
  const { date } = useLocalSearchParams<{ date: string }>()
  const { feeds } = useMissions()
  const posts = feeds.filter((feed) => feed.date === date)

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="h-14 items-center justify-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={12}
          className="absolute left-4"
          onPress={() => router.back()}
        >
          <ChevronLeftIcon width={24} height={24} color={colors.ink.DEFAULT} />
        </Pressable>
        <Text className="font-ko-medium text-ko-14 text-ink">{date ? formatDotDate(date) : '데일리 피드'}</Text>
      </View>
      {posts.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="font-ko text-ko-14 text-ink-soft">이 날짜의 기록이 없어요</Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-4 px-5 pb-10">
          {posts.map((feed) => (
            <Pressable
              key={feed.id}
              accessibilityRole="button"
              className="overflow-hidden rounded-2xl bg-bg"
              onPress={() => router.push(`/feed/post/${feed.id}` as Href)}
            >
              {feed.photoUri ? (
                <Image source={{ uri: feed.photoUri }} style={{ width: '100%', height: 180 }} resizeMode="cover" />
              ) : (
                <RecordThumb width={350} height={180} preserveAspectRatio="xMidYMid slice" />
              )}
              <View className="px-4 py-4">
                <Text className="font-ko-bold text-ko-16 text-ink">{feed.title}</Text>
                {feed.place ? <Text className="mt-1 font-ko text-ko-12 text-ink-soft">{feed.place}</Text> : null}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
