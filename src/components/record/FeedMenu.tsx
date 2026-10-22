import type { ReactNode } from 'react'
import { Pressable, Text, View, useWindowDimensions } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { DownloadIcon, PenSmallIcon, TrashSmallIcon } from '@/components/icons'
import { colors } from '@/theme'
import type { AnchorRect } from './FeedItem'

const MENU_WIDTH = 137
const SCREEN_RIGHT_GAP = 22

type Props = {
  anchor: AnchorRect | null
  onClose: () => void
  onSaveImage: () => void
  onEdit: () => void
  onDelete: () => void
}

/**
 * Figma: 데일리 피드 더보기 메뉴 (이미지로 저장 · 기록 수정 · 기록 삭제). 더보기 버튼 아래 오른쪽에 뜬다.
 * Modal 로 띄우면 iOS 에서 닫히는 도중에 한 화면 이동이 무시되므로, 화면 맨 위에 겹치는 레이어로 그린다.
 * 화면 최상위(창 원점 기준) View 의 마지막 자식으로 넣어야 좌표가 맞는다.
 */
export function FeedMenu({ anchor, onClose, onSaveImage, onEdit, onDelete }: Props) {
  const { width } = useWindowDimensions()

  if (!anchor) return null

  return (
    <Animated.View
      entering={FadeIn.duration(120)}
      exiting={FadeOut.duration(120)}
      className="absolute inset-0"
    >
      <Pressable accessibilityLabel="메뉴 닫기" className="flex-1" onPress={onClose} />
      <View
        accessibilityRole="menu"
        className="absolute rounded-[20px] px-2 py-3"
        style={{
          width: MENU_WIDTH,
          top: anchor.y + anchor.height + 21,
          left: width - SCREEN_RIGHT_GAP - MENU_WIDTH,
          backgroundColor: 'rgba(250, 250, 250, 0.96)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 25,
          elevation: 10,
        }}
      >
        <MenuItem
          icon={<DownloadIcon width={16} height={16} color={colors.ink.DEFAULT} />}
          label="이미지로 저장"
          onPress={onSaveImage}
        />
        <MenuItem
          icon={<PenSmallIcon width={16} height={16} color={colors.ink.DEFAULT} />}
          label="기록 수정"
          onPress={onEdit}
        />
        <MenuItem
          icon={<TrashSmallIcon width={16} height={16} color={colors.main.DEFAULT} />}
          label="기록 삭제"
          destructive
          onPress={onDelete}
        />
      </View>
    </Animated.View>
  )
}

function MenuItem({
  icon,
  label,
  destructive,
  onPress,
}: {
  icon: ReactNode
  label: string
  destructive?: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="menuitem"
      onPress={onPress}
      className="flex-row items-center gap-2 rounded-lg p-2 active:bg-line"
    >
      {icon}
      <Text className={`font-ko text-ko-12 ${destructive ? 'text-main' : 'text-ink'}`}>
        {label}
      </Text>
    </Pressable>
  )
}
