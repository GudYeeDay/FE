import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { remoteErrorText } from '@/api/http'
import { Button } from '@/components'
import { ChevronLeftIcon } from '@/components/icons'
import { useCreateCustomMission } from '@/features/archive/api'
import { colors } from '@/theme'

/** 탭 바 가운데 + 로 나만의 미션을 보관함에 추가한다 */
export function NewMissionScreen() {
  const router = useRouter()
  const { bottom } = useSafeAreaInsets()
  const create = useCreateCustomMission()
  const [title, setTitle] = useState('')
  const [memo, setMemo] = useState('')

  const canSubmit = title.trim().length > 0 && !create.isPending

  const submit = () => {
    if (!canSubmit) return
    create.mutate(
      { title: title.trim(), description: memo.trim() },
      { onSuccess: () => router.back() },
    )
  }

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
        <Text className="font-ko-medium text-ko-14 text-ink">커스텀 미션 추가</Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="mb-2 font-ko-medium text-ko-14 text-ink">미션 이름</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="예: 좋아하는 카페 걸어서 가보기"
            placeholderTextColor={colors.ink.faint}
            className="h-12 rounded-lg border border-line px-3 font-ko text-ko-14 text-ink"
            autoCorrect={false}
          />

          <Text className="mb-2 mt-7 font-ko-medium text-ko-14 text-ink">미션 설명</Text>
          <TextInput
            value={memo}
            onChangeText={setMemo}
            placeholder="미션 진행 방법을 적어주세요"
            placeholderTextColor={colors.ink.faint}
            multiline
            textAlignVertical="top"
            className="h-28 rounded-lg border border-line px-3 py-3 font-ko text-ko-14 text-ink"
            autoCorrect={false}
          />
        </ScrollView>

        <View className="px-5 pt-3" style={{ paddingBottom: Math.max(bottom, 16) }}>
          {create.isError ? (
            <Text className="mb-3 text-center font-ko text-ko-12 text-main">
              {remoteErrorText(create.error)}
            </Text>
          ) : null}
          <Button disabled={!canSubmit} onPress={submit}>
            추가하기
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
