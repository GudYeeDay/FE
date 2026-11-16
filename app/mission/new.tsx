import { useState } from 'react'
import { ActivityIndicator, Alert, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { Button } from '@/components'
import { FormScreen } from '@/components/auth/FormScreen'
import { ApiError, errorText } from '@/api/http'
import type { BookmarkDetail } from '@/api/types'
import {
  NOT_CUSTOM_MISSION,
  useBookmark,
  useCreateCustomMission,
  useUpdateCustomMission,
} from '@/features/archive/api'
import { colors } from '@/theme'

const TITLE_MAX = 30
const DESCRIPTION_MAX = 100

/**
 * Figma: 커스텀 미션 추가 / 미션 수정.
 * ?id=<bookmarkId> 가 있으면 같은 화면으로 수정한다. 서버는 이름·설명 둘 다 필수로 받는다
 */
export default function CustomMissionScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const bookmarkId = id ? Number(id) : undefined
  const { data: editing, isPending } = useBookmark(bookmarkId)

  // 수정할 미션을 불러온 뒤에 폼을 그려서 처음 값이 채워지게 한다
  if (bookmarkId !== undefined && !editing) {
    return (
      <FormScreen title="미션 수정" footer={null}>
        <View className="items-center pt-10">
          {isPending ? (
            <ActivityIndicator color={colors.ink.faint} />
          ) : (
            <Text className="font-ko text-ko-14 text-ink-soft">미션을 찾을 수 없어요</Text>
          )}
        </View>
      </FormScreen>
    )
  }

  return <MissionForm editing={editing} />
}

function MissionForm({ editing }: { editing?: BookmarkDetail }) {
  const router = useRouter()
  const create = useCreateCustomMission()
  const update = useUpdateCustomMission()
  const [title, setTitle] = useState(editing?.title ?? '')
  const [description, setDescription] = useState(editing?.description ?? '')
  const pending = create.isPending || update.isPending
  const changed =
    !editing || title.trim() !== editing.title || description.trim() !== editing.description
  const canSubmit =
    title.trim().length > 0 && description.trim().length > 0 && changed && !pending

  const submit = () => {
    const input = { title: title.trim(), description: description.trim() }
    if (editing) {
      update.mutate(
        { bookmarkId: editing.bookmarkId, ...input },
        {
          onSuccess: () => router.back(),
          onError: (error) =>
            Alert.alert(
              '미션을 수정하지 못했어요',
              error instanceof ApiError && error.code === NOT_CUSTOM_MISSION
                ? '추천 미션은 수정할 수 없어요'
                : errorText(error),
            ),
        },
      )
      return
    }
    create.mutate(input, {
      onSuccess: () => router.back(),
      onError: (error) => Alert.alert('미션을 추가하지 못했어요', errorText(error)),
    })
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
