import { useState } from 'react'
import { Text, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { Button, TextField } from '@/components'
import { FormScreen } from '@/components/auth/FormScreen'
import { useMissions } from '@/features/mission/local'
import { colors } from '@/theme'

export function FeedEditScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { feeds, updateFeed } = useMissions()
  const feed = feeds.find((item) => item.id === id)
  const [title, setTitle] = useState(feed?.title ?? '')
  const [body, setBody] = useState(feed?.body ?? '')
  const [place, setPlace] = useState(feed?.place ?? '')

  if (!feed) {
    return (
      <FormScreen title="기록 수정">
        <Text className="font-ko text-ko-14 text-ink-soft">기록을 찾을 수 없습니다.</Text>
      </FormScreen>
    )
  }

  return (
    <FormScreen
      title="기록 수정"
      footer={
        <Button
          disabled={title.trim().length === 0}
          onPress={() => {
            updateFeed(feed.id, { title, body, place })
            router.back()
          }}
        >
          저장하기
        </Button>
      }
    >
      <TextField label="제목" value={title} onChangeText={setTitle} />
      <View className="mt-7">
        <Text className="mb-3 pl-1 font-ko-medium text-ko-14 text-ink">내용</Text>
        <TextInput
          multiline
          value={body}
          onChangeText={setBody}
          placeholder="오늘의 기록을 적어주세요"
          placeholderTextColor={colors.ink.faint}
          className="min-h-[96px] border-b border-line px-1 py-2 font-ko text-ko-14 text-ink"
          style={{ textAlignVertical: 'top' }}
        />
      </View>
      <TextField className="mt-7" label="장소" value={place} onChangeText={setPlace} />
    </FormScreen>
  )
}
