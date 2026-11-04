import { Text, View } from 'react-native'

import { TextField } from '@/components'
import { FormScreen } from '@/components/auth/FormScreen'
import { useProfile } from '@/features/my/profile'

export function EmailScreen() {
  const { email } = useProfile()

  return (
    <FormScreen title="메일 인증">
      <TextField label="이메일" value={email} readOnly />

      <Text className="mb-3 mt-8 font-ko-medium text-ko-14 text-ink">메일 인증 변경</Text>
      <View className="flex-row items-center rounded-xl border border-line bg-bg px-4 py-4">
        <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-main">
          <Text className="font-ko-bold text-ko-12 text-white">!</Text>
        </View>
        <Text className="flex-1 font-ko text-ko-12 leading-5 text-ink-soft">
          메일 인증을 바꾸면 이전 메일로는{'\n'}인증번호를 다시 받을 수 없어요
        </Text>
      </View>
    </FormScreen>
  )
}
