import { useState } from 'react'
import { Alert, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'

import { Button } from '@/components'
import { FormScreen } from '@/components/auth/FormScreen'
import { errorText } from '@/api/http'
import { useCreateCustomMission } from '@/features/archive/api'
import { colors } from '@/theme'

const TITLE_MAX = 30
const DESCRIPTION_MAX = 100

/**
 * Figma: 커스텀 미션 추가. 만들면 보관함에 저장된다.
 * Figma 의 "미션 수정" 은 서버에 수정 API 가 없어 아직 없다. 서버는 이름·설명 둘 다 필수로 받는다
 */
export default function CustomMissionScreen() {
  const router = useRouter()
  const create = useCreateCustomMission()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const canSubmit = title.trim().length > 0 && description.trim().length > 0 && !create.isPending

  const submit = () => {
    create.mutate(
      { title: title.trim(), description: description.trim() },
      {
        onSuccess: () => router.back(),
        onError: (error) => Alert.alert('미션을 추가하지 못했어요', errorText(error)),
      },
    )
  }

  return (
    <FormScreen
      title="커스텀 미션 추가"
      footer={
        <Button disabled={!canSubmit} onPress={submit}>
          추가하기
        </Button>
      }
    >
      <Text className="font-ko-medium text-ko-14 text-ink">미션 이름</Text>
      <TextInput
        className="mt-3 h-[43px] rounded-lg border border-line px-4 font-en text-en-14 text-ink"
        placeholder="예: 좋아하는 카페 걸어서 가보기"
        placeholderTextColor={colors.ink.faint}
        maxLength={TITLE_MAX}
        value={title}
        onChangeText={setTitle}
        autoCorrect={false}
        returnKeyType="next"
      />

      <Text className="mt-10 font-ko-medium text-ko-14 text-ink">미션 설명</Text>
      <View className="mt-3 h-[96px] rounded-lg border border-line px-4 py-3">
        <TextInput
          className="flex-1 p-0 font-en text-en-14 text-ink"
          placeholder="미션 진행 방법을 적어주세요"
          placeholderTextColor={colors.ink.faint}
          maxLength={DESCRIPTION_MAX}
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
          autoCorrect={false}
        />
      </View>
    </FormScreen>
  )
}
