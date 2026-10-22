import { useRef } from 'react'
import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native'

import { CloseCircleIcon, MoreVerticalIcon, TitleBarIcon } from '@/components/icons'
import type { MissionRecord } from '@/features/record/types'
import { formatDotDate } from '@/lib/date'
import { cn } from '@/lib/cn'
import { colors } from '@/theme'

export type AnchorRect = { x: number; y: number; width: number; height: number }

type Props = {
  record: MissionRecord
  nickname: string
  isCover: boolean
  onPressCover: () => void
  /** 더보기 버튼의 화면 위치를 넘겨서 메뉴를 그 아래에 띄운다 */
  onPressMore: (anchor: AnchorRect) => void
  /** 첫 기록에만 닫기 버튼이 붙는다 */
  onClose?: () => void
}

/** Figma: 데일리 피드의 기록 하나 (작성자 · 사진 · 대표 사진 버튼 · 제목 · 본문 · 날짜와 장소) */
export function FeedItem({ record, nickname, isCover, onPressCover, onPressMore, onClose }: Props) {
  const { width } = useWindowDimensions()
  const moreRef = useRef<View>(null)

  return (
    <View>
      <View className="h-[30px] flex-row items-center justify-between pl-5 pr-5">
        <View className="flex-row items-center gap-2">
          <View className="h-[30px] w-[30px] items-center justify-center rounded-full border border-ink bg-white">
            <Text className="font-en-medium text-[10px] text-ink">
              {nickname.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="font-en-medium text-en-12 text-ink">{nickname}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <View ref={moreRef} collapsable={false}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="기록 메뉴"
              hitSlop={8}
              onPress={() =>
                moreRef.current?.measureInWindow((x, y, w, h) =>
                  onPressMore({ x, y, width: w, height: h }),
                )
              }
              className="h-6 w-6 items-center justify-center"
            >
              <MoreVerticalIcon width={4} height={20} color={colors.ink.DEFAULT} />
            </Pressable>
          </View>
          {onClose ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="닫기"
              hitSlop={8}
              onPress={onClose}
            >
              <CloseCircleIcon width={24} height={24} color={colors.ink.soft} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View className="mt-2" style={{ width, height: (width * 4) / 3 }}>
        <Image source={record.photo} className="h-full w-full" resizeMode="cover" />
        {/* Figma 주석: 기본은 가장 최근 피드가 대표 사진, 눌러서 직접 지정할 수도 있음 */}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: isCover }}
          accessibilityLabel={isCover ? '대표 사진' : '대표 사진으로 지정'}
          hitSlop={6}
          onPress={onPressCover}
          className={cn(
            'absolute left-5 top-5 rounded-lg px-2 py-1',
            isCover ? 'bg-main' : 'border border-line',
          )}
        >
          <Text className={cn('font-ko text-ko-12', isCover ? 'text-bg' : 'text-line')}>
            대표 사진
          </Text>
        </Pressable>
      </View>

      <View className="mt-[13px] flex-row items-center gap-3 px-6 py-2.5">
        <TitleBarIcon width={2} height={12} />
        <Text className="flex-1 font-en-medium text-en-16 text-ink">{record.title}</Text>
      </View>
      <Text className="px-5 font-en text-en-14 text-ink">{record.body}</Text>
      <View className="mt-3 flex-row gap-2.5 px-5">
        <Text className="font-ko text-ko-12 text-ink-soft">{formatDotDate(record.date)}</Text>
        {record.place ? (
          <>
            <Text className="font-ko text-ko-12 text-ink-faint">•</Text>
            <Text className="flex-shrink font-ko text-ko-12 text-ink-soft" numberOfLines={1}>
              {record.place}
            </Text>
          </>
        ) : null}
      </View>
    </View>
  )
}
