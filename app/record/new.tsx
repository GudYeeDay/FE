import { useState } from 'react'
import { Image, Pressable, Text, TextInput, View, type ImageSourcePropType } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'

import { Button, Header } from '@/components'
import { FormScreen } from '@/components/auth/FormScreen'
import { LocationIcon, PlusLineIcon, TitleBarIcon } from '@/components/icons'
import { LocationSheet } from '@/components/record/LocationSheet'
import { missionActions, useMissionStore } from '@/features/mission/store'
import { recordActions, useRecordStore } from '@/features/record/store'
import { formatSpacedDate, todayISO } from '@/lib/date'
import { colors } from '@/theme'

const BODY_MAX = 300

/**
 * Figma: 미션 완료 기록 (빈 상태 / 사진 있음 / 활성), 수정.
 * 진행 중인 미션을 기록하고, ?id= 가 있으면 그 기록을 수정한다.
 * 사진과 글이 있어야 저장할 수 있고 위치는 선택이다.
 */
export default function RecordFormScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const active = useMissionStore((s) => s.active)
  const editing = useRecordStore((s) => s.records.find((r) => r.id === id))

  const [photo, setPhoto] = useState<ImageSourcePropType | null>(editing?.photo ?? null)
  const [body, setBody] = useState(editing?.body ?? '')
  const [place, setPlace] = useState(editing?.place ?? '')
  const [locationOpen, setLocationOpen] = useState(false)

  // Figma 주석: 미션 정보와 날짜는 자동으로 불러온다
  const missionTitle = editing?.title ?? active?.title
  const date = editing?.date ?? todayISO()
  const canSubmit = !!photo && body.trim().length > 0

  if (!missionTitle) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header title="미션 기록" align="center" />
        <View className="flex-1 items-center justify-center">
          <Text className="font-ko text-ko-14 text-ink-soft">기록할 미션이 없어요</Text>
        </View>
      </SafeAreaView>
    )
  }

  const pickPhoto = async () => {
    // iOS 기본 편집 화면은 정사각형 자르기만 지원해서 편집은 끄고, 3:4 칸에 cover 로 채운다
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (!result.canceled) setPhoto({ uri: result.assets[0].uri })
  }

  const submit = () => {
    if (!photo) return
    const input = { photo, body: body.trim(), place }
    // TODO: 기록 생성/수정 API 연동 (사진 업로드 포함)
    if (editing) {
      recordActions.update(editing.id, input)
      router.back()
      return
    }
    if (!active) return
    const record = recordActions.add(active, input)
    missionActions.complete()
    // Figma 프로토타입: 기록 저장 → 그날의 데일리 피드
    router.replace({ pathname: '/feed/[date]', params: { date: record.date, from: 'record' } })
  }

  return (
    <FormScreen
      title={editing ? '미션 수정' : '미션 기록'}
      contentClassName="px-5 pt-1 pb-8"
      footer={
        <Button disabled={!canSubmit} onPress={submit}>
          기록 저장하기
        </Button>
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={photo ? '사진 바꾸기' : '사진 추가'}
        onPress={pickPhoto}
        className="h-[273px] w-[205px] items-center justify-center self-center overflow-hidden border border-line active:opacity-80"
      >
        {photo ? (
          <Image source={photo} className="h-full w-full" resizeMode="cover" />
        ) : (
          <>
            <PlusLineIcon width={24} height={24} color={colors.ink.faint} />
            <Text className="mt-2.5 font-ko text-ko-12 text-ink-faint">사진 추가</Text>
          </>
        )}
      </Pressable>

      <View className="mt-[18px] h-9 flex-row items-center gap-3 pl-2 pr-4">
        <TitleBarIcon width={2} height={12} />
        <Text className="flex-1 font-en text-en-14 text-ink" numberOfLines={1}>
          {missionTitle}
        </Text>
      </View>

      {/* Figma 주석: 길어지면 밑으로 스크롤 */}
      <View className="mt-1.5 h-[193px] rounded-lg border border-line px-3 py-2.5">
        <TextInput
          className="flex-1 p-0 font-ko text-ko-12 text-ink"
          placeholder="오늘의 기록을 남겨보세요"
          placeholderTextColor={colors.ink.faint}
          maxLength={BODY_MAX}
          multiline
          textAlignVertical="top"
          value={body}
          onChangeText={setBody}
          autoCorrect={false}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={place ? `위치 ${place}, 바꾸기` : '위치 추가'}
        onPress={() => setLocationOpen(true)}
        className="mt-4 flex-row items-center gap-2 self-start rounded-lg border border-line p-1 active:opacity-60"
      >
        <LocationIcon width={16} height={16} color={place ? colors.ink.soft : colors.ink.faint} />
        <Text className={`font-ko text-ko-12 ${place ? 'text-ink' : 'text-ink-soft'}`}>
          {place || '위치 추가'}
        </Text>
      </Pressable>

      <Text className="mt-2 font-ko text-ko-12 text-ink-soft">{formatSpacedDate(date)}</Text>

      <LocationSheet
        visible={locationOpen}
        initialValue={place}
        onClose={() => setLocationOpen(false)}
        onSubmit={(value) => {
          setPlace(value)
          setLocationOpen(false)
        }}
      />
    </FormScreen>
  )
}
