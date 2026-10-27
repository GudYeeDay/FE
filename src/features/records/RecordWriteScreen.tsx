import { useState } from 'react'
import { Image, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { RemoteMessage } from '@/api/RemoteMessage'
import { remoteErrorText, useSignedIn } from '@/api/http'
import { Button } from '@/components'
import { ChevronLeftIcon } from '@/components/icons'
import { formatDotDate, todayKey } from '@/features/mission/date'
import { useCompleteMission, useInProgressMission } from '@/features/mission/remote'
import { useMissions } from '@/features/mission/local'
import { colors } from '@/theme'

function pickPhoto(onPick: (uri: string) => void) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onPick(String(reader.result))
    reader.readAsDataURL(file)
  }
  input.click()
}

export function RecordWriteScreen() {
  const router = useRouter()
  const { bottom } = useSafeAreaInsets()
  const signedIn = useSignedIn()
  const query = useInProgressMission()
  const complete = useCompleteMission()
  const { addRecord } = useMissions()
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [place, setPlace] = useState('')
  const [placeOpen, setPlaceOpen] = useState(false)
  const [placeDraft, setPlaceDraft] = useState('')
  const [body, setBody] = useState('')
  const mission = query.data
  const date = todayKey()

  const save = () => {
    if (!mission || complete.isPending) return
    complete.mutate(undefined, {
      onSuccess: () => {
        addRecord({
          title: mission.title,
          body,
          date,
          place,
          photoUri: photoUri ?? undefined,
          missionId: String(mission.missionId),
        })
        router.dismissTo('/')
      },
    })
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
        <Text className="font-ko-medium text-ko-14 text-ink">완료 기록</Text>
      </View>

      {!signedIn ? (
        <RemoteMessage text="로그인 후 볼 수 있어요" login />
      ) : query.isLoading ? (
        <RemoteMessage text="불러오는 중" />
      ) : !mission ? (
        <RemoteMessage text="진행 중인 미션이 없습니다." />
      ) : (
        <>
          <ScrollView className="min-h-0 flex-1" contentContainerClassName="px-5 pb-8">
            <Pressable
              accessibilityRole="button"
              className="mt-2 h-48 items-center justify-center overflow-hidden rounded-2xl bg-bg"
              onPress={() => pickPhoto(setPhotoUri)}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} className="h-full w-full" resizeMode="cover" />
              ) : (
                <Text className="font-ko text-ko-14 text-ink-soft">사진 첨부</Text>
              )}
            </Pressable>

            <View className="mt-6 border-b border-line py-3">
              <Text className="font-ko text-ko-12 text-ink-soft">미션</Text>
              <Text className="mt-1 font-ko text-ko-16 text-ink">{mission.title}</Text>
            </View>
            <View className="border-b border-line py-3">
              <Text className="font-ko text-ko-12 text-ink-soft">날짜</Text>
              <Text className="mt-1 font-ko text-ko-16 text-ink">{formatDotDate(date)}</Text>
            </View>

            <Pressable accessibilityRole="button" className="border-b border-line py-4" onPress={() => {
              setPlaceDraft(place)
              setPlaceOpen(true)
            }}>
              <Text className="font-ko text-ko-14 text-ink">{place ? place : '위치 추가'}</Text>
            </Pressable>

            <Text className="mb-2 mt-6 font-ko-medium text-ko-14 text-ink">기록</Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="완료 소감을 적어주세요"
              placeholderTextColor={colors.ink.faint}
              multiline
              textAlignVertical="top"
              className="min-h-32 rounded-xl bg-bg px-4 py-3 font-ko text-ko-14 text-ink"
            />
            {complete.isError ? (
              <Text className="mt-3 font-ko text-ko-12 text-main">{remoteErrorText(complete.error)}</Text>
            ) : null}
          </ScrollView>
          <View className="px-5 pt-3" style={{ paddingBottom: Math.max(bottom, 16) }}>
            <Button disabled={complete.isPending} onPress={save}>
              {complete.isPending ? '저장 중' : '저장하기'}
            </Button>
          </View>
        </>
      )}

      {placeOpen ? (
        <View className="absolute inset-0 justify-end bg-black/40">
          <Pressable className="flex-1" onPress={() => setPlaceOpen(false)} />
          <View className="rounded-t-2xl bg-white px-5 pt-4" style={{ paddingBottom: Math.max(bottom, 20) }}>
            <Text className="font-ko-medium text-ko-14 text-ink">위치</Text>
            <TextInput
              value={placeDraft}
              onChangeText={setPlaceDraft}
              placeholder="장소 이름을 입력해주세요"
              placeholderTextColor={colors.ink.faint}
              className="mt-3 border-b border-line py-3 font-ko text-ko-14 text-ink"
            />
            <View className="mt-4">
              <Button
                onPress={() => {
                  setPlace(placeDraft.trim())
                  setPlaceOpen(false)
                }}
              >
                추가하기
              </Button>
            </View>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  )
}
