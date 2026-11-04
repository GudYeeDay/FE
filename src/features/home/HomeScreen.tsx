import { useMemo } from 'react'
import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter, type Href } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import RecordThumb from '../../../assets/images/record-thumb.svg'
import { todayKey, weekDates } from '@/features/mission/date'
import { useMissions, type FeedPost } from '@/features/mission/local'

function pickRandom<T>(items: T[], count: number) {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swap]] = [copy[swap], copy[index]]
  }
  return copy.slice(0, count)
}

export function HomeScreen() {
  const router = useRouter()
  const { feeds } = useMissions()
  const today = todayKey()
  const week = weekDates()

  const recordedDays = useMemo(() => new Set(feeds.map((feed) => feed.date)).size, [feeds])
  const weekFeeds = useMemo(
    () => week.flatMap((date) => feeds.filter((feed) => feed.date === date).slice(0, 1)),
    [feeds, week],
  )
  const past = useMemo(
    () => pickRandom(feeds.filter((feed) => feed.date < today), 5),
    [feeds, today],
  )

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScrollView className="min-h-0 flex-1" contentContainerClassName="px-5 pb-10 pt-3">
        <Text className="font-ko-bold text-[22px] leading-8 text-ink">홈</Text>
        <Text className="mt-2 font-ko text-ko-14 text-ink">
          <Text className="text-main">{recordedDays}일</Text> 기록
        </Text>

        <Text className="mt-8 font-ko-medium text-ko-14 text-ink">이번 주</Text>
        {weekFeeds.length === 0 ? (
          <Text className="mt-3 font-ko text-ko-14 text-ink-soft">이번 주 기록이 없어요</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            <View className="flex-row gap-2">
              {weekFeeds.map((feed) => (
                <Thumb
                  key={feed.date}
                  feed={feed}
                  onPress={() => router.push(`/feed/day/${feed.date}` as Href)}
                />
              ))}
            </View>
          </ScrollView>
        )}

        <Text className="mt-8 font-ko-medium text-ko-14 text-ink">지난 낭만들</Text>
        {past.length === 0 ? (
          <Text className="mt-3 font-ko text-ko-14 text-ink-soft">지난 낭만이 없어요</Text>
        ) : (
          <View className="mt-3 flex-row flex-wrap gap-2">
            {past.map((feed) => (
              <Thumb
                key={feed.id}
                feed={feed}
                onPress={() => router.push(`/feed/day/${feed.date}` as Href)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function Thumb({ feed, onPress }: { feed: FeedPost; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={feed.title}
      className="overflow-hidden rounded-xl"
      style={{ width: 88, height: 118 }}
      onPress={onPress}
    >
      {feed.photoUri ? (
        <Image source={{ uri: feed.photoUri }} style={{ width: 88, height: 118 }} resizeMode="cover" />
      ) : (
        <RecordThumb width={88} height={118} preserveAspectRatio="xMidYMid slice" />
      )}
    </Pressable>
  )
}
