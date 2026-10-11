import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components'
import { useSession } from '@/features/auth/session'

// TODO: 마이페이지 디자인 작업 시 교체. 지금은 로그인 흐름 확인용 로그아웃 버튼만 둔다.
export default function MyScreen() {
  const { signOut } = useSession()

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white px-5">
      <View className="flex-1 items-center justify-center gap-6">
        <Text className="font-ko text-ko-14 text-ink-soft">마이페이지 화면 준비 중</Text>
        <Button variant="neutral" onPress={signOut}>
          로그아웃
        </Button>
      </View>
    </SafeAreaView>
  )
}
