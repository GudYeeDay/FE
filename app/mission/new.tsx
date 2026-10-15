import { useState } from 'react'
import { Text, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { Button } from '@/components'
import { FormScreen } from '@/components/auth/FormScreen'
import { missionActions, useMissionStore } from '@/features/mission/store'
import { colors } from '@/theme'

const TITLE_MAX = 30
const DESCRIPTION_MAX = 100

/** Figma: 커스텀 미션 추가. ?id= 가 있으면 같은 화면으로 수정한다. */
export default function CustomMissionScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const editing = useMissionStore((s) => s.archive.find((a) => a.mission.id === id))

  const [title, setTitle] = useState(editing?.mission.title ?? '')
  const [description, setDescription] = useState(editing?.mission.description ?? '')
  const canSubmit = title.trim().length > 0

  const submit = () => {
    const input = { title: title.trim(), description: description.trim() }
    // TODO: 커스텀 미션 생성/수정 API 연동
    if (editing) missionActions.update(editing.mission.id, input)
    else missionActions.addCustom(input)
    router.back()
  }

  return (
    <FormScreen
      title={editing ? '미션 수정' : '커스텀 미션 추가'}
      footer={
        <Button disabled={!canSubmit} onPress={submit}>
          {editing ? '수정하기' : '추가하기'}
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
