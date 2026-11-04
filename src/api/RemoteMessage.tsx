import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

export function RemoteMessage({ text, login = false }: { text: string; login?: boolean }) {
  const router = useRouter()

  return (
    <View className="w-full items-center py-16">
      <Text className="text-center font-ko text-ko-14 text-ink-soft">{text}</Text>
      {login ? (
        <Pressable
          accessibilityRole="button"
          className="mt-4"
          onPress={() => router.push('/login')}
        >
          <Text className="font-ko-medium text-ko-14 text-main">로그인하기</Text>
        </Pressable>
      ) : null}
    </View>
  )
}
