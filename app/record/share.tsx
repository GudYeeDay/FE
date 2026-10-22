import { useEffect, useRef, useState } from 'react'
import { Alert, Image, Text, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { captureRef } from 'react-native-view-shot'
import * as MediaLibrary from 'expo-media-library'

import { Button, Header } from '@/components'
import { CheckCircleLargeIcon } from '@/components/icons'
import { useRecordStore } from '@/features/record/store'
import { formatDotDate } from '@/lib/date'
import { colors } from '@/theme'

/** Figma 주석: 이미지 저장 완료 시 3초 노출 */
const DONE_MARK_MS = 3000

/**
 * Figma: 이미지로 저장 / 이미지로 저장 - 완료.
 * 기록 카드(사진 + 제목 + 본문 + 날짜·장소)를 그대로 캡처해서 사진 보관함에 저장한다.
 */
export default function ShareRecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const record = useRecordStore((s) => s.records.find((r) => r.id === id))
  const { bottom } = useSafeAreaInsets()
  const cardRef = useRef<View>(null)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showDoneMark, setShowDoneMark] = useState(false)

  useEffect(() => {
    if (!showDoneMark) return
    const timer = setTimeout(() => setShowDoneMark(false), DONE_MARK_MS)
    return () => clearTimeout(timer)
  }, [showDoneMark])

  if (!record) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header title="이미지로 저장" align="center" />
        <View className="flex-1 items-center justify-center">
          <Text className="font-ko text-ko-14 text-ink-soft">기록을 찾을 수 없어요</Text>
        </View>
      </SafeAreaView>
    )
  }

  const save = async () => {
    setSaving(true)
    try {
      const permission = await MediaLibrary.requestPermissionsAsync(true)
      if (!permission.granted) {
        Alert.alert('사진 보관함 접근 권한이 필요해요', '설정에서 사진 접근을 허용해 주세요.')
        return
      }
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 })
      await MediaLibrary.Asset.create(uri)
      setSaved(true)
      setShowDoneMark(true)
    } catch {
      Alert.alert('이미지를 저장하지 못했어요', '잠시 후 다시 시도해 주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <Header title="이미지로 저장" align="center" />

      <View className="flex-1 px-5">
        {/* 캡처되는 영역. 흰 배경을 깔아야 저장된 이미지 모서리가 투명해지지 않는다 */}
        <View ref={cardRef} collapsable={false} className="bg-white">
          <View className="gap-3 overflow-hidden rounded-2xl border border-line pb-3">
            <View className="aspect-[3/4] w-full bg-[#F5F5F5]">
              <Image source={record.photo} className="h-full w-full" resizeMode="cover" />
            </View>
            <View className="gap-1 px-4">
              <Text className="font-en-medium text-en-16 text-ink">{record.title}</Text>
              <Text className="font-en text-en-14 text-[#7D7D7D]">{record.body}</Text>
              <View className="flex-row gap-2.5">
                <Text className="font-ko text-ko-12 text-ink-soft">
                  {formatDotDate(record.date)}
                </Text>
                {record.place ? (
                  <>
                    <Text className="font-ko text-ko-12 text-ink-faint">•</Text>
                    <Text
                      className="flex-shrink font-ko text-ko-12 text-ink-soft"
                      numberOfLines={1}
                    >
                      {record.place}
                    </Text>
                  </>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="px-[30px] pt-3" style={{ paddingBottom: Math.max(bottom, 16) + 2 }}>
        <Button disabled={saving || saved} onPress={save}>
          이미지로 저장하기
        </Button>
      </View>

      {showDoneMark ? (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          accessibilityLabel="이미지를 저장했어요"
          className="absolute inset-0 items-center justify-center"
        >
          <CheckCircleLargeIcon width={68.67} height={68.67} color={colors.white} />
        </Animated.View>
      ) : null}
    </SafeAreaView>
  )
}
