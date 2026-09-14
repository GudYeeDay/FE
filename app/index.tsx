import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'

// 환경 설정 확인용 샘플 쿼리. 실제 API가 붙으면 src/api/ 아래 훅으로 옮긴다.
function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300))
      return { status: 'ok', checkedAt: new Date().toLocaleTimeString() }
    },
  })
}

export default function HomeScreen() {
  const { data, isPending, refetch, isFetching } = useHealthCheck()

  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-6 bg-white px-8 dark:bg-neutral-950">
      <Text className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
        GudYeeDay
      </Text>
      <Text className="text-sm text-neutral-500">
        Expo · React Native · NativeWind · TanStack Query
      </Text>

      <View className="rounded-lg border border-neutral-200 px-6 py-4 dark:border-neutral-700">
        {isPending ? (
          <Text className="text-neutral-400">확인 중…</Text>
        ) : (
          <Text className="text-neutral-900 dark:text-white">
            status: <Text className="font-bold text-green-600">{data?.status}</Text> ·{' '}
            {data?.checkedAt}
          </Text>
        )}
      </View>

      <Pressable
        onPress={() => refetch()}
        disabled={isFetching}
        className="rounded-md bg-neutral-900 px-4 py-2 active:opacity-70 disabled:opacity-50 dark:bg-white"
      >
        <Text className="text-sm font-medium text-white dark:text-neutral-900">
          {isFetching ? '불러오는 중' : '다시 확인'}
        </Text>
      </Pressable>
    </SafeAreaView>
  )
}
