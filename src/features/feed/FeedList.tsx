import { ScrollView, Text, View } from 'react-native'

import { formatDotDate } from '@/features/mission/date'
import { useMissions, type FeedPost } from '@/features/mission/local'

export function FeedList() {
  const { feeds } = useMissions()

  return (
    <ScrollView className="min-h-0 flex-1" contentContainerClassName="gap-3 px-5 pb-8 pt-4">
      {feeds.length > 0 ? (
        feeds.map((post) => <FeedCard key={post.id} post={post} />)
      ) : (
        <Text className="py-16 text-center font-ko text-ko-14 text-ink-soft">
          데일리 피드가 없습니다.
        </Text>
      )}
    </ScrollView>
  )
}

function FeedCard({ post }: { post: FeedPost }) {
  return (
    <View className="rounded-lg bg-bg px-4 py-4">
      <Text className="font-en text-en-14 text-ink-soft">{formatDotDate(post.date)}</Text>
      <Text className="mt-2 font-ko-medium text-ko-14 text-ink">{post.title}</Text>
      <Text className="mt-2 font-ko text-ko-14 text-ink">{post.body}</Text>
    </View>
  )
}
