import { useEffect, useState, type ReactNode } from 'react'
import { Image, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native'
import { useLocalSearchParams, useRouter, type Href } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  CloseIcon,
  DownloadIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from '@/components/feature-icons'
import RecordThumb from '../../../assets/images/record-thumb.svg'
import { downloadFeedCard } from '@/features/feed/saveImage'
import { formatDotDate } from '@/features/mission/date'
import { useMissions } from '@/features/mission/local'
import { useProfile } from '@/features/my/profile'
import { colors } from '@/theme'

export function FeedDetailScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { nickname } = useProfile()
  const { missions, feeds, deleteMission, deleteFeed } = useMissions()
  const [menu, setMenu] = useState(false)
  const [preview, setPreview] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(timer)
  }, [toast])

  const mission = missions.find((item) => item.id === id)
  const feed =
    feeds.find((item) => item.id === id) ?? feeds.find((item) => item.missionId === id)
  const title = feed?.title ?? mission?.title
  const body = feed?.body ?? mission?.memo
  const date = feed?.date ?? mission?.date
  const place = feed?.place
  const initial = nickname.trim().slice(0, 1) || 'P'
  const photoHeight = Math.round(height * 0.58)

  if (!title || !date) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="font-ko text-ko-14 text-ink-soft">기록을 찾을 수 없습니다.</Text>
      </View>
    )
  }

  const remove = () => {
    if (feed) deleteFeed(feed.id)
    if (mission) deleteMission(mission.id)
    router.back()
  }

  const headerHeight = 56
  const caption = `${formatDotDate(date)}${place ? `  •  ${place}` : ''}`

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="bg-white" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4" style={{ height: headerHeight }}>
          <View className="h-9 w-9 items-center justify-center rounded-full border border-ink">
            <Text className="font-ko-medium text-ko-14 text-ink">{initial}</Text>
          </View>
          <Text className="ml-2 font-ko-medium text-ko-14 text-ink">{nickname}</Text>
          <View className="flex-1" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="더보기"
            hitSlop={8}
            onPress={() => setMenu((open) => !open)}
          >
            <MoreHorizontalIcon width={22} height={22} color={colors.ink.DEFAULT} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="닫기"
            hitSlop={8}
            className="ml-3 h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: '#F0F0F0' }}
            onPress={() => router.back()}
          >
            <CloseIcon width={18} height={18} color={colors.ink.DEFAULT} />
          </Pressable>
        </View>
      </View>

      <ScrollView className="min-h-0 flex-1" showsVerticalScrollIndicator={false}>
        <View style={{ height: photoHeight }}>
          {feed?.photoUri ? (
            <Image source={{ uri: feed.photoUri }} style={{ width, height: photoHeight }} resizeMode="cover" />
          ) : (
            <RecordThumb width={width} height={photoHeight} preserveAspectRatio="xMidYMid slice" />
          )}
          <View className="absolute left-4 top-4 rounded-md bg-main px-2 py-1">
            <Text className="font-ko-medium text-ko-12 text-white">대표 사진</Text>
          </View>
        </View>

        <View className="px-5 pb-10 pt-6">
          <View className="flex-row">
            <View className="mr-2 mt-1 h-5 w-[3px] rounded-full bg-main" />
            <Text className="flex-1 font-ko-bold text-[18px] leading-7 text-ink">{title}</Text>
          </View>
          {body ? (
            <Text className="mt-4 font-ko text-ko-14 leading-6 text-ink">{body}</Text>
          ) : null}
          <Text className="mt-4 font-ko text-ko-12 text-ink-soft">
            {formatDotDate(date)}
            {place ? `  •  ${place}` : ''}
          </Text>
        </View>
      </ScrollView>

      {menu ? (
        <>
          <Pressable className="absolute inset-0" onPress={() => setMenu(false)} />
          <View
            className="absolute right-4 w-44 rounded-2xl bg-white px-4 py-2"
            style={{
              top: insets.top + headerHeight - 4,
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            }}
          >
            <MenuRow
              icon={<DownloadIcon width={18} height={18} color={colors.ink.DEFAULT} />}
              label="이미지로 저장"
              onPress={() => {
                setMenu(false)
                setPreview(true)
              }}
            />
            {feed ? (
              <MenuRow
                icon={<PencilIcon width={18} height={18} color={colors.ink.DEFAULT} />}
                label="기록 수정"
                onPress={() => {
                  setMenu(false)
                  router.push(`/feed/edit/${feed.id}` as Href)
                }}
              />
            ) : null}
            <MenuRow
              icon={<TrashIcon width={18} height={18} color={colors.main.DEFAULT} />}
              label="기록 삭제"
              danger
              onPress={remove}
            />
          </View>
        </>
      ) : null}

      <Modal visible={preview} transparent animationType="fade" onRequestClose={() => setPreview(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full overflow-hidden rounded-2xl bg-ink">
            {feed?.photoUri ? (
              <Image source={{ uri: feed.photoUri }} style={{ width: '100%', height: 280 }} resizeMode="cover" />
            ) : (
              <View className="h-52 items-center justify-center">
                <Text className="font-ko text-ko-14 text-white">대표 사진</Text>
              </View>
            )}
            <View className="px-4 py-4">
              <Text className="font-ko-bold text-ko-16 text-white">{title}</Text>
              <Text className="mt-1 font-ko text-ko-12 text-white/80">{caption}</Text>
            </View>
          </View>
          <View className="mt-4 w-full gap-2">
            <Pressable
              accessibilityRole="button"
              className="h-12 items-center justify-center rounded-lg bg-main"
              onPress={() => {
                void downloadFeedCard({ photoUri: feed?.photoUri, title, caption }).then((saved) => {
                  setPreview(false)
                  setToast(saved ? '앨범에 저장했어요' : '이 기기에서는 앨범 저장을 지원하지 않아요')
                })
              }}
            >
              <Text className="font-ko-medium text-ko-14 text-white">앨범에 저장</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="h-12 items-center justify-center rounded-lg bg-white"
              onPress={() => setPreview(false)}
            >
              <Text className="font-ko-medium text-ko-14 text-ink">닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {toast ? (
        <View className="absolute bottom-10 left-0 right-0 items-center">
          <View className="rounded-full bg-ink px-4 py-2">
            <Text className="font-ko text-ko-12 text-white">{toast}</Text>
          </View>
        </View>
      ) : null}
    </View>
  )
}

function MenuRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: ReactNode
  label: string
  onPress: () => void
  danger?: boolean
}) {
  return (
    <Pressable accessibilityRole="button" className="flex-row items-center gap-3 py-3" onPress={onPress}>
      {icon}
      <Text className={danger ? 'font-ko text-ko-14 text-main' : 'font-ko text-ko-14 text-ink'}>
        {label}
      </Text>
    </Pressable>
  )
}
