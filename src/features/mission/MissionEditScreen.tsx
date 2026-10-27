import { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { RemoteMessage } from '@/api/RemoteMessage'
import { useSignedIn } from '@/api/http'
import { Button } from '@/components'
import { ChevronLeftIcon } from '@/components/icons'
import { saveBookmarkEdit, useBookmarkEdits } from '@/features/archive/edits'
import { useBookmark } from '@/features/archive/api'
import { colors } from '@/theme'

/** 저장 미션 수정. 서버에 수정 API가 없어 이 기기에 반영한다 */
export function MissionEditScreen() {
  const router = useRouter()
  const { bottom } = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const signedIn = useSignedIn()
  const query = useBookmark(id)
  const edits = useBookmarkEdits()
  const saved = id ? edits[id] : undefined
  const [title, setTitle] = useState('')
  const [memo, setMemo] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!query.data || ready) return
    setTitle(saved?.title ?? query.data.title)
    setMemo(saved?.description ?? query.data.description)
    setReady(true)
  }, [query.data, ready, saved?.description, saved?.title])

  const canSubmit = title.trim().length > 0

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="h-14 items-center justify-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={12}
          className="absolute left-4"
          onPress={() => router.back()}
        >
          <ChevronLeftIcon width={24} height={24} color={colors.ink.DEFAULT} />
        </Pressable>
        <Text className="font-ko-medium text-ko-14 text-ink">미션 수정</Text>
      </View>

      {!signedIn ? (
        <RemoteMessage text="로그인 후 볼 수 있어요" login />
      ) : query.isLoading ? (
        <RemoteMessage text="불러오는 중" />
      ) : !query.data ? (
        <RemoteMessage text="미션을 찾을 수 없습니다." />
      ) : (
        <>
          <ScrollView contentContainerClassName="px-5 pb-8 pt-2">
            <Text className="mb-2 font-ko-medium text-ko-14 text-ink">미션 이름</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="예: 좋아하는 카페 걸어서 가보기"
              placeholderTextColor={colors.ink.faint}
              className="rounded-xl border border-line px-4 py-3 font-ko text-ko-14 text-ink"
            />
            <Text className="mb-2 mt-6 font-ko-medium text-ko-14 text-ink">미션 설명</Text>
            <TextInput
              value={memo}
              onChangeText={setMemo}
              placeholder="미션 진행 방법을 적어주세요"
              placeholderTextColor={colors.ink.faint}
              multiline
              textAlignVertical="top"
              className="min-h-32 rounded-xl border border-line px-4 py-3 font-ko text-ko-14 text-ink"
            />
          </ScrollView>
          <View className="px-5 pt-3" style={{ paddingBottom: Math.max(bottom, 16) }}>
            <Button
              disabled={!canSubmit}
              onPress={() => {
                if (!id) return
                saveBookmarkEdit(id, { title: title.trim(), description: memo.trim() })
                router.back()
              }}
            >
              수정하기
            </Button>
          </View>
        </>
      )}
    </SafeAreaView>
  )
}
